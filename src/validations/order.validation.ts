import { z } from "zod";

import { OrderStatus } from "@prisma/client";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid id is required");

const orderItemSchema = z.object({
  productVariantId: objectIdSchema,
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
});

export const createOrderValidationSchema = z.object({
  body: z.object({
    customerId: objectIdSchema.optional(),
    items: z.array(orderItemSchema).min(1, "At least one order item is required"),
  }),
});

const orderListQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    status: z.nativeEnum(OrderStatus).optional(),
    customerId: objectIdSchema.optional(),
    sortBy: z.enum(["createdAt", "updatedAt", "status", "totalAmount"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export const listOrdersValidationSchema = orderListQuerySchema;

export const listUserOrdersValidationSchema = z.object({
  query: orderListQuerySchema.shape.query.omit({
    customerId: true,
  }),
});

export const getOrderValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const updateOrderStatusValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.nativeEnum(OrderStatus),
  }),
});

export const deleteOrderValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderValidationSchema>["body"];
export type ListOrdersQuery = z.infer<typeof listOrdersValidationSchema>["query"];
export type ListUserOrdersQuery = z.infer<typeof listUserOrdersValidationSchema>["query"];
export type OrderIdParams = z.infer<typeof getOrderValidationSchema>["params"];
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusValidationSchema>["body"];
