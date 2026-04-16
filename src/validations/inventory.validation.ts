import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid id is required");

const baseListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(["stock", "createdAt", "updatedAt"]).default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const inventoryVariantParamsValidationSchema = z.object({
  params: z.object({
    productVariantId: objectIdSchema,
  }),
});

export const listInventoryValidationSchema = z.object({
  query: baseListQuerySchema.extend({
    threshold: z.coerce.number().int().min(0).default(5),
  }),
});

export const listLowStockValidationSchema = z.object({
  query: baseListQuerySchema.extend({
    threshold: z.coerce.number().int().min(0).default(5),
  }),
});

export const listInventoryMovementsValidationSchema = z.object({
  params: inventoryVariantParamsValidationSchema.shape.params,
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const adjustInventoryValidationSchema = z.object({
  params: inventoryVariantParamsValidationSchema.shape.params,
  body: z.object({
    operation: z.enum(["set", "increase", "decrease"]),
    quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
    reason: z.string().trim().min(1).max(300).optional(),
  }),
});

export type InventoryVariantIdParams = z.infer<typeof inventoryVariantParamsValidationSchema>["params"];
export type ListInventoryQuery = z.infer<typeof listInventoryValidationSchema>["query"];
export type ListLowStockQuery = z.infer<typeof listLowStockValidationSchema>["query"];
export type ListInventoryMovementsQuery = z.infer<typeof listInventoryMovementsValidationSchema>["query"];
export type AdjustInventoryInput = z.infer<typeof adjustInventoryValidationSchema>["body"];
