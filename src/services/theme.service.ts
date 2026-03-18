import type { Prisma } from "@prisma/client";

import { themeModel } from "../models/theme.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateThemeInput,
  ListThemesQuery,
  UpdateThemeInput,
} from "../validations/theme.validation.js";

interface ListThemesResult {
  themes: Awaited<ReturnType<typeof themeModel.listThemes>>["themes"];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const slugify = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
};

const ensureUniqueThemeFields = async (
  name: string,
  slug: string,
  currentThemeId?: string,
): Promise<void> => {
  const [themeWithSameName, themeWithSameSlug] = await Promise.all([
    themeModel.findThemeByName(name),
    themeModel.findThemeBySlug(slug),
  ]);

  if (themeWithSameName && themeWithSameName.id !== currentThemeId) {
    throw new AppError("Theme with this name already exists", 409);
  }

  if (themeWithSameSlug && themeWithSameSlug.id !== currentThemeId) {
    throw new AppError("Theme with this slug already exists", 409);
  }
};

const getActiveTheme = async () => {
  const activeTheme = await themeModel.findActiveTheme();

  if (!activeTheme) {
    throw new AppError("No active theme found", 404);
  }

  return activeTheme;
};

const getThemeById = async (id: string) => {
  const theme = await themeModel.findThemeById(id);

  if (!theme) {
    throw new AppError("Theme not found", 404);
  }

  return theme;
};

const listThemes = async (query: ListThemesQuery): Promise<ListThemesResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await themeModel.listThemes({
    skip,
    take: limit,
    search: query.search,
    isActive: query.isActive,
    sortBy: query.sortBy as Prisma.ThemeScalarFieldEnum,
    sortOrder: query.sortOrder,
  });

  const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / limit);

  return {
    themes: result.themes,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages,
    },
  };
};

const createTheme = async (input: CreateThemeInput) => {
  const slug = input.slug ?? slugify(input.name);

  if (!slug) {
    throw new AppError("Unable to generate a valid slug for the theme", 400);
  }

  await ensureUniqueThemeFields(input.name, slug);

  return themeModel.createTheme({
    name: input.name,
    slug,
    config: input.config as Prisma.InputJsonValue,
    isActive: input.isActive,
  });
};

const updateTheme = async (id: string, input: UpdateThemeInput) => {
  const existingTheme = await themeModel.findThemeById(id);

  if (!existingTheme) {
    throw new AppError("Theme not found", 404);
  }

  const nextName = input.name ?? existingTheme.name;
  const nextSlug = input.slug ?? (input.name ? slugify(input.name) : existingTheme.slug);

  if (!nextSlug) {
    throw new AppError("Unable to generate a valid slug for the theme", 400);
  }

  await ensureUniqueThemeFields(nextName, nextSlug, id);

  return themeModel.updateTheme(id, {
    name: input.name,
    slug: nextSlug,
    config: input.config as Prisma.InputJsonValue | undefined,
    isActive: input.isActive,
  });
};

const activateTheme = async (id: string) => {
  const existingTheme = await themeModel.findThemeById(id);

  if (!existingTheme) {
    throw new AppError("Theme not found", 404);
  }

  return themeModel.activateTheme(id);
};

const deleteTheme = async (id: string) => {
  const existingTheme = await themeModel.findThemeById(id);

  if (!existingTheme) {
    throw new AppError("Theme not found", 404);
  }

  return themeModel.deleteTheme(id);
};

export const themeService = {
  getActiveTheme,
  getThemeById,
  listThemes,
  createTheme,
  updateTheme,
  activateTheme,
  deleteTheme,
};
