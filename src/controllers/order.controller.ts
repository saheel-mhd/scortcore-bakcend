import type { Request, RequestHandler } from "express";

import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { orderService } from "../services/order.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  CreateOrderInput,
  ListOrdersQuery,
  ListUserOrdersQuery,
  OrderIdParams,
  UpdateOrderStatusInput,
} from "../validations/order.validation.js";

type CreateOrderRequest = Request<Record<string, never>, unknown, CreateOrderInput>;
type GetOrderRequest = Request<OrderIdParams>;
type ListOrdersRequest = Request<Record<string, string>, unknown, unknown, ListOrdersQuery>;
type ListUserOrdersRequest = Request<Record<string, string>, unknown, unknown, ListUserOrdersQuery>;
type UpdateOrderStatusRequest = Request<OrderIdParams, unknown, UpdateOrderStatusInput>;

const createOrder: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest & CreateOrderRequest;
    const order = await orderService.createOrder(authenticatedRequest.body, authenticatedRequest.user!);

    sendSuccessResponse(response, 201, order, "Order created successfully");
  } catch (error) {
    next(error);
  }
};

const getOrder: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest & GetOrderRequest;
    const order = await orderService.getOrderById(authenticatedRequest.params.id, authenticatedRequest.user!);

    sendSuccessResponse(response, 200, order, "Order retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const listUserOrders: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest;
    const result = await orderService.listUserOrders(
      (request as unknown as ListUserOrdersRequest).query,
      authenticatedRequest.user!,
    );

    sendSuccessResponse(response, 200, result, "User orders retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const listOrders: RequestHandler = async (request, response, next) => {
  try {
    const result = await orderService.listOrders((request as unknown as ListOrdersRequest).query);

    sendSuccessResponse(response, 200, result, "All orders retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus: RequestHandler = async (request, response, next) => {
  try {
    const typedRequest = request as UpdateOrderStatusRequest;
    const order = await orderService.updateOrderStatus(typedRequest.params.id, typedRequest.body);

    sendSuccessResponse(response, 200, order, "Order status updated successfully");
  } catch (error) {
    next(error);
  }
};

const deleteOrder: RequestHandler = async (request, response, next) => {
  try {
    const order = await orderService.deleteOrder((request as GetOrderRequest).params.id);

    sendSuccessResponse(response, 200, order, "Order deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const orderController = {
  createOrder,
  getOrder,
  listUserOrders,
  listOrders,
  updateOrderStatus,
  deleteOrder,
};
