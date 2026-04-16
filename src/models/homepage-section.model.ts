import type { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const publicSelect = {
  id: true,
  title: true,
  description: true,
  type: true,
  productIds: true,
  bannerConfig: true,
  isActive: true,
  displayOrder: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.HomepageSectionSelect;

export type HomepageSectionRecord = Prisma.HomepageSectionGetPayload<{
  select: typeof publicSelect;
}>;

export interface CreateHomepageSectionRecordData {
  title: string;
  description?: string;
  type: string;
  productIds: string[];
  bannerConfig?: Prisma.InputJsonValue;
  isActive: boolean;
  displayOrder: number;
}

export interface UpdateHomepageSectionRecordData {
  title?: string;
  description?: string | null;
  type?: string;
  productIds?: string[];
  bannerConfig?: Prisma.InputJsonValue | null;
  isActive?: boolean;
  displayOrder?: number;
}

export interface ListHomepageSectionsOptions {
  skip: number;
  take: number;
  sortBy: Prisma.HomepageSectionScalarFieldEnum;
  sortOrder: Prisma.SortOrder;
  isActive?: boolean;
  type?: string;
}

const findById = async (id: string): Promise<HomepageSectionRecord | null> => {
  return prisma.homepageSection.findUnique({
    where: { id },
    select: publicSelect,
  });
};

const buildWhere = (
  options: Pick<ListHomepageSectionsOptions, "isActive" | "type">,
): Prisma.HomepageSectionWhereInput => {
  const conditions: Prisma.HomepageSectionWhereInput[] = [];

  if (typeof options.isActive === "boolean") {
    conditions.push({ isActive: options.isActive });
  }

  if (options.type) {
    conditions.push({ type: options.type });
  }

  if (conditions.length === 0) return {};
  return { AND: conditions };
};

const list = async (options: ListHomepageSectionsOptions) => {
  const where = buildWhere(options);

  const [items, total] = await prisma.$transaction([
    prisma.homepageSection.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: { [options.sortBy]: options.sortOrder },
      select: publicSelect,
    }),
    prisma.homepageSection.count({ where }),
  ]);

  return { items, total };
};

const listActiveForDisplay = async (): Promise<HomepageSectionRecord[]> => {
  return prisma.homepageSection.findMany({
    where: { isActive: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
    select: publicSelect,
  });
};

const create = async (
  data: CreateHomepageSectionRecordData,
): Promise<HomepageSectionRecord> => {
  return prisma.homepageSection.create({
    data,
    select: publicSelect,
  });
};

const update = async (
  id: string,
  data: UpdateHomepageSectionRecordData,
): Promise<HomepageSectionRecord> => {
  return prisma.homepageSection.update({
    where: { id },
    data,
    select: publicSelect,
  });
};

const remove = async (id: string): Promise<HomepageSectionRecord> => {
  return prisma.homepageSection.delete({
    where: { id },
    select: publicSelect,
  });
};

export const homepageSectionModel = {
  findById,
  list,
  listActiveForDisplay,
  create,
  update,
  remove,
};
