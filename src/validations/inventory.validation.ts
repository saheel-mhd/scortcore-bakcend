import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid product id is required");

const baseListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(["name", "stock", "createdAt", "updatedAt"]).default("updatedAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const inventoryProductParamsValidationSchema = z.object({
  params: z.object({
    productId: objectIdSchema,
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
  params: inventoryProductParamsValidationSchema.shape.params,
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const adjustInventoryValidationSchema = z.object({
  params: inventoryProductParamsValidationSchema.shape.params,
  body: z.object({
    operation: z.enum(["set", "increase", "decrease"]),
    quantity: z.coerce.number().int().min(0, "Quantity cannot be negative"),
    reason: z.string().trim().min(1).max(300).optional(),
  }),
});

export type InventoryProductIdParams = z.infer<typeof inventoryProductParamsValidationSchema>["params"];
export type ListInventoryQuery = z.infer<typeof listInventoryValidationSchema>["query"];
export type ListLowStockQuery = z.infer<typeof listLowStockValidationSchema>["query"];
export type ListInventoryMovementsQuery = z.infer<typeof listInventoryMovementsValidationSchema>["query"];
export type AdjustInventoryInput = z.infer<typeof adjustInventoryValidationSchema>["body"];
