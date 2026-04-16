import type { Prisma, Role } from "@prisma/client";
import { OrderStatus } from "@prisma/client";

import { prisma } from "../config/prisma.js";
import { orderModel } from "../models/order.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateOrderInput,
  ListOrdersQuery,
  ListUserOrdersQuery,
  UpdateOrderStatusInput,
} from "../validations/order.validation.js";

interface OrderItemSnapshot {
  productVariantId: string;
  productId: string;
  name: string;
  slug: string;
  sku: string;
  unitId: string;
  unitName: string;
  unitShortName: string;
  unitCategoryId: string;
  unitCategoryName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface ListOrdersResult {
  orders: Awaited<ReturnType<typeof orderModel.listOrders>>["orders"];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const orderStatusTransitions: Record<OrderStatus, OrderStatus[]> = {
  pending: [OrderStatus.paid],
  paid: [OrderStatus.shipped],
  shipped: [OrderStatus.delivered],
  delivered: [],
};

const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomSegment = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `ORD-${timestamp}-${randomSegment}`;
};

const createOrder = async (
  input: CreateOrderInput,
  authenticatedUser: { id: string; role: Role },
) => {
  const isPrivilegedUser = authenticatedUser.role === "admin";
  const customerId = isPrivilegedUser && input.customerId ? input.customerId : authenticatedUser.id;

  const customer = await orderModel.findUserById(customerId);

  if (!customer) {
    throw new AppError("Customer not found", 404);
  }

  if (customer.role !== "customer") {
    throw new AppError("Orders can only be linked to customer accounts", 400);
  }

  const aggregatedItems = Array.from(
    input.items.reduce((map, item) => {
      const currentQuantity = map.get(item.productVariantId) ?? 0;
      map.set(item.productVariantId, currentQuantity + item.quantity);
      return map;
    }, new Map<string, number>()),
  ).map(([productVariantId, quantity]) => ({
    productVariantId,
    quantity,
  }));

  const variantIds = aggregatedItems.map((item) => item.productVariantId);
  const variants = await prisma.productVariant.findMany({
    where: { id: { in: variantIds } },
    include: {
      product: true,
      unit: { include: { category: true } },
    },
  });

  if (variants.length !== variantIds.length) {
    throw new AppError("One or more product variants were not found", 404);
  }

  const variantMap = new Map(variants.map((variant) => [variant.id, variant]));

  const orderItems: OrderItemSnapshot[] = aggregatedItems.map((item) => {
    const variant = variantMap.get(item.productVariantId);

    if (!variant) {
      throw new AppError("One or more product variants were not found", 404);
    }

    if (!variant.product.isActive) {
      throw new AppError(
        `Product ${variant.product.name} is inactive and cannot be ordered`,
        400,
      );
    }

    if (variant.stock < item.quantity) {
      throw new AppError(
        `Insufficient stock for ${variant.product.name} (${variant.unit.shortName})`,
        400,
      );
    }

    return {
      productVariantId: variant.id,
      productId: variant.product.id,
      name: variant.product.name,
      slug: variant.product.slug,
      sku: variant.product.sku,
      unitId: variant.unit.id,
      unitName: variant.unit.name,
      unitShortName: variant.unit.shortName,
      unitCategoryId: variant.unit.category.id,
      unitCategoryName: variant.unit.category.name,
      quantity: item.quantity,
      unitPrice: variant.product.price,
      lineTotal: Number((variant.product.price * item.quantity).toFixed(2)),
    };
  });

  const totalAmount = Number(
    orderItems.reduce((total, item) => total + item.lineTotal, 0).toFixed(2),
  );

  try {
    return await orderModel.createOrderWithStockUpdate(
      {
        orderNumber: generateOrderNumber(),
        customerId,
        items: orderItems as unknown as Prisma.InputJsonValue,
        subtotalAmount: totalAmount,
        discountAmount: 0,
        totalAmount,
        status: OrderStatus.pending,
      },
      aggregatedItems,
    );
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(error.message, 400);
    }

    throw error;
  }
};

const getOrderById = async (
  id: string,
  authenticatedUser: { id: string; role: Role },
) => {
  const order = await orderModel.findOrderById(id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const isPrivilegedUser = authenticatedUser.role === "admin";

  if (!isPrivilegedUser && order.customerId !== authenticatedUser.id) {
    throw new AppError("You are not authorized to access this order", 403);
  }

  return order;
};

const buildOrderListResult = async (
  query: {
    page: number;
    limit: number;
    status?: OrderStatus;
    customerId?: string;
    sortBy: string;
    sortOrder: Prisma.SortOrder;
  },
): Promise<ListOrdersResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await orderModel.listOrders({
    skip,
    take: limit,
    status: query.status,
    customerId: query.customerId,
    sortBy: query.sortBy as Prisma.OrderScalarFieldEnum,
    sortOrder: query.sortOrder,
  });

  const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / limit);

  return {
    orders: result.orders,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages,
    },
  };
};

const listUserOrders = async (
  query: ListUserOrdersQuery,
  authenticatedUser: { id: string; role: Role },
): Promise<ListOrdersResult> => {
  return buildOrderListResult({
    ...query,
    customerId: authenticatedUser.id,
  });
};

const listOrders = async (query: ListOrdersQuery): Promise<ListOrdersResult> => {
  return buildOrderListResult(query);
};

const updateOrderStatus = async (
  id: string,
  input: UpdateOrderStatusInput,
) => {
  const order = await orderModel.findOrderById(id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  if (order.status === input.status) {
    return order;
  }

  const allowedNextStatuses = orderStatusTransitions[order.status];

  if (!allowedNextStatuses.includes(input.status)) {
    throw new AppError(
      `Invalid status transition from ${order.status} to ${input.status}`,
      400,
    );
  }

  return orderModel.updateOrderStatus(id, input.status);
};

const deleteOrder = async (id: string) => {
  const order = await orderModel.findOrderById(id);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  return orderModel.deleteOrder(id);
};

export const orderService = {
  createOrder,
  getOrderById,
  listUserOrders,
  listOrders,
  updateOrderStatus,
  deleteOrder,
};
