import { z } from "zod";

const objectIdSchema = z
  .string()
  .regex(/^[a-fA-F0-9]{24}$/, "A valid theme id is required");

const slugSchema = z
  .string()
  .trim()
  .min(3, "Slug must be at least 3 characters long")
  .max(120, "Slug must not exceed 120 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must use lowercase letters, numbers, and hyphens only");

const nameSchema = z
  .string()
  .trim()
  .min(3, "Theme name must be at least 3 characters long")
  .max(120, "Theme name must not exceed 120 characters");

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

const jsonValueSchema: z.ZodType<JsonValue> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ]),
);

export const createThemeValidationSchema = z.object({
  body: z.object({
    name: nameSchema,
    slug: slugSchema.optional(),
    config: z.record(z.string(), jsonValueSchema),
    isActive: z.coerce.boolean().default(false),
  }),
});

export const updateThemeValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      name: nameSchema.optional(),
      slug: slugSchema.optional(),
      config: z.record(z.string(), jsonValueSchema).optional(),
      isActive: z.coerce.boolean().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, {
      message: "At least one field is required to update the theme",
    }),
});

export const activateThemeValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const getThemeValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const deleteThemeValidationSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const listThemesValidationSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(10),
    search: z.string().trim().min(1).max(100).optional(),
    isActive: z.coerce.boolean().optional(),
    sortBy: z.enum(["name", "createdAt", "updatedAt"]).default("createdAt"),
    sortOrder: z.enum(["asc", "desc"]).default("desc"),
  }),
});

export type CreateThemeInput = z.infer<typeof createThemeValidationSchema>["body"];
export type UpdateThemeInput = z.infer<typeof updateThemeValidationSchema>["body"];
export type ThemeIdParams = z.infer<typeof getThemeValidationSchema>["params"];
export type ListThemesQuery = z.infer<typeof listThemesValidationSchema>["query"];
