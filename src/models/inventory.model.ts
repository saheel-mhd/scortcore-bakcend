import type { InventoryMovementType, Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const inventoryProductSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  stock: true,
  isActive: true,
  updatedAt: true,
  createdAt: true,
} satisfies Prisma.ProductSelect;

const inventoryMovementProductSelect = {
  id: true,
  name: true,
  sku: true,
  slug: true,
} satisfies Prisma.ProductSelect;

const inventoryMovementSelect = {
  id: true,
  productId: true,
  product: {
    select: inventoryMovementProductSelect,
  },
  type: true,
  quantityChange: true,
  previousStock: true,
  nextStock: true,
  reason: true,
  referenceType: true,
  referenceId: true,
  createdAt: true,
} satisfies Prisma.InventoryMovementSelect;

export type InventoryProductRecord = Prisma.ProductGetPayload<{
  select: typeof inventoryProductSelect;
}>;

export type InventoryMovementRecord = Prisma.InventoryMovementGetPayload<{
  select: typeof inventoryMovementSelect;
}>;

export interface ListInventoryOptions {
  skip: number;
  take: number;
  search?: string;
  sortBy: Prisma.ProductScalarFieldEnum;
  sortOrder: Prisma.SortOrder;
}

export interface ListLowStockOptions extends ListInventoryOptions {
  threshold: number;
}

export interface ListInventoryMovementsOptions {
  productId: string;
  skip: number;
  take: number;
  sortOrder: Prisma.SortOrder;
}

export interface CreateInventoryMovementData {
  productId: string;
  type: InventoryMovementType;
  quantityChange: number;
  previousStock: number;
  nextStock: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface AdjustInventoryStockData {
  productId: string;
  nextStock: number;
  type: InventoryMovementType;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
}

const buildInventoryWhereInput = (search?: string): Prisma.ProductWhereInput => {
  if (!search) {
    return {};
  }

  return {
    OR: [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        slug: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        sku: {
          contains: search,
          mode: "insensitive",
        },
      },
    ],
  };
};

const findInventoryProductById = async (id: string): Promise<InventoryProductRecord | null> => {
  return prisma.product.findUnique({
    where: { id },
    select: inventoryProductSelect,
  });
};

const listInventoryProducts = async (options: ListInventoryOptions) => {
  const where = buildInventoryWhereInput(options.search);

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: {
        [options.sortBy]: options.sortOrder,
      },
      select: inventoryProductSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
  };
};

const listLowStockProducts = async (options: ListLowStockOptions) => {
  const searchWhere = buildInventoryWhereInput(options.search);
  const where: Prisma.ProductWhereInput = {
    AND: [
      searchWhere,
      {
        stock: {
          lte: options.threshold,
        },
      },
      {
        isActive: true,
      },
    ],
  };

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: {
        [options.sortBy]: options.sortOrder,
      },
      select: inventoryProductSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
  };
};

const listInventoryMovements = async (options: ListInventoryMovementsOptions) => {
  const where: Prisma.InventoryMovementWhereInput = {
    productId: options.productId,
  };

  const [movements, total] = await prisma.$transaction([
    prisma.inventoryMovement.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: {
        createdAt: options.sortOrder,
      },
      select: inventoryMovementSelect,
    }),
    prisma.inventoryMovement.count({ where }),
  ]);

  return {
    movements,
    total,
  };
};

const createInventoryMovement = async (
  data: CreateInventoryMovementData,
): Promise<InventoryMovementRecord> => {
  return prisma.inventoryMovement.create({
    data,
    select: inventoryMovementSelect,
  });
};

const adjustInventoryStock = async (
  data: AdjustInventoryStockData,
): Promise<InventoryProductRecord> => {
  return prisma.$transaction(async (transaction) => {
    const existingProduct = await transaction.product.findUnique({
      where: { id: data.productId },
      select: inventoryProductSelect,
    });

    if (!existingProduct) {
      throw new Error("Product not found");
    }

    const updatedProduct = await transaction.product.update({
      where: { id: data.productId },
      data: { stock: data.nextStock },
      select: inventoryProductSelect,
    });

    await transaction.inventoryMovement.create({
      data: {
        productId: data.productId,
        type: data.type,
        quantityChange: data.nextStock - existingProduct.stock,
        previousStock: existingProduct.stock,
        nextStock: data.nextStock,
        reason: data.reason,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
      },
      select: inventoryMovementSelect,
    });

    return updatedProduct;
  });
};

export const inventoryModel = {
  findInventoryProductById,
  listInventoryProducts,
  listLowStockProducts,
  listInventoryMovements,
  createInventoryMovement,
  adjustInventoryStock,
};
