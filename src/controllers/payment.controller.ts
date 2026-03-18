import type { Request, RequestHandler } from "express";

import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { paymentService } from "../services/payment.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  CreatePaymentInput,
  ListPaymentsQuery,
  PaymentIdParams,
  PaymentOrderIdParams,
  UpdatePaymentStatusInput,
} from "../validations/payment.validation.js";

type CreatePaymentRequest = Request<Record<string, never>, unknown, CreatePaymentInput>;
type GetPaymentRequest = Request<PaymentIdParams>;
type GetPaymentByOrderRequest = Request<PaymentOrderIdParams>;
type ListPaymentsRequest = Request<Record<string, string>, unknown, unknown, ListPaymentsQuery>;
type UpdatePaymentStatusRequest = Request<PaymentIdParams, unknown, UpdatePaymentStatusInput>;

const createPayment: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest & CreatePaymentRequest;
    const payment = await paymentService.createPayment(
      authenticatedRequest.body,
      authenticatedRequest.user!,
    );

    sendSuccessResponse(response, 201, payment, "Payment created successfully");
  } catch (error) {
    next(error);
  }
};

const getPayment: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest & GetPaymentRequest;
    const payment = await paymentService.getPaymentById(
      authenticatedRequest.params.id,
      authenticatedRequest.user!,
    );

    sendSuccessResponse(response, 200, payment, "Payment retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const getPaymentByOrderId: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest & GetPaymentByOrderRequest;
    const payment = await paymentService.getPaymentByOrderId(
      authenticatedRequest.params.orderId,
      authenticatedRequest.user!,
    );

    sendSuccessResponse(response, 200, payment, "Payment retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const listPayments: RequestHandler = async (request, response, next) => {
  try {
    const result = await paymentService.listPayments(
      (request as unknown as ListPaymentsRequest).query,
    );

    sendSuccessResponse(response, 200, result, "Payments retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const updatePaymentStatus: RequestHandler = async (request, response, next) => {
  try {
    const typedRequest = request as UpdatePaymentStatusRequest;
    const payment = await paymentService.updatePaymentStatus(
      typedRequest.params.id,
      typedRequest.body,
    );

    sendSuccessResponse(response, 200, payment, "Payment status updated successfully");
  } catch (error) {
    next(error);
  }
};

export const paymentController = {
  createPayment,
  getPayment,
  getPaymentByOrderId,
  listPayments,
  updatePaymentStatus,
};
