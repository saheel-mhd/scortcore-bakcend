import type { Prisma } from "@prisma/client";
import { prisma } from "../config/prisma.js";

const publicUnitCategorySelect = {
  id: true,
  name: true,
  shortName: true,
  description: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UnitCategorySelect;

export type UnitCategoryRecord = Prisma.UnitCategoryGetPayload<{ select: typeof publicUnitCategorySelect; }>;

export interface CreateUnitCategoryRecordData {
  name: string;
  shortName: string;
  description?: string;
}

export interface UpdateUnitCategoryRecordData {
  name?: string;
  shortName?: string;
  description?: string | null;
}

export interface ListUnitCategoriesOptions {
  skip: number;
  take: number;
  search?: string;
  sortBy: Prisma.UnitCategoryScalarFieldEnum;
  sortOrder: Prisma.SortOrder;
}

const buildWhere = (
  search: string | undefined,
): Prisma.UnitCategoryWhereInput => {
  if (!search) return {};

  return {
    OR: [
      { name: { contains: search, mode: "insensitive" } },
      { shortName: { contains: search, mode: "insensitive" } },
    ],
  };
};

const findById = async (id: string): Promise<UnitCategoryRecord | null> => {
  return prisma.unitCategory.findUnique({
    where: { id },
    select: publicUnitCategorySelect,
  });
};

const findByName = async (name: string): Promise<UnitCategoryRecord | null> => {
  return prisma.unitCategory.findUnique({
    where: { name },
    select: publicUnitCategorySelect,
  });
};

const findByShortName = async (shortName: string): Promise<UnitCategoryRecord | null> => {
  return prisma.unitCategory.findUnique({
    where: { shortName },
    select: publicUnitCategorySelect,
  });
};

const create = async (data: CreateUnitCategoryRecordData): Promise<UnitCategoryRecord> => {
  return prisma.unitCategory.create({
    data,
    select: publicUnitCategorySelect,
  });
};

const update = async (id: string, data: UpdateUnitCategoryRecordData): Promise<UnitCategoryRecord> => {
  return prisma.unitCategory.update({
    where: { id },
    data,
    select: publicUnitCategorySelect,
  });
};

const remove = async (id: string): Promise<UnitCategoryRecord> => {
  return prisma.$transaction(async (tx) => {
    await tx.unit.deleteMany({ where: { categoryId: id } });

    return tx.unitCategory.delete({
      where: { id },
      select: publicUnitCategorySelect,
    });
  });
};

const list = async (options: ListUnitCategoriesOptions) => {
  const where = buildWhere(options.search);

  const [items, total] = await prisma.$transaction([
    prisma.unitCategory.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: { [options.sortBy]: options.sortOrder },
      select: publicUnitCategorySelect,
    }),
    prisma.unitCategory.count({ where }),
  ]);

  return { items, total };
};

const countDependentVariants = async (categoryId: string): Promise<number> => {
  const units = await prisma.unit.findMany({
    where: { categoryId },
    select: { id: true },
  });

  if (units.length === 0) {
    return 0;
  }

  return prisma.productVariant.count({
    where: { unitId: { in: units.map((unit) => unit.id) } },
  });
};

export const unitCategoryModel = {
  countDependentVariants,
  findById,
  findByName,
  findByShortName,
  create,
  update,
  remove,
  list,
};
