import type { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const publicThemeSelect = {
  id: true,
  name: true,
  slug: true,
  config: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ThemeSelect;

export type ThemeRecord = Prisma.ThemeGetPayload<{
  select: typeof publicThemeSelect;
}>;

export interface CreateThemeRecordData {
  name: string;
  slug: string;
  config: Prisma.InputJsonValue;
  isActive: boolean;
}

export interface UpdateThemeRecordData {
  name?: string;
  slug?: string;
  config?: Prisma.InputJsonValue;
  isActive?: boolean;
}

export interface ListThemesOptions {
  skip: number;
  take: number;
  search?: string;
  isActive?: boolean;
  sortBy: Prisma.ThemeScalarFieldEnum;
  sortOrder: Prisma.SortOrder;
}

const buildThemeWhereInput = (
  options: Pick<ListThemesOptions, "search" | "isActive">,
): Prisma.ThemeWhereInput => {
  const andConditions: Prisma.ThemeWhereInput[] = [];

  if (options.search) {
    andConditions.push({
      OR: [
        {
          name: {
            contains: options.search,
            mode: "insensitive",
          },
        },
        {
          slug: {
            contains: options.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (typeof options.isActive === "boolean") {
    andConditions.push({
      isActive: options.isActive,
    });
  }

  if (andConditions.length === 0) {
    return {};
  }

  return {
    AND: andConditions,
  };
};

const findThemeById = async (id: string): Promise<ThemeRecord | null> => {
  return prisma.theme.findUnique({
    where: { id },
    select: publicThemeSelect,
  });
};

const findThemeBySlug = async (slug: string): Promise<ThemeRecord | null> => {
  return prisma.theme.findUnique({
    where: { slug },
    select: publicThemeSelect,
  });
};

const findThemeByName = async (name: string): Promise<ThemeRecord | null> => {
  return prisma.theme.findUnique({
    where: { name },
    select: publicThemeSelect,
  });
};

const findActiveTheme = async (): Promise<ThemeRecord | null> => {
  return prisma.theme.findFirst({
    where: { isActive: true },
    select: publicThemeSelect,
  });
};

const createTheme = async (data: CreateThemeRecordData): Promise<ThemeRecord> => {
  return prisma.$transaction(async (transaction) => {
    if (data.isActive) {
      await transaction.theme.updateMany({
        data: { isActive: false },
      });
    }

    return transaction.theme.create({
      data,
      select: publicThemeSelect,
    });
  });
};

const updateTheme = async (id: string, data: UpdateThemeRecordData): Promise<ThemeRecord> => {
  return prisma.$transaction(async (transaction) => {
    if (data.isActive) {
      await transaction.theme.updateMany({
        where: {
          id: {
            not: id,
          },
        },
        data: { isActive: false },
      });
    }

    return transaction.theme.update({
      where: { id },
      data,
      select: publicThemeSelect,
    });
  });
};

const activateTheme = async (id: string): Promise<ThemeRecord> => {
  return prisma.$transaction(async (transaction) => {
    await transaction.theme.updateMany({
      data: { isActive: false },
    });

    return transaction.theme.update({
      where: { id },
      data: { isActive: true },
      select: publicThemeSelect,
    });
  });
};

const deleteTheme = async (id: string): Promise<ThemeRecord> => {
  return prisma.theme.delete({
    where: { id },
    select: publicThemeSelect,
  });
};

const listThemes = async (options: ListThemesOptions) => {
  const where = buildThemeWhereInput(options);

  const [themes, total] = await prisma.$transaction([
    prisma.theme.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: {
        [options.sortBy]: options.sortOrder,
      },
      select: publicThemeSelect,
    }),
    prisma.theme.count({ where }),
  ]);

  return {
    themes,
    total,
  };
};

export const themeModel = {
  findThemeById,
  findThemeBySlug,
  findThemeByName,
  findActiveTheme,
  createTheme,
  updateTheme,
  activateTheme,
  deleteTheme,
  listThemes,
};
