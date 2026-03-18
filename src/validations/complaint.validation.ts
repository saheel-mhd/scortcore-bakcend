import { ComplaintStatus } from "@prisma/client";
import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid complaint id is required");

const baseListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.nativeEnum(ComplaintStatus).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  sortBy: z.enum(["status", "createdAt", "updatedAt", "subject"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createComplaintValidationSchema = z.object({
  body: z.object({
    subject: z
      .string()
      .trim()
      .min(3, "Complaint subject must be at least 3 characters long")
      .max(150, "Complaint subject must not exceed 150 characters"),
    message: z
      .string()
      .trim()
      .min(10, "Complaint message must be at least 10 characters long")
      .max(4000, "Complaint message must not exceed 4000 characters"),
  }),
});

export const getComplaintValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const listMyComplaintsValidationSchema = z.object({
  query: baseListQuerySchema,
});

export const listComplaintsValidationSchema = z.object({
  query: baseListQuerySchema.extend({
    customerId: objectIdSchema.optional(),
  }),
});

export const replyComplaintValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    reply: z
      .string()
      .trim()
      .min(3, "Admin reply must be at least 3 characters long")
      .max(4000, "Admin reply must not exceed 4000 characters"),
    status: z
      .enum([ComplaintStatus.in_progress, ComplaintStatus.resolved, ComplaintStatus.closed])
      .optional(),
  }),
});

export const updateComplaintStatusValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z.object({
    status: z.nativeEnum(ComplaintStatus),
  }),
});

export type CreateComplaintInput = z.infer<typeof createComplaintValidationSchema>["body"];
export type ComplaintIdParams = z.infer<typeof getComplaintValidationSchema>["params"];
export type ListMyComplaintsQuery = z.infer<typeof listMyComplaintsValidationSchema>["query"];
export type ListComplaintsQuery = z.infer<typeof listComplaintsValidationSchema>["query"];
export type ReplyComplaintInput = z.infer<typeof replyComplaintValidationSchema>["body"];
export type UpdateComplaintStatusInput = z.infer<
  typeof updateComplaintStatusValidationSchema
>["body"];
