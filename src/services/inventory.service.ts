import { InventoryMovementType } from "@prisma/client";

import { inventoryModel } from "../models/inventory.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  AdjustInventoryInput,
  InventoryVariantIdParams,
  ListInventoryMovementsQuery,
  ListInventoryQuery,
  ListLowStockQuery,
} from "../validations/inventory.validation.js";

interface InventoryListResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const buildPagination = (page: number, limit: number, total: number) => {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
};

const listInventory = async (query: ListInventoryQuery) => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await inventoryModel.listInventoryVariants({
    skip,
    take: limit,
    search: query.search,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });

  return {
    items: result.variants.map((variant) => ({
      ...variant,
      isLowStock: variant.stock <= query.threshold,
    })),
    pagination: buildPagination(page, limit, result.total),
  };
};

const listLowStock = async (query: ListLowStockQuery) => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await inventoryModel.listLowStockVariants({
    skip,
    take: limit,
    search: query.search,
    threshold: query.threshold,
    sortBy: query.sortBy,
    sortOrder: query.sortOrder,
  });

  return {
    items: result.variants.map((variant) => ({
      ...variant,
      threshold: query.threshold,
    })),
    pagination: buildPagination(page, limit, result.total),
  };
};

const listInventoryMovements = async (
  params: InventoryVariantIdParams,
  query: ListInventoryMovementsQuery,
): Promise<InventoryListResult<Awaited<ReturnType<typeof inventoryModel.listInventoryMovements>>["movements"][number]>> => {
  const existing = await inventoryModel.findInventoryVariantById(params.productVariantId);

  if (!existing) {
    throw new AppError("Product variant not found", 404);
  }

  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await inventoryModel.listInventoryMovements({
    productVariantId: params.productVariantId,
    skip,
    take: limit,
    sortOrder: query.sortOrder,
  });

  return {
    items: result.movements,
    pagination: buildPagination(page, limit, result.total),
  };
};

const adjustInventoryStock = async (
  params: InventoryVariantIdParams,
  input: AdjustInventoryInput,
) => {
  const existing = await inventoryModel.findInventoryVariantById(params.productVariantId);

  if (!existing) {
    throw new AppError("Product variant not found", 404);
  }

  let nextStock = existing.stock;
  let movementType: InventoryMovementType = InventoryMovementType.set;

  if (input.operation === "set") {
    nextStock = input.quantity;
    movementType = InventoryMovementType.set;
  }

  if (input.operation === "increase") {
    nextStock = existing.stock + input.quantity;
    movementType = InventoryMovementType.increase;
  }

  if (input.operation === "decrease") {
    nextStock = existing.stock - input.quantity;
    movementType = InventoryMovementType.decrease;
  }

  if (nextStock < 0) {
    throw new AppError("Stock cannot go below zero", 400);
  }

  return inventoryModel.adjustInventoryStock({
    productVariantId: params.productVariantId,
    nextStock,
    type: movementType,
    reason: input.reason,
    referenceType: "inventory",
  });
};

export const inventoryService = {
  listInventory,
  listLowStock,
  listInventoryMovements,
  adjustInventoryStock,
};
