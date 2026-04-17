import type { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const publicSelect = {
  id: true,
  name: true,
  description: true,
  permissions: true,
  isSystem: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.RoleConfigSelect;

export type RoleConfigRecord = Prisma.RoleConfigGetPayload<{
  select: typeof publicSelect;
}>;

export interface CreateRoleConfigData {
  name: string;
  description?: string;
  permissions: Prisma.InputJsonValue;
  isSystem?: boolean;
}

export interface UpdateRoleConfigData {
  name?: string;
  description?: string | null;
  permissions?: Prisma.InputJsonValue;
}

const findById = async (id: string): Promise<RoleConfigRecord | null> => {
  return prisma.roleConfig.findUnique({
    where: { id },
    select: publicSelect,
  });
};

const findByName = async (name: string): Promise<RoleConfigRecord | null> => {
  return prisma.roleConfig.findUnique({
    where: { name },
    select: publicSelect,
  });
};

const list = async () => {
  return prisma.roleConfig.findMany({
    orderBy: [{ isSystem: "desc" }, { createdAt: "asc" }],
    select: publicSelect,
  });
};

const create = async (data: CreateRoleConfigData): Promise<RoleConfigRecord> => {
  return prisma.roleConfig.create({
    data,
    select: publicSelect,
  });
};

const update = async (
  id: string,
  data: UpdateRoleConfigData,
): Promise<RoleConfigRecord> => {
  return prisma.roleConfig.update({
    where: { id },
    data,
    select: publicSelect,
  });
};

const remove = async (id: string): Promise<RoleConfigRecord> => {
  return prisma.roleConfig.delete({
    where: { id },
    select: publicSelect,
  });
};

export const roleConfigModel = {
  findById,
  findByName,
  list,
  create,
  update,
  remove,
};
