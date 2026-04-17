import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid id is required");

const permissionsSchema = z.object({
  dashboard: z.boolean().default(false),
  products: z.boolean().default(false),
  orders: z.boolean().default(false),
  units: z.boolean().default(false),
  coupons: z.boolean().default(false),
  layout: z.boolean().default(false),
  settings: z.boolean().default(false),
});

export const createRoleConfigValidationSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Role name must be at least 2 characters")
      .max(40, "Role name must not exceed 40 characters")
      .regex(/^[A-Za-z0-9_ -]+$/, "Role name must use letters, numbers, spaces, underscores, or hyphens"),
    description: z.string().trim().min(1).max(300).optional(),
    permissions: permissionsSchema,
  }),
});

export const updateRoleConfigValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(2, "Role name must be at least 2 characters")
        .max(40, "Role name must not exceed 40 characters")
        .regex(/^[A-Za-z0-9_ -]+$/, "Role name must use letters, numbers, spaces, underscores, or hyphens")
        .optional(),
      description: z.string().trim().min(1).max(300).nullable().optional(),
      permissions: permissionsSchema.optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required",
    }),
});

export const getRoleConfigValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const deleteRoleConfigValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export type CreateRoleConfigInput = z.infer<typeof createRoleConfigValidationSchema>["body"];
export type UpdateRoleConfigInput = z.infer<typeof updateRoleConfigValidationSchema>["body"];
export type RoleConfigIdParams = z.infer<typeof getRoleConfigValidationSchema>["params"];
export type RolePermissions = z.infer<typeof permissionsSchema>;
