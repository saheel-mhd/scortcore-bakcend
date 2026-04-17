import type { Prisma, Role, User } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const publicUserSelect = {
  id: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type PublicUser = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

export interface CreateUserData {
  email: string;
  password: string;
  role: Role;
}

const findUserByEmail = async (email: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const createUser = async (data: CreateUserData): Promise<PublicUser> => {
  return prisma.user.create({
    data,
    select: publicUserSelect,
  });
};

const findUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

const findPublicUserById = async (id: string): Promise<PublicUser | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });
};

const updateUserPassword = async (id: string, hashedPassword: string): Promise<PublicUser> => {
  return prisma.user.update({
    where: { id },
    data: { password: hashedPassword },
    select: publicUserSelect,
  });
};

export const authModel = {
  findUserByEmail,
  findUserById,
  findPublicUserById,
  createUser,
  updateUserPassword,
};
