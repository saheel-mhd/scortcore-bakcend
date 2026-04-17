import type { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const publicSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  columns: true,
  productIds: true,
  bannerConfig: true,
  isActive: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ShopSectionSelect;

export type ShopSectionRecord = Prisma.ShopSectionGetPayload<{
  select: typeof publicSelect;
}>;

export interface CreateShopSectionRecordData {
  title: string;
  description?: string;
  type: string;
  columns: number;
  productIds: string[];
  bannerConfig?: Prisma.InputJsonValue;
  isActive: boolean;
  displayOrder: number;
}

export interface UpdateShopSectionRecordData {
  title?: string;
  description?: string | null;
  type?: string;
  columns?: number;
  productIds?: string[];
  bannerConfig?: Prisma.InputJsonValue | null;
  isActive?: boolean;
  displayOrder?: number;
}

export interface ListShopSectionsOptions {
  skip: number;
  take: number;
  sortBy: Prisma.ShopSectionScalarFieldEnum;
  sortOrder: Prisma.SortOrder;
  isActive?: boolean;
  type?: string;
}

const findById = async (id: string): Promise<ShopSectionRecord | null> => {
  return prisma.shopSection.findUnique({
    where: { id },
    select: publicSelect,
  });
};

const buildWhere = (
  options: Pick<ListShopSectionsOptions, "isActive" | "type">,
): Prisma.ShopSectionWhereInput => {
  const conditions: Prisma.ShopSectionWhereInput[] = [];

  if (typeof options.isActive === "boolean") {
    conditions.push({ isActive: options.isActive });
  }

  if (options.type) {
    conditions.push({ type: options.type });
  }

  if (conditions.length === 0) return {};
  return { AND: conditions };
};

const list = async (options: ListShopSectionsOptions) => {
  const where = buildWhere(options);

  const [items, total] = await prisma.$transaction([
    prisma.shopSection.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: { [options.sortBy]: options.sortOrder },
      select: publicSelect,
    }),
    prisma.shopSection.count({ where }),
  ]);

  return { items, total };
};

const listActiveForDisplay = async (): Promise<ShopSectionRecord[]> => {
  return prisma.shopSection.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    select: publicSelect,
  });
};

const create = async (
  data: CreateShopSectionRecordData,
): Promise<ShopSectionRecord> => {
  return prisma.shopSection.create({
    data,
    select: publicSelect,
  });
};

const update = async (
  id: string,
  data: UpdateShopSectionRecordData,
): Promise<ShopSectionRecord> => {
  return prisma.shopSection.update({
    where: { id },
    data,
    select: publicSelect,
  });
};

const remove = async (id: string): Promise<ShopSectionRecord> => {
  return prisma.shopSection.delete({
    where: { id },
    select: publicSelect,
  });
};

export const shopSectionModel = {
  findById,
  list,
  listActiveForDisplay,
  create,
  update,
  remove,
};
