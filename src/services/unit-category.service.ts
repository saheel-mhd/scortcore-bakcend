import type { Prisma } from "@prisma/client";

import { unitCategoryModel } from "../models/unit-category.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateUnitCategoryInput,
  ListUnitCategoriesQuery,
  UpdateUnitCategoryInput,
} from "../validations/unit-category.validation.js";

interface ListResult {
  items: Awaited<ReturnType<typeof unitCategoryModel.list>>["items"];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const ensureUnique = async (
  name: string | undefined,
  shortName: string | undefined,
  currentId?: string,
): Promise<void> => {
  if (name) {
    const existing = await unitCategoryModel.findByName(name);
    if (existing && existing.id !== currentId) {
      throw new AppError("Unit category with this name already exists", 409);
    }
  }

  if (shortName) {
    const existing = await unitCategoryModel.findByShortName(shortName);
    if (existing && existing.id !== currentId) {
      throw new AppError("Unit category with this short name already exists", 409);
    }
  }
};

const getById = async (id: string) => {
  const record = await unitCategoryModel.findById(id);

  if (!record) {
    throw new AppError("Unit category not found", 404);
  }

  return record;
};

const list = async (query: ListUnitCategoriesQuery): Promise<ListResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await unitCategoryModel.list({
    skip,
    take: limit,
    search: query.search,
    sortBy: query.sortBy as Prisma.UnitCategoryScalarFieldEnum,
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

const create = async (input: CreateUnitCategoryInput) => {
  await ensureUnique(input.name, input.shortName);

  return unitCategoryModel.create({
    name: input.name,
    shortName: input.shortName,
    description: input.description,
  });
};

const update = async (id: string, input: UpdateUnitCategoryInput) => {
  const existing = await unitCategoryModel.findById(id);
  if (!existing) {
    throw new AppError("Unit category not found", 404);
  }

  await ensureUnique(input.name, input.shortName, id);

  return unitCategoryModel.update(id, {
    name: input.name,
    shortName: input.shortName,
    description: input.description,
  });
};

const remove = async (id: string) => {
  const existing = await unitCategoryModel.findById(id);
  if (!existing) {
    throw new AppError("Unit category not found", 404);
  }

  return unitCategoryModel.remove(id);
};

export const unitCategoryService = {
  getById,
  list,
  create,
  update,
  remove,
};
