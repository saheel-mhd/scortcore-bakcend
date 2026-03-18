import type { Prisma } from "@prisma/client";
import { InventoryMovementType } from "@prisma/client";
import { inventoryModel } from "../models/inventory.model.js";
import { productModel } from "../models/product.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateProductInput,
  ListProductsQuery,
  UpdateProductInput,
  UpdateProductStockInput,
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

  const product = await productModel.createProduct({
    name: input.name,
    slug,
    sku: input.sku,
    description: input.description,
    price: input.price,
    stock: input.stock,
    isActive: input.isActive,
  });

  if (product.stock > 0) {
    await inventoryModel.createInventoryMovement({
      productId: product.id,
      type: InventoryMovementType.set,
      quantityChange: product.stock,
      previousStock: 0,
      nextStock: product.stock,
      reason: "Initial stock recorded during product creation",
      referenceType: "product",
      referenceId: product.id,
    });
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

  const updatedProduct = await productModel.updateProduct(id, {
    name: input.name,
    slug: nextSlug,
    sku: input.sku,
    description: input.description,
    price: input.price,
    isActive: input.isActive,
  });

  if (typeof input.stock === "number" && input.stock !== existingProduct.stock) {
    return inventoryModel.adjustInventoryStock({
      productId: id,
      nextStock: input.stock,
      type: InventoryMovementType.set,
      reason: "Stock updated via product module",
      referenceType: "product",
      referenceId: id,
    });
  }

  return updatedProduct;
};

const updateProductStock = async (id: string, input: UpdateProductStockInput) => {
  const existingProduct = await productModel.findProductById(id);

  if (!existingProduct) {
    throw new AppError("Product not found", 404);
  }

  let nextStock = existingProduct.stock;
  let movementType: InventoryMovementType = InventoryMovementType.set;

  if (input.operation === "set") {
    nextStock = input.quantity;
    movementType = InventoryMovementType.set;
  }

  if (input.operation === "increase") {
    nextStock = existingProduct.stock + input.quantity;
    movementType = InventoryMovementType.increase;
  }

  if (input.operation === "decrease") {
    nextStock = existingProduct.stock - input.quantity;
    movementType = InventoryMovementType.decrease;
  }

  if (nextStock < 0) {
    throw new AppError("Stock cannot go below zero", 400);
  }

  return inventoryModel.adjustInventoryStock({
    productId: id,
    nextStock,
    type: movementType,
    reason: "Stock updated via product stock endpoint",
    referenceType: "product",
    referenceId: id,
  });
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
  updateProductStock,
  deleteProduct,
};
