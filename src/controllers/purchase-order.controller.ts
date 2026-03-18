import type { Request, RequestHandler } from "express";

import { purchaseOrderService } from "../services/purchase-order.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  CreatePurchaseOrderInput,
  ListPurchaseOrdersQuery,
  PurchaseOrderIdParams,
  ReceivePurchaseOrderInput,
} from "../validations/purchase-order.validation.js";

type CreatePurchaseOrderRequest = Request<Record<string, never>, unknown, CreatePurchaseOrderInput>;
type GetPurchaseOrderRequest = Request<PurchaseOrderIdParams>;
type ListPurchaseOrdersRequest = Request<
  Record<string, string>,
  unknown,
  unknown,
  ListPurchaseOrdersQuery
>;
type ReceivePurchaseOrderRequest = Request<
  PurchaseOrderIdParams,
  unknown,
  ReceivePurchaseOrderInput
>;

const createPurchaseOrder: RequestHandler = async (request, response, next) => {
  try {
    const purchaseOrder = await purchaseOrderService.createPurchaseOrder(
      (request as CreatePurchaseOrderRequest).body,
    );

    sendSuccessResponse(response, 201, purchaseOrder, "Purchase order created successfully");
  } catch (error) {
    next(error);
  }
};

const getPurchaseOrder: RequestHandler = async (request, response, next) => {
  try {
    const purchaseOrder = await purchaseOrderService.getPurchaseOrderById(
      (request as GetPurchaseOrderRequest).params.id,
    );

    sendSuccessResponse(response, 200, purchaseOrder, "Purchase order retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const listPurchaseOrders: RequestHandler = async (request, response, next) => {
  try {
    const result = await purchaseOrderService.listPurchaseOrders(
      (request as unknown as ListPurchaseOrdersRequest).query,
    );

    sendSuccessResponse(response, 200, result, "Purchase orders retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const receivePurchaseOrder: RequestHandler = async (request, response, next) => {
  try {
    const typedRequest = request as ReceivePurchaseOrderRequest;
    const purchaseOrder = await purchaseOrderService.receivePurchaseOrder(
      typedRequest.params.id,
      typedRequest.body,
    );

    sendSuccessResponse(response, 200, purchaseOrder, "Purchase order received successfully");
  } catch (error) {
    next(error);
  }
};

export const purchaseOrderController = {
  createPurchaseOrder,
  getPurchaseOrder,
  listPurchaseOrders,
  receivePurchaseOrder,
};
