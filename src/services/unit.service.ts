import type { Prisma } from "@prisma/client";

import { unitCategoryModel } from "../models/unit-category.model.js";
import { unitModel } from "../models/unit.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateUnitInput,
  ListUnitsQuery,
  UpdateUnitInput,
} from "../validations/unit.validation.js";

interface ListResult {
  items: Awaited<ReturnType<typeof unitModel.list>>["items"];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ensureCategoryExists = async (categoryId: string): Promise<void> => {
  const category = await unitCategoryModel.findById(categoryId);
  if (!category) {
    throw new AppError("Unit category not found", 404);
  }
};

const ensureUniqueWithinCategory = async (
  categoryId: string,
  shortName: string,
  currentId?: string,
): Promise<void> => {
  const existing = await unitModel.findByCategoryAndShortName(categoryId, shortName);
  if (existing && existing.id !== currentId) {
    throw new AppError("Unit with this short name already exists in the category", 409);
  }
};

const getById = async (id: string) => {
  const record = await unitModel.findById(id);
  if (!record) {
    throw new AppError("Unit not found", 404);
  }
  return record;
};

const list = async (query: ListUnitsQuery): Promise<ListResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await unitModel.list({
    skip,
    take: limit,
    search: query.search,
    categoryId: query.categoryId,
    sortBy: query.sortBy as Prisma.UnitScalarFieldEnum,
    sortOrder: query.sortOrder,
  });

  const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / limit);

  return {
    items: result.items,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages,
    },
  };
};

const create = async (input: CreateUnitInput) => {
  await ensureCategoryExists(input.categoryId);
  await ensureUniqueWithinCategory(input.categoryId, input.shortName);

  return unitModel.create({
    name: input.name,
    shortName: input.shortName,
    description: input.description,
    categoryId: input.categoryId,
  });
};

const update = async (id: string, input: UpdateUnitInput) => {
  const existing = await unitModel.findById(id);
  if (!existing) {
    throw new AppError("Unit not found", 404);
  }

  const nextCategoryId = input.categoryId ?? existing.categoryId;

  if (input.categoryId && input.categoryId !== existing.categoryId) {
    await ensureCategoryExists(input.categoryId);
  }

  if (input.shortName || input.categoryId) {
    await ensureUniqueWithinCategory(
      nextCategoryId,
      input.shortName ?? existing.shortName,
      id,
    );
  }

  return unitModel.update(id, {
    name: input.name,
    shortName: input.shortName,
    description: input.description,
    categoryId: input.categoryId,
  });
};

const remove = async (id: string) => {
  const existing = await unitModel.findById(id);
  if (!existing) {
    throw new AppError("Unit not found", 404);
  }

  return unitModel.remove(id);
};

export const unitService = {
  getById,
  list,
  create,
  update,
  remove,
};
