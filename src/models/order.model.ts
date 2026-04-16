import type {
  InventoryMovementType,
  OrderStatus,
  Prisma,
  User,
} from "@prisma/client";

import { prisma } from "../config/prisma.js";

const orderCustomerSelect = {
  id: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

const orderPaymentSelect = {
  id: true,
  amount: true,
  provider: true,
  reference: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PaymentSelect;

const orderCouponSelect = {
  id: true,
  code: true,
  type: true,
  value: true,
} satisfies Prisma.CouponSelect;

const publicOrderSelect = {
  id: true,
  orderNumber: true,
  customerId: true,
  customer: {
    select: orderCustomerSelect,
  },
  couponId: true,
  coupon: {
    select: orderCouponSelect,
  },
  items: true,
  subtotalAmount: true,
  discountAmount: true,
  totalAmount: true,
  status: true,
  payment: {
    select: orderPaymentSelect,
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.OrderSelect;

export type OrderRecord = Prisma.OrderGetPayload<{
  select: typeof publicOrderSelect;
}>;

export interface CreateOrderRecordData {
  orderNumber: string;
  customerId: string;
  items: Prisma.InputJsonValue;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponId?: string;
  status?: OrderStatus;
}

export interface OrderListOptions {
  skip: number;
  take: number;
  status?: OrderStatus;
  customerId?: string;
  sortBy: Prisma.OrderScalarFieldEnum;
  sortOrder: Prisma.SortOrder;
}

export interface OrderItemStockInput {
  productVariantId: string;
  quantity: number;
}

const buildOrderWhereInput = (
  options: Pick<OrderListOptions, "status" | "customerId">,
): Prisma.OrderWhereInput => {
  const andConditions: Prisma.OrderWhereInput[] = [];

  if (options.status) {
    andConditions.push({
      status: options.status,
    });
  }

  if (options.customerId) {
    andConditions.push({
      customerId: options.customerId,
    });
  }

  if (andConditions.length === 0) {
    return {};
  }

  return {
    AND: andConditions,
  };
};

const findUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

const findOrderById = async (id: string): Promise<OrderRecord | null> => {
  return prisma.order.findUnique({
    where: { id },
    select: publicOrderSelect,
  });
};

const listOrders = async (options: OrderListOptions) => {
  const where = buildOrderWhereInput(options);

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: {
        [options.sortBy]: options.sortOrder,
      },
      select: publicOrderSelect,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    total,
  };
};

const updateOrderStatus = async (id: string, status: OrderStatus): Promise<OrderRecord> => {
  return prisma.order.update({
    where: { id },
    data: { status },
    select: publicOrderSelect,
  });
};

interface UpdateOrderPricingData {
  couponId?: string | null;
  discountAmount: number;
  totalAmount: number;
}

const updateOrderPricing = async (
  id: string,
  data: UpdateOrderPricingData,
): Promise<OrderRecord> => {
  return prisma.order.update({
    where: { id },
    data,
    select: publicOrderSelect,
  });
};

const deleteOrder = async (id: string): Promise<OrderRecord> => {
  return prisma.$transaction(async (transaction) => {
    await transaction.payment.deleteMany({
      where: { orderId: id },
    });

    return transaction.order.delete({
      where: { id },
      select: publicOrderSelect,
    });
  });
};

const createOrderWithStockUpdate = async (
  data: CreateOrderRecordData,
  itemStockInputs: OrderItemStockInput[],
): Promise<OrderRecord> => {
  return prisma.$transaction(async (transaction) => {
    const variants = await transaction.productVariant.findMany({
      where: {
        id: {
          in: itemStockInputs.map((item) => item.productVariantId),
        },
      },
      include: {
        product: true,
        unit: { include: { category: true } },
      },
    });

    if (variants.length !== itemStockInputs.length) {
      throw new Error("One or more product variants were not found");
    }

    const variantMap = new Map(variants.map((variant) => [variant.id, variant]));

    for (const item of itemStockInputs) {
      const variant = variantMap.get(item.productVariantId);

      if (!variant) {
        throw new Error("One or more product variants were not found");
      }

      if (!variant.product.isActive) {
        throw new Error(`Product ${variant.product.name} is inactive and cannot be ordered`);
      }

      if (variant.stock < item.quantity) {
        throw new Error(
          `Insufficient stock for ${variant.product.name} (${variant.unit.shortName})`,
        );
      }
    }

    await Promise.all(
      itemStockInputs.map((item) =>
        transaction.productVariant.update({
          where: { id: item.productVariantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        }),
      ),
    );

    const createdOrder = await transaction.order.create({
      data,
      select: publicOrderSelect,
    });

    await Promise.all(
      itemStockInputs.map((item) => {
        const variant = variantMap.get(item.productVariantId);

        if (!variant) {
          throw new Error("One or more product variants were not found");
        }

        return transaction.inventoryMovement.create({
          data: {
            productVariantId: item.productVariantId,
            type: "order" satisfies InventoryMovementType,
            quantityChange: -item.quantity,
            previousStock: variant.stock,
            nextStock: variant.stock - item.quantity,
            reason: `Stock deducted for order ${createdOrder.orderNumber}`,
            referenceType: "order",
            referenceId: createdOrder.id,
          },
        });
      }),
    );

    return createdOrder;
  });
};

export const orderModel = {
  findUserById,
  findOrderById,
  listOrders,
  updateOrderStatus,
  updateOrderPricing,
  deleteOrder,
  createOrderWithStockUpdate,
};
