import type { PaymentStatus, Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const paymentCustomerSelect = {
  id: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

const paymentOrderSelect = {
  id: true,
  orderNumber: true,
  customerId: true,
  totalAmount: true,
  status: true,
  customer: {
    select: paymentCustomerSelect,
  },
} satisfies Prisma.OrderSelect;

const publicPaymentSelect = {
  id: true,
  orderId: true,
  order: {
    select: paymentOrderSelect,
  },
  amount: true,
  provider: true,
  reference: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.PaymentSelect;

export type PaymentRecord = Prisma.PaymentGetPayload<{
  select: typeof publicPaymentSelect;
}>;

export interface CreatePaymentRecordData {
  orderId: string;
  amount: number;
  provider?: string;
  reference?: string;
  status?: PaymentStatus;
}

export interface ListPaymentsOptions {
  skip: number;
  take: number;
  status?: PaymentStatus;
  orderId?: string;
  sortBy: Prisma.PaymentScalarFieldEnum;
  sortOrder: Prisma.SortOrder;
}

const buildPaymentWhereInput = (
  options: Pick<ListPaymentsOptions, "status" | "orderId">,
): Prisma.PaymentWhereInput => {
  const andConditions: Prisma.PaymentWhereInput[] = [];

  if (options.status) {
    andConditions.push({
      status: options.status,
    });
  }

  if (options.orderId) {
    andConditions.push({
      orderId: options.orderId,
    });
  }

  if (andConditions.length === 0) {
    return {};
  }

  return {
    AND: andConditions,
  };
};

const findPaymentById = async (id: string): Promise<PaymentRecord | null> => {
  return prisma.payment.findUnique({
    where: { id },
    select: publicPaymentSelect,
  });
};

const findPaymentByOrderId = async (orderId: string): Promise<PaymentRecord | null> => {
  return prisma.payment.findUnique({
    where: { orderId },
    select: publicPaymentSelect,
  });
};

const createPayment = async (data: CreatePaymentRecordData): Promise<PaymentRecord> => {
  return prisma.payment.create({
    data,
    select: publicPaymentSelect,
  });
};

const updatePaymentStatus = async (
  id: string,
  status: PaymentStatus,
): Promise<PaymentRecord> => {
  return prisma.payment.update({
    where: { id },
    data: { status },
    select: publicPaymentSelect,
  });
};

const listPayments = async (options: ListPaymentsOptions) => {
  const where = buildPaymentWhereInput(options);

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: {
        [options.sortBy]: options.sortOrder,
      },
      select: publicPaymentSelect,
    }),
    prisma.payment.count({ where }),
  ]);

  return {
    payments,
    total,
  };
};

export const paymentModel = {
  findPaymentById,
  findPaymentByOrderId,
  createPayment,
  updatePaymentStatus,
  listPayments,
};
