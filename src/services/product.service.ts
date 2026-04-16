import type { Prisma } from "@prisma/client";
import { InventoryMovementType } from "@prisma/client";

import { prisma } from "../config/prisma.js";
import { inventoryModel } from "../models/inventory.model.js";
import { productModel } from "../models/product.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
} from "../validations/product.validation.js";

interface ListProductsResult {
  products: Awaited<ReturnType<typeof productModel.listProducts>>["products"];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const slugify = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
};

const ensureUniqueProductFields = async (
  slug: string,
  sku: string,
  currentProductId?: string,
): Promise<void> => {
  const [productWithSameSlug, productWithSameSku] = await Promise.all([
    productModel.findProductBySlug(slug),
    productModel.findProductBySku(sku),
  ]);

  if (productWithSameSlug && productWithSameSlug.id !== currentProductId) {
    throw new AppError("Product with this slug already exists", 409);
  }

  if (productWithSameSku && productWithSameSku.id !== currentProductId) {
    throw new AppError("Product with this SKU already exists", 409);
  }
};

const ensureVariantsValid = async (
  variants: { unitId: string }[],
): Promise<void> => {
  const unitIds = variants.map((v) => v.unitId);
  const uniqueIds = new Set(unitIds);
  if (uniqueIds.size !== unitIds.length) {
    throw new AppError("Each size can only appear once per product", 400);
  }

  const existing = await prisma.unit.findMany({
    where: { id: { in: unitIds } },
    select: { id: true },
  });

  if (existing.length !== uniqueIds.size) {
    throw new AppError("One or more selected units do not exist", 400);
  }
};

const getProductById = async (id: string) => {
  const product = await productModel.findProductById(id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return product;
};

const listProducts = async (query: ListProductsQuery): Promise<ListProductsResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await productModel.listProducts({
    skip,
    take: limit,
    search: query.search,
    isActive: query.isActive,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    sortBy: query.sortBy as Prisma.ProductScalarFieldEnum,
    sortOrder: query.sortOrder,
  });

  const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / limit);

  return {
    products: result.products,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages,
    },
  };
};

const createProduct = async (input: CreateProductInput) => {
  const slug = input.slug ?? slugify(input.name);

  if (!slug) {
    throw new AppError("Unable to generate a valid slug for the product", 400);
  }

  await ensureUniqueProductFields(slug, input.sku);
  await ensureVariantsValid(input.variants);

  const product = await productModel.createProduct({
    name: input.name,
    slug,
    sku: input.sku,
    description: input.description,
    price: input.price,
    isActive: input.isActive,
    cardImage: input.cardImage,
    mainImage: input.mainImage,
    galleryImages: input.galleryImages,
    variants: input.variants.map((v) => ({ unitId: v.unitId, stock: v.stock ?? 0 })),
  });

  for (const variant of product.variants) {
    if (variant.stock > 0) {
      await inventoryModel.createInventoryMovement({
        productVariantId: variant.id,
        type: InventoryMovementType.set,
        quantityChange: variant.stock,
        previousStock: 0,
        nextStock: variant.stock,
        reason: "Initial stock recorded during product creation",
        referenceType: "product",
        referenceId: product.id,
      });
    }
  }

  return product;
};

const updateProduct = async (id: string, input: UpdateProductInput) => {
  const existingProduct = await productModel.findProductById(id);

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  const nextSlug = input.slug ?? (input.name ? slugify(input.name) : existingProduct.slug);
  const nextSku = input.sku ?? existingProduct.sku;

  if (!nextSlug) {
    throw new AppError("Unable to generate a valid slug for the product", 400);
  }

  await ensureUniqueProductFields(nextSlug, nextSku, id);

  await productModel.updateProduct(id, {
    name: input.name,
    slug: nextSlug,
    sku: input.sku,
    description: input.description,
    price: input.price,
    isActive: input.isActive,
    cardImage: input.cardImage,
    mainImage: input.mainImage,
    galleryImages: input.galleryImages,
  });

  if (input.variants) {
    await ensureVariantsValid(input.variants);
    const prevStockById = new Map(existingProduct.variants.map((v) => [v.id, v.stock]));
    const updated = await productModel.replaceVariants(
      id,
      input.variants.map((v) => ({ id: v.id, unitId: v.unitId, stock: v.stock ?? 0 })),
    );

    for (const variant of updated.variants) {
      const prev = prevStockById.get(variant.id) ?? 0;
      if (variant.stock !== prev) {
        await inventoryModel.createInventoryMovement({
          productVariantId: variant.id,
          type: InventoryMovementType.set,
          quantityChange: variant.stock - prev,
          previousStock: prev,
          nextStock: variant.stock,
          reason: "Stock updated via product module",
          referenceType: "product",
          referenceId: id,
        });
      }
    }

    return updated;
  }

  const refreshed = await productModel.findProductById(id);
  if (!refreshed) {
    throw new AppError("Product not found after update", 404);
  }
  return refreshed;
};

const deleteProduct = async (id: string) => {
  const existingProduct = await productModel.findProductById(id);

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  return productModel.deleteProduct(id);
};

export const productService = {
  getProductById,
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
};
