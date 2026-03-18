import { PaymentStatus } from "@prisma/client";
import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid id is required");

const providerSchema = z
  .string()
  .trim()
  .min(1, "Provider must not be empty")
  .max(50, "Provider must not exceed 50 characters")
  .optional();

const referenceSchema = z
  .string()
  .trim()
  .min(1, "Reference must not be empty")
  .max(120, "Reference must not exceed 120 characters")
  .optional();

export const createPaymentValidationSchema = z.object({
  body: z.object({
    orderId: objectIdSchema,
    provider: providerSchema,
    reference: referenceSchema,
  }),
});

export const listPaymentsValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.nativeEnum(PaymentStatus).optional(),
    orderId: objectIdSchema.optional(),
    sortBy: z.enum(["amount", "status", "createdAt", "updatedAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const getPaymentValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const getPaymentByOrderValidationSchema = z.object({
  params: z.object({
    orderId: objectIdSchema,
  }),
});

export const updatePaymentStatusValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.nativeEnum(PaymentStatus),
  }),
});

export type CreatePaymentInput = z.infer<typeof createPaymentValidationSchema>["body"];
export type ListPaymentsQuery = z.infer<typeof listPaymentsValidationSchema>["query"];
export type PaymentIdParams = z.infer<typeof getPaymentValidationSchema>["params"];
export type PaymentOrderIdParams = z.infer<typeof getPaymentByOrderValidationSchema>["params"];
export type UpdatePaymentStatusInput = z.infer<
  typeof updatePaymentStatusValidationSchema
>["body"];
