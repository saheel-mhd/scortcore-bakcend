import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid id is required");

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(60, "Name must not exceed 60 characters");

const shortNameSchema = z
  .string()
  .trim()
  .min(1, "Short name is required")
  .max(20, "Short name must not exceed 20 characters");

const descriptionSchema = z
  .string()
  .trim()
  .min(1)
  .max(500)
  .optional();

export const createUnitValidationSchema = z.object({
  body: z.object({
    name: nameSchema,
    shortName: shortNameSchema,
    description: descriptionSchema,
    categoryId: objectIdSchema,
  }),
});

export const updateUnitValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: nameSchema.optional(),
      shortName: shortNameSchema.optional(),
      description: descriptionSchema.nullable().optional(),
      categoryId: objectIdSchema.optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required to update the unit",
    }),
});

export const getUnitValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const deleteUnitValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const listUnitsValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(200).default(100),
    search: z.string().trim().min(1).max(100).optional(),
    categoryId: objectIdSchema.optional(),
    sortBy: z.enum(["name", "shortName", "createdAt", "updatedAt"]).default("name"),
    sortOrder: z.enum(["asc", "desc"]).default("asc"),
  }),
});

export type CreateUnitInput = z.infer<typeof createUnitValidationSchema>["body"];
export type UpdateUnitInput = z.infer<typeof updateUnitValidationSchema>["body"];
export type UnitIdParams = z.infer<typeof getUnitValidationSchema>["params"];
export type ListUnitsQuery = z.infer<typeof listUnitsValidationSchema>["query"];
