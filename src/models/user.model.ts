import type { Prisma, Role } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const publicUserSelect = {
  id: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

export type UserRecord = Prisma.UserGetPayload<{
  select: typeof publicUserSelect;
}>;

export interface CreateUserRecordData {
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserRecordData {
  email?: string;
  password?: string;
  role?: Role;
}

export interface ListUsersOptions {
  skip: number;
  take: number;
  search?: string;
  role?: Role;
  sortBy: Prisma.UserScalarFieldEnum;
  sortOrder: Prisma.SortOrder;
}

const buildUserWhereInput = (options: Pick<ListUsersOptions, "search" | "role">): Prisma.UserWhereInput => {
  const andConditions: Prisma.UserWhereInput[] = [];

  if (options.search) {
    andConditions.push({
      OR: [
        {
          email: {
            contains: options.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (options.role) {
    andConditions.push({
      role: options.role,
    });
  }

  if (andConditions.length === 0) {
    return {};
  }

  return {
    AND: andConditions,
  };
};

const findUserById = async (id: string): Promise<UserRecord | null> => {
  return prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });
};

const findUserWithPasswordById = async (id: string) => {
  return prisma.user.findUnique({
    where: { id },
  });
};

const findUserWithPasswordByEmail = async (email: string) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const createUser = async (data: CreateUserRecordData): Promise<UserRecord> => {
  return prisma.user.create({
    data,
    select: publicUserSelect,
  });
};

const updateUser = async (id: string, data: UpdateUserRecordData): Promise<UserRecord> => {
  return prisma.user.update({
    where: { id },
    data,
    select: publicUserSelect,
  });
};

const deleteUser = async (id: string): Promise<UserRecord> => {
  return prisma.user.delete({
    where: { id },
    select: publicUserSelect,
  });
};

const listUsers = async (options: ListUsersOptions) => {
  const where = buildUserWhereInput(options);

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: {
        [options.sortBy]: options.sortOrder,
      },
      select: publicUserSelect,
    }),
    prisma.user.count({ where }),
  ]);

  return {
    users,
    total,
  };
};

export const userModel = {
  findUserById,
  findUserWithPasswordById,
  findUserWithPasswordByEmail,
  createUser,
  updateUser,
  deleteUser,
  listUsers,
};
