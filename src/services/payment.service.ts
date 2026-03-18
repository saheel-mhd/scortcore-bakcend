import { OrderStatus, PaymentStatus, type Prisma, type Role } from "@prisma/client";

import { orderModel } from "../models/order.model.js";
import { paymentModel } from "../models/payment.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreatePaymentInput,
  ListPaymentsQuery,
  UpdatePaymentStatusInput,
} from "../validations/payment.validation.js";

interface ListPaymentsResult {
  payments: Awaited<ReturnType<typeof paymentModel.listPayments>>["payments"];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const paymentStatusTransitions: Record<PaymentStatus, PaymentStatus[]> = {
  pending: [PaymentStatus.paid, PaymentStatus.failed],
  paid: [PaymentStatus.refunded],
  failed: [PaymentStatus.pending, PaymentStatus.paid],
  refunded: [],
};

const ensureOrderAccess = (
  customerId: string,
  authenticatedUser: { id: string; role: Role },
): void => {
  if (authenticatedUser.role === "admin") {
    return;
  }

  if (customerId !== authenticatedUser.id) {
    throw new AppError("You are not authorized to access this payment", 403);
  }
};

const createPayment = async (
  input: CreatePaymentInput,
  authenticatedUser: { id: string; role: Role },
) => {
  const order = await orderModel.findOrderById(input.orderId);

  if (!order) {
    throw new AppError("Order not found", 404);
  }

  ensureOrderAccess(order.customerId, authenticatedUser);

  const existingPayment = await paymentModel.findPaymentByOrderId(input.orderId);

  if (existingPayment) {
    throw new AppError("Payment already exists for this order", 409);
  }

  return paymentModel.createPayment({
    orderId: order.id,
    amount: order.totalAmount,
    provider: input.provider,
    reference: input.reference,
    status: PaymentStatus.pending,
  });
};

const getPaymentById = async (
  id: string,
  authenticatedUser: { id: string; role: Role },
) => {
  const payment = await paymentModel.findPaymentById(id);

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  ensureOrderAccess(payment.order.customerId, authenticatedUser);

  return payment;
};

const getPaymentByOrderId = async (
  orderId: string,
  authenticatedUser: { id: string; role: Role },
) => {
  const payment = await paymentModel.findPaymentByOrderId(orderId);

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  ensureOrderAccess(payment.order.customerId, authenticatedUser);

  return payment;
};

const listPayments = async (query: ListPaymentsQuery): Promise<ListPaymentsResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await paymentModel.listPayments({
    skip,
    take: limit,
    status: query.status,
    orderId: query.orderId,
    sortBy: query.sortBy as Prisma.PaymentScalarFieldEnum,
    sortOrder: query.sortOrder,
  });

  const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / limit);

  return {
    payments: result.payments,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages,
    },
  };
};

const updatePaymentStatus = async (id: string, input: UpdatePaymentStatusInput) => {
  const payment = await paymentModel.findPaymentById(id);

  if (!payment) {
    throw new AppError("Payment not found", 404);
  }

  if (payment.status === input.status) {
    return payment;
  }

  const allowedNextStatuses = paymentStatusTransitions[payment.status];

  if (!allowedNextStatuses.includes(input.status)) {
    throw new AppError(
      `Invalid payment status transition from ${payment.status} to ${input.status}`,
      400,
    );
  }

  const updatedPayment = await paymentModel.updatePaymentStatus(id, input.status);

  if (input.status === PaymentStatus.paid && payment.order.status === OrderStatus.pending) {
    await orderModel.updateOrderStatus(payment.order.id, OrderStatus.paid);

    const refreshedPayment = await paymentModel.findPaymentById(id);

    if (refreshedPayment) {
      return refreshedPayment;
    }
  }

  return updatedPayment;
};

export const paymentService = {
  createPayment,
  getPaymentById,
  getPaymentByOrderId,
  listPayments,
  updatePaymentStatus,
};
