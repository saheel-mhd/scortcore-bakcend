import { z } from "zod";

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

const homepageSectionSchema = z.object({
  type: z.string().trim().min(1, "Section type is required").max(100),
  id: z.string().trim().min(1, "Section id is required").max(100).optional(),
  data: z.record(z.string(), jsonValueSchema).default({}),
  isVisible: z.coerce.boolean().default(true),
});

const bannerSchema = z.object({
  isEnabled: z.coerce.boolean().default(true),
  title: z.string().trim().min(1, "Banner title is required").max(200),
  subtitle: z.string().trim().max(500).optional(),
  imageUrl: z.string().trim().url("Banner imageUrl must be a valid URL").optional(),
  cta: z
    .object({
      label: z.string().trim().min(1).max(100),
      url: z.string().trim().url("CTA url must be a valid URL"),
    })
    .optional(),
  config: z.record(z.string(), jsonValueSchema).default({}),
});

const layoutConfigSchema = z.object({
  showHeader: z.coerce.boolean().default(true),
  showFooter: z.coerce.boolean().default(true),
  maxWidth: z.string().trim().max(50).default("1280px"),
  sectionGap: z.string().trim().max(50).default("32px"),
  config: z.record(z.string(), jsonValueSchema).default({}),
});

const homepageContentSchema = z.object({
  sections: z
    .array(homepageSectionSchema)
    .refine(
      (sections) =>
        new Set(sections.map((section) => section.id).filter((id): id is string => Boolean(id))).size ===
        sections.filter((section) => Boolean(section.id)).length,
      {
      message: "Section ids must be unique",
      },
    ),
  banner: bannerSchema.default({
    isEnabled: true,
    title: "Homepage Banner",
    config: {},
  }),
  layoutConfig: layoutConfigSchema.default({
    showHeader: true,
    showFooter: true,
    maxWidth: "1280px",
    sectionGap: "32px",
    config: {},
  }),
});

export const createHomepageValidationSchema = z.object({
  body: homepageContentSchema,
});

export const updateHomepageValidationSchema = z.object({
  body: homepageContentSchema,
});

export const updateHomepageSectionsValidationSchema = z.object({
  body: z.object({
    sections: homepageContentSchema.shape.sections,
  }),
});

export const updateHomepageBannerValidationSchema = z.object({
  body: z.object({
    banner: bannerSchema,
  }),
});

export const updateHomepageLayoutValidationSchema = z.object({
  body: z.object({
    layoutConfig: layoutConfigSchema,
  }),
});

export type CreateHomepageInput = z.infer<typeof createHomepageValidationSchema>["body"];
export type UpdateHomepageInput = z.infer<typeof updateHomepageValidationSchema>["body"];
export type UpdateHomepageSectionsInput = z.infer<typeof updateHomepageSectionsValidationSchema>["body"];
export type UpdateHomepageBannerInput = z.infer<typeof updateHomepageBannerValidationSchema>["body"];
export type UpdateHomepageLayoutInput = z.infer<typeof updateHomepageLayoutValidationSchema>["body"];
