import { InventoryMovementType, type Prisma } from "@prisma/client";

import { inventoryModel } from "../models/inventory.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  AdjustInventoryInput,
  InventoryProductIdParams,
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

const listInventory = async (query: ListInventoryQuery): Promise<InventoryListResult<{
  id: string;
  name: string;
  slug: string;
  sku: string;
  stock: number;
  isActive: boolean;
  isLowStock: boolean;
  createdAt: Date;
  updatedAt: Date;
}>> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await inventoryModel.listInventoryProducts({
    skip,
    take: limit,
    search: query.search,
    sortBy: query.sortBy as Prisma.ProductScalarFieldEnum,
    sortOrder: query.sortOrder,
  });

  return {
    items: result.products.map((product) => ({
      ...product,
      isLowStock: product.stock <= query.threshold,
    })),
    pagination: buildPagination(page, limit, result.total),
  };
};

const listLowStock = async (query: ListLowStockQuery): Promise<InventoryListResult<{
  id: string;
  name: string;
  slug: string;
  sku: string;
  stock: number;
  isActive: boolean;
  threshold: number;
  createdAt: Date;
  updatedAt: Date;
}>> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await inventoryModel.listLowStockProducts({
    skip,
    take: limit,
    search: query.search,
    threshold: query.threshold,
    sortBy: query.sortBy as Prisma.ProductScalarFieldEnum,
    sortOrder: query.sortOrder,
  });

  return {
    items: result.products.map((product) => ({
      ...product,
      threshold: query.threshold,
    })),
    pagination: buildPagination(page, limit, result.total),
  };
};

const listInventoryMovements = async (
  params: InventoryProductIdParams,
  query: ListInventoryMovementsQuery,
): Promise<InventoryListResult<Awaited<ReturnType<typeof inventoryModel.listInventoryMovements>>["movements"][number]>> => {
  const existingProduct = await inventoryModel.findInventoryProductById(params.productId);

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await inventoryModel.listInventoryMovements({
    productId: params.productId,
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
  params: InventoryProductIdParams,
  input: AdjustInventoryInput,
) => {
  const existingProduct = await inventoryModel.findInventoryProductById(params.productId);

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  let nextStock = existingProduct.stock;
  let movementType: InventoryMovementType = InventoryMovementType.set;

  if (input.operation === "set") {
    nextStock = input.quantity;
    movementType = InventoryMovementType.set;
  }

  if (input.operation === "increase") {
    nextStock = existingProduct.stock + input.quantity;
    movementType = InventoryMovementType.increase;
  }

  if (input.operation === "decrease") {
    nextStock = existingProduct.stock - input.quantity;
    movementType = InventoryMovementType.decrease;
  }

  if (nextStock < 0) {
    throw new AppError("Stock cannot go below zero", 400);
  }

  return inventoryModel.adjustInventoryStock({
    productId: params.productId,
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
