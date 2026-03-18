import { z } from "zod";

import { Role } from "@prisma/client";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid user id is required");

const emailSchema = z
  .string()
  .trim()
  .email("A valid email address is required")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(72, "Password must not exceed 72 characters")
  .refine((value) => /[A-Z]/.test(value), {
    message: "Password must include at least one uppercase letter",
  })
  .refine((value) => /[a-z]/.test(value), {
    message: "Password must include at least one lowercase letter",
  })
  .refine((value) => /\d/.test(value), {
    message: "Password must include at least one number",
  })
  .refine((value) => /[^A-Za-z0-9]/.test(value), {
    message: "Password must include at least one special character",
  });

export const createUserValidationSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    role: z.nativeEnum(Role),
  }),
});

export const updateUserValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      email: emailSchema.optional(),
      password: passwordSchema.optional(),
      role: z.nativeEnum(Role).optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required to update the user",
    }),
});

export const getUserValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const deleteUserValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const listUsersValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().min(1).max(100).optional(),
    role: z.nativeEnum(Role).optional(),
    sortBy: z
      .enum(["email", "role", "createdAt", "updatedAt"])
      .default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export type CreateUserInput = z.infer<typeof createUserValidationSchema>["body"];
export type UpdateUserInput = z.infer<typeof updateUserValidationSchema>["body"];
export type UserIdParams = z.infer<typeof getUserValidationSchema>["params"];
export type ListUsersQuery = z.infer<typeof listUsersValidationSchema>["query"];
