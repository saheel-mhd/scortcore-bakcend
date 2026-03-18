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

export const authModel = {
  findUserByEmail,
  createUser,
};
