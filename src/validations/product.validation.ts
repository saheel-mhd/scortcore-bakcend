import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid product id is required");

const slugSchema = z
  .string()
  .trim()
  .min(3, "Slug must be at least 3 characters long")
  .max(120, "Slug must not exceed 120 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens only");

const skuSchema = z
  .string()
  .trim()
  .min(3, "SKU must be at least 3 characters long")
  .max(50, "SKU must not exceed 50 characters")
  .regex(/^[A-Z0-9_-]+$/, "SKU must contain uppercase letters, numbers, underscores, or hyphens only");

const nameSchema = z
  .string()
  .trim()
  .min(3, "Product name must be at least 3 characters long")
  .max(150, "Product name must not exceed 150 characters");

const descriptionSchema = z
  .string()
  .trim()
  .min(1, "Description must not be empty")
  .max(2000, "Description must not exceed 2000 characters")
  .optional();

const priceSchema = z
  .coerce
  .number()
  .finite("Price must be a valid number")
  .min(0, "Price cannot be negative")
  .multipleOf(0.01, "Price can have at most two decimal places");

const stockSchema = z.coerce.number().int().min(0, "Stock cannot be negative");

export const createProductValidationSchema = z.object({
  body: z.object({
    name: nameSchema,
    slug: slugSchema.optional(),
    sku: skuSchema,
    description: descriptionSchema,
    price: priceSchema,
    stock: stockSchema.default(0),
    isActive: z.coerce.boolean().default(true),
  }),
});

export const updateProductValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: nameSchema.optional(),
      slug: slugSchema.optional(),
      sku: skuSchema.optional(),
      description: descriptionSchema.nullable().optional(),
      price: priceSchema.optional(),
      stock: stockSchema.optional(),
      isActive: z.coerce.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required to update the product",
    }),
});

export const getProductValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const deleteProductValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const listProductsValidationSchema = z.object({
  query: z
    .object({
      page: z.coerce.number().int().min(1).default(1),
      limit: z.coerce.number().int().min(1).max(100).default(10),
      search: z.string().trim().min(1).max(100).optional(),
      isActive: z.coerce.boolean().optional(),
      minPrice: priceSchema.optional(),
      maxPrice: priceSchema.optional(),
      sortBy: z
        .enum(["name", "price", "stock", "createdAt", "updatedAt"])
        .default("createdAt"),
      sortOrder: z.enum(["asc", "desc"]).default("desc"),
    })
    .refine(
      (value) =>
        typeof value.minPrice !== "number" ||
        typeof value.maxPrice !== "number" ||
        value.minPrice <= value.maxPrice,
      {
        message: "minPrice cannot be greater than maxPrice",
      },
    ),
});

export const updateProductStockValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    operation: z.enum(["set", "increase", "decrease"]),
    quantity: z.coerce.number().int().min(0, "Stock quantity cannot be negative"),
  }),
});

export type CreateProductInput = z.infer<typeof createProductValidationSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductValidationSchema>["body"];
export type ProductIdParams = z.infer<typeof getProductValidationSchema>["params"];
export type ListProductsQuery = z.infer<typeof listProductsValidationSchema>["query"];
export type UpdateProductStockInput = z.infer<typeof updateProductStockValidationSchema>["body"];
