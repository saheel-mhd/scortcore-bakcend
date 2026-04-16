import type { Request, RequestHandler } from "express";

import { inventoryService } from "../services/inventory.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  AdjustInventoryInput,
  InventoryVariantIdParams,
  ListInventoryMovementsQuery,
  ListInventoryQuery,
  ListLowStockQuery,
} from "../validations/inventory.validation.js";

type ListInventoryRequest = Request<Record<string, string>, unknown, unknown, ListInventoryQuery>;
type ListLowStockRequest = Request<Record<string, string>, unknown, unknown, ListLowStockQuery>;
type InventoryMovementsRequest = Request<
  InventoryVariantIdParams,
  unknown,
  unknown,
  ListInventoryMovementsQuery
>;
type AdjustInventoryRequest = Request<InventoryVariantIdParams, unknown, AdjustInventoryInput>;

const listInventory: RequestHandler = async (request, response, next) => {
  try {
    const result = await inventoryService.listInventory(
      (request as unknown as ListInventoryRequest).query,
    );

    sendSuccessResponse(response, 200, result, "Inventory retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const listLowStock: RequestHandler = async (request, response, next) => {
  try {
    const result = await inventoryService.listLowStock(
      (request as unknown as ListLowStockRequest).query,
    );

    sendSuccessResponse(response, 200, result, "Low stock alerts retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const listInventoryMovements: RequestHandler = async (request, response, next) => {
  try {
    const typedRequest = request as unknown as InventoryMovementsRequest;
    const result = await inventoryService.listInventoryMovements(
      typedRequest.params,
      typedRequest.query,
    );

    sendSuccessResponse(response, 200, result, "Inventory movements retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const adjustInventoryStock: RequestHandler = async (request, response, next) => {
  try {
    const typedRequest = request as AdjustInventoryRequest;
    const product = await inventoryService.adjustInventoryStock(
      typedRequest.params,
      typedRequest.body,
    );

    sendSuccessResponse(response, 200, product, "Inventory stock updated successfully");
  } catch (error) {
    next(error);
  }
};

export const inventoryController = {
  listInventory,
  listLowStock,
  listInventoryMovements,
  adjustInventoryStock,
};
