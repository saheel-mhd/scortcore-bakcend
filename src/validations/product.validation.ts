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

const imageUrlSchema = z
  .string()
  .trim()
  .url("Must be a valid URL")
  .max(2048, "Image URL must not exceed 2048 characters");

const galleryImagesSchema = z
  .array(imageUrlSchema)
  .max(20, "Gallery cannot contain more than 20 images");

const stockSchema = z.coerce.number().int().min(0, "Stock cannot be negative");

const createVariantSchema = z.object({
  unitId: objectIdSchema,
  stock: stockSchema.default(0),
});

const updateVariantSchema = z.object({
  id: objectIdSchema.optional(),
  unitId: objectIdSchema,
  stock: stockSchema.optional(),
});

const createVariantsSchema = z
  .array(createVariantSchema)
  .min(1, "At least one size variant is required")
  .max(50, "Cannot create more than 50 variants at once");

const updateVariantsSchema = z
  .array(updateVariantSchema)
  .min(1, "At least one size variant is required")
  .max(50, "Cannot have more than 50 variants")
  .optional();

export const createProductValidationSchema = z.object({
  body: z.object({
    name: nameSchema,
    slug: slugSchema.optional(),
    sku: skuSchema,
    description: descriptionSchema,
    price: priceSchema,
    isActive: z.coerce.boolean().default(true),
    cardImage: imageUrlSchema,
    mainImage: imageUrlSchema,
    galleryImages: galleryImagesSchema.default([]),
    variants: createVariantsSchema,
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
      isActive: z.coerce.boolean().optional(),
      cardImage: imageUrlSchema.optional(),
      mainImage: imageUrlSchema.optional(),
      galleryImages: galleryImagesSchema.optional(),
      variants: updateVariantsSchema,
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
        .enum(["name", "price", "createdAt", "updatedAt"])
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

export type CreateProductInput = z.infer<typeof createProductValidationSchema>["body"];
export type UpdateProductInput = z.infer<typeof updateProductValidationSchema>["body"];
export type ProductIdParams = z.infer<typeof getProductValidationSchema>["params"];
export type ListProductsQuery = z.infer<typeof listProductsValidationSchema>["query"];
