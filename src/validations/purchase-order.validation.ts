import { PurchaseOrderStatus } from "@prisma/client";
import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid id is required");

const moneySchema = z.coerce
  .number()
  .finite("Value must be a valid number")
  .min(0, "Value cannot be negative")
  .multipleOf(0.01, "Value can have at most two decimal places");

export const createPurchaseOrderValidationSchema = z.object({
  body: z.object({
    supplierName: z
      .string()
      .trim()
      .min(2, "Supplier name must be at least 2 characters long")
      .max(150, "Supplier name must not exceed 150 characters"),
    supplierEmail: z
      .string()
      .trim()
      .email("Supplier email must be a valid email address")
      .optional(),
    supplierPhone: z
      .string()
      .trim()
      .min(3, "Supplier phone must be at least 3 characters long")
      .max(50, "Supplier phone must not exceed 50 characters")
      .optional(),
    productVariantId: objectIdSchema,
    quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
    unitCost: moneySchema,
    notes: z.string().trim().min(1).max(500).optional(),
  }),
});

export const listPurchaseOrdersValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().min(1).max(100).optional(),
    status: z.nativeEnum(PurchaseOrderStatus).optional(),
    productVariantId: objectIdSchema.optional(),
    sortBy: z
      .enum(["orderedAt", "createdAt", "updatedAt", "status", "supplierName"])
      .default("orderedAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const getPurchaseOrderValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const receivePurchaseOrderValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    receivedQuantity: z.coerce.number().int().min(1, "Received quantity must be at least 1"),
    reason: z.string().trim().min(1).max(300).optional(),
  }),
});

export type CreatePurchaseOrderInput = z.infer<typeof createPurchaseOrderValidationSchema>["body"];
export type ListPurchaseOrdersQuery = z.infer<typeof listPurchaseOrdersValidationSchema>["query"];
export type PurchaseOrderIdParams = z.infer<typeof getPurchaseOrderValidationSchema>["params"];
export type ReceivePurchaseOrderInput = z.infer<
  typeof receivePurchaseOrderValidationSchema
>["body"];
