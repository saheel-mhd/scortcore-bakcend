import { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";
import {
  homepageSectionModel,
  type HomepageSectionRecord,
} from "../models/homepage-section.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateHomepageSectionInput,
  ListHomepageSectionsQuery,
  UpdateHomepageSectionInput,
} from "../validations/homepage-section.validation.js";

const productSummarySelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  price: true,
  isActive: true,
  cardImage: true,
  mainImage: true,
  variants: {
    select: {
      id: true,
      stock: true,
      unit: {
        select: {
          id: true,
          name: true,
          shortName: true,
        },
      },
    },
  },
} satisfies Prisma.ProductSelect;

type ProductSummary = Prisma.ProductGetPayload<{
  select: typeof productSummarySelect;
}>;

type SectionWithProducts = HomepageSectionRecord & {
  products: ProductSummary[];
};

interface ListResult {
  items: SectionWithProducts[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ensureProductsExist = async (ids: string[]): Promise<void> => {
  if (ids.length === 0) return;

  const uniqueIds = Array.from(new Set(ids));
  if (uniqueIds.length !== ids.length) {
    throw new AppError("A product can only appear once in a section", 400);
  }

  const found = await prisma.product.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true },
  });

  if (found.length !== uniqueIds.length) {
    throw new AppError("One or more selected products do not exist", 400);
  }
};

const populateProducts = async (
  sections: HomepageSectionRecord[],
): Promise<SectionWithProducts[]> => {
  const allIds = Array.from(
    new Set(sections.flatMap((section) => section.productIds)),
  );

  if (allIds.length === 0) {
    return sections.map((section) => ({ ...section, products: [] }));
  }

  const products = await prisma.product.findMany({
    where: { id: { in: allIds } },
    select: productSummarySelect,
  });

  const productMap = new Map(products.map((product) => [product.id, product]));

  return sections.map((section) => ({
    ...section,
    products: section.productIds
      .map((productId) => productMap.get(productId))
      .filter((product): product is ProductSummary => Boolean(product)),
  }));
};

const getById = async (id: string) => {
  const section = await homepageSectionModel.findById(id);
  if (!section) {
    throw new AppError("Homepage section not found", 404);
  }

  const [enriched] = await populateProducts([section]);
  return enriched;
};

const list = async (query: ListHomepageSectionsQuery): Promise<ListResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await homepageSectionModel.list({
    skip,
    take: limit,
    sortBy: query.sortBy as Prisma.HomepageSectionScalarFieldEnum,
    sortOrder: query.sortOrder,
    isActive: query.isActive,
    type: query.type,
  });

  const enriched = await populateProducts(result.items);

  const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / limit);

  return {
    items: enriched,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages,
    },
  };
};

const listActiveForStore = async (): Promise<SectionWithProducts[]> => {
  const sections = await homepageSectionModel.listActiveForDisplay();
  const enriched = await populateProducts(sections);
  return enriched.map((section) => ({
    ...section,
    products: section.products.filter((product) => product.isActive),
  }));
};

const create = async (input: CreateHomepageSectionInput) => {
  if (input.type === "product") {
    await ensureProductsExist(input.productIds);
  }

  const created = await homepageSectionModel.create({
    title: input.title,
    description: input.description,
    type: input.type,
    productIds: input.type === "product" ? input.productIds : [],
    bannerConfig:
      input.type === "banner" && input.bannerConfig
        ? (input.bannerConfig as Prisma.InputJsonValue)
        : undefined,
    isActive: input.isActive,
    displayOrder: input.displayOrder,
  });

  const [enriched] = await populateProducts([created]);
  return enriched;
};

const update = async (id: string, input: UpdateHomepageSectionInput) => {
  const existing = await homepageSectionModel.findById(id);
  if (!existing) {
    throw new AppError("Homepage section not found", 404);
  }

  if (input.productIds) {
    await ensureProductsExist(input.productIds);
  }

  const bannerConfig: Prisma.InputJsonValue | null | undefined =
    input.bannerConfig === undefined
      ? undefined
      : input.bannerConfig === null
        ? null
        : (input.bannerConfig as Prisma.InputJsonValue);

  const updated = await homepageSectionModel.update(id, {
    title: input.title,
    description: input.description,
    type: input.type,
    productIds: input.productIds,
    bannerConfig,
    isActive: input.isActive,
    displayOrder: input.displayOrder,
  });

  const [enriched] = await populateProducts([updated]);
  return enriched;
};

const remove = async (id: string) => {
  const existing = await homepageSectionModel.findById(id);
  if (!existing) {
    throw new AppError("Homepage section not found", 404);
  }

  return homepageSectionModel.remove(id);
};

export const homepageSectionService = {
  getById,
  list,
  listActiveForStore,
  create,
  update,
  remove,
};
