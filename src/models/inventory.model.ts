import type { InventoryMovementType, Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const inventoryVariantSelect = {
  id: true,
  stock: true,
  updatedAt: true,
  createdAt: true,
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      isActive: true,
    },
  },
  unit: {
    select: {
      id: true,
      name: true,
      shortName: true,
      category: {
        select: {
          id: true,
          name: true,
          shortName: true,
        },
      },
    },
  },
} satisfies Prisma.ProductVariantSelect;

const inventoryMovementVariantSelect = {
  id: true,
  stock: true,
  product: {
    select: {
      id: true,
      name: true,
      sku: true,
      slug: true,
    },
  },
  unit: {
    select: {
      id: true,
      name: true,
      shortName: true,
    },
  },
} satisfies Prisma.ProductVariantSelect;

const inventoryMovementSelect = {
  id: true,
  productVariantId: true,
  productVariant: {
    select: inventoryMovementVariantSelect,
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

export type InventoryVariantRecord = Prisma.ProductVariantGetPayload<{
  select: typeof inventoryVariantSelect;
}>;

export type InventoryMovementRecord = Prisma.InventoryMovementGetPayload<{
  select: typeof inventoryMovementSelect;
}>;

export interface ListInventoryOptions {
  skip: number;
  take: number;
  search?: string;
  sortBy: "stock" | "createdAt" | "updatedAt";
  sortOrder: Prisma.SortOrder;
}

export interface ListLowStockOptions extends ListInventoryOptions {
  threshold: number;
}

export interface ListInventoryMovementsOptions {
  productVariantId: string;
  skip: number;
  take: number;
  sortOrder: Prisma.SortOrder;
}

export interface CreateInventoryMovementData {
  productVariantId: string;
  type: InventoryMovementType;
  quantityChange: number;
  previousStock: number;
  nextStock: number;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface AdjustInventoryStockData {
  productVariantId: string;
  nextStock: number;
  type: InventoryMovementType;
  reason?: string;
  referenceType?: string;
  referenceId?: string;
}

const buildWhereBySearch = (search?: string): Prisma.ProductVariantWhereInput => {
  if (!search) {
    return {};
  }

  return {
    product: {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { slug: { contains: search, mode: "insensitive" } },
        { sku: { contains: search, mode: "insensitive" } },
      ],
    },
  };
};

const findInventoryVariantById = async (id: string): Promise<InventoryVariantRecord | null> => {
  return prisma.productVariant.findUnique({
    where: { id },
    select: inventoryVariantSelect,
  });
};

const listInventoryVariants = async (options: ListInventoryOptions) => {
  const where = buildWhereBySearch(options.search);

  const [variants, total] = await prisma.$transaction([
    prisma.productVariant.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: { [options.sortBy]: options.sortOrder },
      select: inventoryVariantSelect,
    }),
    prisma.productVariant.count({ where }),
  ]);

  return { variants, total };
};

const listLowStockVariants = async (options: ListLowStockOptions) => {
  const searchWhere = buildWhereBySearch(options.search);
  const where: Prisma.ProductVariantWhereInput = {
    AND: [
      searchWhere,
      { stock: { lte: options.threshold } },
      { product: { isActive: true } },
    ],
  };

  const [variants, total] = await prisma.$transaction([
    prisma.productVariant.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: { [options.sortBy]: options.sortOrder },
      select: inventoryVariantSelect,
    }),
    prisma.productVariant.count({ where }),
  ]);

  return { variants, total };
};

const listInventoryMovements = async (options: ListInventoryMovementsOptions) => {
  const where: Prisma.InventoryMovementWhereInput = {
    productVariantId: options.productVariantId,
  };

  const [movements, total] = await prisma.$transaction([
    prisma.inventoryMovement.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: { createdAt: options.sortOrder },
      select: inventoryMovementSelect,
    }),
    prisma.inventoryMovement.count({ where }),
  ]);

  return { movements, total };
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
): Promise<InventoryVariantRecord> => {
  return prisma.$transaction(async (transaction) => {
    const existing = await transaction.productVariant.findUnique({
      where: { id: data.productVariantId },
      select: inventoryVariantSelect,
    });

    if (!existing) {
      throw new Error("Product variant not found");
    }

    const updated = await transaction.productVariant.update({
      where: { id: data.productVariantId },
      data: { stock: data.nextStock },
      select: inventoryVariantSelect,
    });

    await transaction.inventoryMovement.create({
      data: {
        productVariantId: data.productVariantId,
        type: data.type,
        quantityChange: data.nextStock - existing.stock,
        previousStock: existing.stock,
        nextStock: data.nextStock,
        reason: data.reason,
        referenceType: data.referenceType,
        referenceId: data.referenceId,
      },
      select: inventoryMovementSelect,
    });

    return updated;
  });
};

export const inventoryModel = {
  findInventoryVariantById,
  listInventoryVariants,
  listLowStockVariants,
  listInventoryMovements,
  createInventoryMovement,
  adjustInventoryStock,
};
