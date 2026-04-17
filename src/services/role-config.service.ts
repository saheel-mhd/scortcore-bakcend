import type { Prisma } from "@prisma/client";

import { roleConfigModel } from "../models/role-config.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateRoleConfigInput,
  UpdateRoleConfigInput,
} from "../validations/role-config.validation.js";

const list = async () => {
  return roleConfigModel.list();
};

const getById = async (id: string) => {
  const role = await roleConfigModel.findById(id);
  if (!role) {
    throw new AppError("Role not found", 404);
  }
  return role;
};

const create = async (input: CreateRoleConfigInput) => {
  const normalized = input.name.trim().toLowerCase();
  const existing = await roleConfigModel.findByName(normalized);
  if (existing) {
    throw new AppError("A role with this name already exists", 409);
  }

  return roleConfigModel.create({
    name: normalized,
    description: input.description,
    permissions: input.permissions as unknown as Prisma.InputJsonValue,
  });
};

const update = async (id: string, input: UpdateRoleConfigInput) => {
  const existing = await roleConfigModel.findById(id);
  if (!existing) {
    throw new AppError("Role not found", 404);
  }

  if (existing.isSystem) {
    throw new AppError("System roles cannot be modified", 403);
  }

  if (input.name) {
    const normalized = input.name.trim().toLowerCase();
    const duplicate = await roleConfigModel.findByName(normalized);
    if (duplicate && duplicate.id !== id) {
      throw new AppError("A role with this name already exists", 409);
    }
    input.name = normalized;
  }

  return roleConfigModel.update(id, {
    name: input.name,
    description: input.description,
    permissions: input.permissions
      ? (input.permissions as unknown as Prisma.InputJsonValue)
      : undefined,
  });
};

const remove = async (id: string) => {
  const existing = await roleConfigModel.findById(id);
  if (!existing) {
    throw new AppError("Role not found", 404);
  }

  if (existing.isSystem) {
    throw new AppError("System roles cannot be deleted", 403);
  }

  return roleConfigModel.remove(id);
};

export const roleConfigService = {
  list,
  getById,
  create,
  update,
  remove,
};
