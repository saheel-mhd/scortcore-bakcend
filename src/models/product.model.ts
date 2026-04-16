import type { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const variantSelect = {
  id: true,
  unitId: true,
  stock: true,
  createdAt: true,
  updatedAt: true,
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

const publicProductSelect = {
  id: true,
  name: true,
  slug: true,
  sku: true,
  description: true,
  price: true,
  isActive: true,
  cardImage: true,
  mainImage: true,
  galleryImages: true,
  createdAt: true,
  updatedAt: true,
  variants: {
    select: variantSelect,
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.ProductSelect;

export type ProductRecord = Prisma.ProductGetPayload<{
  select: typeof publicProductSelect;
}>;

export interface VariantInputData {
  id?: string;
  unitId: string;
  stock?: number;
}

export interface CreateProductRecordData {
  name: string;
  slug: string;
  sku: string;
  description?: string;
  price: number;
  isActive: boolean;
  cardImage: string;
  mainImage: string;
  galleryImages: string[];
  variants: { unitId: string; stock: number }[];
}

export interface UpdateProductRecordData {
  name?: string;
  slug?: string;
  sku?: string;
  description?: string | null;
  price?: number;
  isActive?: boolean;
  cardImage?: string;
  mainImage?: string;
  galleryImages?: string[];
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
        { name: { contains: options.search, mode: "insensitive" } },
        { slug: { contains: options.search, mode: "insensitive" } },
        { sku: { contains: options.search, mode: "insensitive" } },
      ],
    });
  }

  if (typeof options.isActive === "boolean") {
    andConditions.push({ isActive: options.isActive });
  }

  if (typeof options.minPrice === "number" || typeof options.maxPrice === "number") {
    andConditions.push({
      price: {
        ...(typeof options.minPrice === "number" ? { gte: options.minPrice } : {}),
        ...(typeof options.maxPrice === "number" ? { lte: options.maxPrice } : {}),
      },
    });
  }

  if (andConditions.length === 0) return {};
  return { AND: andConditions };
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
  const { variants, ...productData } = data;

  return prisma.$transaction(async (tx) => {
    const created = await tx.product.create({
      data: {
        ...productData,
        variants: {
          create: variants.map((variant) => ({
            unitId: variant.unitId,
            stock: variant.stock,
          })),
        },
      },
      select: publicProductSelect,
    });

    return created;
  });
};

const updateProduct = async (id: string, data: UpdateProductRecordData): Promise<ProductRecord> => {
  return prisma.product.update({
    where: { id },
    data,
    select: publicProductSelect,
  });
};

const replaceVariants = async (
  productId: string,
  variants: { id?: string; unitId: string; stock: number }[],
): Promise<ProductRecord> => {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.productVariant.findMany({
      where: { productId },
      select: { id: true },
    });
    const existingIds = new Set(existing.map((v) => v.id));
    const keptIds = new Set(
      variants.map((v) => v.id).filter((id): id is string => typeof id === "string"),
    );
    const toDelete = existing.filter((v) => !keptIds.has(v.id)).map((v) => v.id);

    if (toDelete.length > 0) {
      await tx.inventoryMovement.deleteMany({
        where: { productVariantId: { in: toDelete } },
      });
      await tx.purchaseOrder.deleteMany({
        where: { productVariantId: { in: toDelete } },
      });
      await tx.productVariant.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    for (const variant of variants) {
      if (variant.id && existingIds.has(variant.id)) {
        await tx.productVariant.update({
          where: { id: variant.id },
          data: { unitId: variant.unitId, stock: variant.stock },
        });
      } else {
        await tx.productVariant.create({
          data: { productId, unitId: variant.unitId, stock: variant.stock },
        });
      }
    }

    const product = await tx.product.findUnique({
      where: { id: productId },
      select: publicProductSelect,
    });

    if (!product) {
      throw new Error("Product not found after variant replacement");
    }

    return product;
  });
};

const deleteProduct = async (id: string): Promise<ProductRecord> => {
  return prisma.$transaction(async (tx) => {
    const variants = await tx.productVariant.findMany({
      where: { productId: id },
      select: { id: true },
    });
    const variantIds = variants.map((v) => v.id);

    if (variantIds.length > 0) {
      await tx.inventoryMovement.deleteMany({
        where: { productVariantId: { in: variantIds } },
      });
      await tx.purchaseOrder.deleteMany({
        where: { productVariantId: { in: variantIds } },
      });
      await tx.productVariant.deleteMany({
        where: { productId: id },
      });
    }

    return tx.product.delete({
      where: { id },
      select: publicProductSelect,
    });
  });
};

const listProducts = async (options: ListProductsOptions) => {
  const where = buildProductWhereInput(options);

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: { [options.sortBy]: options.sortOrder },
      select: publicProductSelect,
    }),
    prisma.product.count({ where }),
  ]);

  return { products, total };
};

export const productModel = {
  findProductById,
  findProductBySlug,
  findProductBySku,
  createProduct,
  updateProduct,
  replaceVariants,
  deleteProduct,
  listProducts,
};
