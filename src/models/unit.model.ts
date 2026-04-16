import type { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const publicUnitSelect = {
  id: true,
  name: true,
  shortName: true,
  description: true,
  categoryId: true,
  category: {
    select: {
      id: true,
      name: true,
      shortName: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UnitSelect;

export type UnitRecord = Prisma.UnitGetPayload<{
  select: typeof publicUnitSelect;
}>;

export interface CreateUnitRecordData {
  name: string;
  shortName: string;
  description?: string;
  categoryId: string;
}

export interface UpdateUnitRecordData {
  name?: string;
  shortName?: string;
  description?: string | null;
  categoryId?: string;
}

export interface ListUnitsOptions {
  skip: number;
  take: number;
  search?: string;
  categoryId?: string;
  sortBy: Prisma.UnitScalarFieldEnum;
  sortOrder: Prisma.SortOrder;
}

const buildWhere = (
  options: Pick<ListUnitsOptions, "search" | "categoryId">,
): Prisma.UnitWhereInput => {
  const conditions: Prisma.UnitWhereInput[] = [];

  if (options.search) {
    conditions.push({
      OR: [
        { name: { contains: options.search, mode: "insensitive" } },
        { shortName: { contains: options.search, mode: "insensitive" } },
      ],
    });
  }

  if (options.categoryId) {
    conditions.push({ categoryId: options.categoryId });
  }

  if (conditions.length === 0) return {};

  return { AND: conditions };
};

const findById = async (id: string): Promise<UnitRecord | null> => {
  return prisma.unit.findUnique({
    where: { id },
    select: publicUnitSelect,
  });
};

const findByCategoryAndShortName = async (
  categoryId: string,
  shortName: string,
): Promise<UnitRecord | null> => {
  return prisma.unit.findUnique({
    where: {
      categoryId_shortName: {
        categoryId,
        shortName,
      },
    },
    select: publicUnitSelect,
  });
};

const create = async (data: CreateUnitRecordData): Promise<UnitRecord> => {
  return prisma.unit.create({
    data,
    select: publicUnitSelect,
  });
};

const update = async (id: string, data: UpdateUnitRecordData): Promise<UnitRecord> => {
  return prisma.unit.update({
    where: { id },
    data,
    select: publicUnitSelect,
  });
};

const remove = async (id: string): Promise<UnitRecord> => {
  return prisma.unit.delete({
    where: { id },
    select: publicUnitSelect,
  });
};

const list = async (options: ListUnitsOptions) => {
  const where = buildWhere(options);

  const [items, total] = await prisma.$transaction([
    prisma.unit.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: { [options.sortBy]: options.sortOrder },
      select: publicUnitSelect,
    }),
    prisma.unit.count({ where }),
  ]);

  return { items, total };
};

export const unitModel = {
  findById,
  findByCategoryAndShortName,
  create,
  update,
  remove,
  list,
};
