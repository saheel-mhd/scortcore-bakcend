import type { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const publicProductSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  description: true,
  price: true,
  stock: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ProductSelect;

export type ProductRecord = Prisma.ProductGetPayload<{
  select: typeof publicProductSelect;
}>;

export interface CreateProductRecordData {
  name: string;
  slug: string;
  sku: string;
  description?: string;
  price: number;
  stock: number;
  isActive: boolean;
}

export interface UpdateProductRecordData {
  name?: string;
  slug?: string;
  sku?: string;
  description?: string | null;
  price?: number;
  stock?: number;
  isActive?: boolean;
}

export interface ListProductsOptions {
  skip: number;
  take: number;
  search?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy: Prisma.ProductScalarFieldEnum;
  sortOrder: Prisma.SortOrder;
}

const buildProductWhereInput = (
  options: Pick<ListProductsOptions, "search" | "isActive" | "minPrice" | "maxPrice">,
): Prisma.ProductWhereInput => {
  const andConditions: Prisma.ProductWhereInput[] = [];

  if (options.search) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: options.search,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: options.search,
            mode: "insensitive",
          },
        },
        {
          sku: {
            contains: options.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (typeof options.isActive === "boolean") {
    andConditions.push({
      isActive: options.isActive,
    });
  }

  if (typeof options.minPrice === "number" || typeof options.maxPrice === "number") {
    andConditions.push({
      price: {
        ...(typeof options.minPrice === "number" ? { gte: options.minPrice } : {}),
        ...(typeof options.maxPrice === "number" ? { lte: options.maxPrice } : {}),
      },
    });
  }

  if (andConditions.length === 0) {
    return {};
  }

  return {
    AND: andConditions,
  };
};

const findProductById = async (id: string): Promise<ProductRecord | null> => {
  return prisma.product.findUnique({
    where: { id },
    select: publicProductSelect,
  });
};

const findProductBySlug = async (slug: string): Promise<ProductRecord | null> => {
  return prisma.product.findUnique({
    where: { slug },
    select: publicProductSelect,
  });
};

const findProductBySku = async (sku: string): Promise<ProductRecord | null> => {
  return prisma.product.findUnique({
    where: { sku },
    select: publicProductSelect,
  });
};

const createProduct = async (data: CreateProductRecordData): Promise<ProductRecord> => {
  return prisma.product.create({
    data,
    select: publicProductSelect,
  });
};

const updateProduct = async (id: string, data: UpdateProductRecordData): Promise<ProductRecord> => {
  return prisma.product.update({
    where: { id },
    data,
    select: publicProductSelect,
  });
};

const deleteProduct = async (id: string): Promise<ProductRecord> => {
  return prisma.product.delete({
    where: { id },
    select: publicProductSelect,
  });
};

const listProducts = async (options: ListProductsOptions) => {
  const where = buildProductWhereInput(options);

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: {
        [options.sortBy]: options.sortOrder,
      },
      select: publicProductSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
  };
};

export const productModel = {
  findProductById,
  findProductBySlug,
  findProductBySku,
  createProduct,
  updateProduct,
  deleteProduct,
  listProducts,
};
