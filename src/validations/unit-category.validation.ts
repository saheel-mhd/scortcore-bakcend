import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid id is required");

const nameSchema = z
  .string()
  .trim()
  .min(2, "Name must be at least 2 characters long")
  .max(60, "Name must not exceed 60 characters");

const shortNameSchema = z
  .string()
  .trim()
  .min(1, "Short name is required")
  .max(20, "Short name must not exceed 20 characters")
  .regex(/^[a-z0-9][a-z0-9_-]*$/, "Short name must be lowercase letters, numbers, underscore or hyphen")
  .transform((value) => value.toLowerCase());

const descriptionSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .optional();

export const createUnitCategoryValidationSchema = z.object({
  body: z.object({
    name: nameSchema,
    shortName: shortNameSchema,
    description: descriptionSchema,
  }),
});

export const updateUnitCategoryValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: nameSchema.optional(),
      shortName: shortNameSchema.optional(),
      description: descriptionSchema.nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required to update the unit category",
    }),
});

export const getUnitCategoryValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const deleteUnitCategoryValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const listUnitCategoriesValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(50),
    search: z.string().trim().min(1).max(100).optional(),
    sortBy: z.enum(["name", "shortName", "createdAt", "updatedAt"]).default("name"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
});

export type CreateUnitCategoryInput = z.infer<typeof createUnitCategoryValidationSchema>["body"];
export type UpdateUnitCategoryInput = z.infer<typeof updateUnitCategoryValidationSchema>["body"];
export type UnitCategoryIdParams = z.infer<typeof getUnitCategoryValidationSchema>["params"];
export type ListUnitCategoriesQuery = z.infer<typeof listUnitCategoriesValidationSchema>["query"];
