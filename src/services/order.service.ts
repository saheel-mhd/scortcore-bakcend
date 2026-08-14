import type { Prisma, Role } from "@prisma/client";
import { OrderStatus } from "@prisma/client";
import { addressModel } from "../models/address.model.js";
import { orderModel } from "../models/order.model.js";
import { AppError } from "../utils/app-error.js";
import { priceCartItems } from "./cart-pricing.service.js";
import { couponService } from "./coupon.service.js";
import type { CancelOrderInput, CreateOrderInput, ListOrdersQuery, ListUserOrdersQuery, UpdateOrderStatusInput, } from "../validations/order.validation.js";

interface ShippingAddressSnapshot {
  addressId: string;
  label: string | null;
  fullName: string;
  phone: string | null;
  line1: string;
  line2: string | null;
  city: string;
  state: string | null;
  postalCode: string;
  country: string;
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
  pending: [OrderStatus.paid, OrderStatus.cancelled],
  paid: [OrderStatus.shipped, OrderStatus.cancelled],
  shipped: [OrderStatus.delivered],
  delivered: [],
  cancelled: [],
};

const customerCancellableStatuses: OrderStatus[] = [OrderStatus.pending];
const adminCancellableStatuses: OrderStatus[] = [OrderStatus.pending, OrderStatus.paid];

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

  const address = await addressModel.findById(input.addressId);

  if (!address || address.customerId !== customerId) {
    throw new AppError("Delivery address not found", 404);
  }

  const shippingAddress: ShippingAddressSnapshot = {
    addressId: address.id,
    label: address.label,
    fullName: address.fullName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
  };

  const { aggregatedItems, orderItems, subtotalAmount } = await priceCartItems(input.items);

  const couponResult = input.couponCode
    ? await couponService.resolveCouponDiscount(input.couponCode, subtotalAmount)
    : null;

  try {
    return await orderModel.createOrderWithStockUpdate(
      {
        orderNumber: generateOrderNumber(),
        customerId,
        addressId: address.id,
        shippingAddress: shippingAddress as unknown as Prisma.InputJsonValue,
        items: orderItems as unknown as Prisma.InputJsonValue,
        subtotalAmount,
        discountAmount: couponResult?.discountAmount ?? 0,
        totalAmount: couponResult?.totalAmount ?? subtotalAmount,
        ...(couponResult ? { couponId: couponResult.couponId } : {}),
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

const cancelOrder = async (
  id: string,
  input: CancelOrderInput,
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

  const cancellableFrom = isPrivilegedUser
    ? adminCancellableStatuses
    : customerCancellableStatuses;

  if (!cancellableFrom.includes(order.status)) {
    throw new AppError(
      order.status === OrderStatus.cancelled
        ? "This order is already cancelled"
        : `An order with status ${order.status} can no longer be cancelled`,
      400,
    );
  }

  try {
    return await orderModel.cancelOrderWithStockRestore(id, cancellableFrom, input.reason);
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(error.message, 400);
    }

    throw error;
  }
};

export const orderService = {
  createOrder,
  getOrderById,
  listUserOrders,
  listOrders,
  updateOrderStatus,
  deleteOrder,
  cancelOrder,
};
