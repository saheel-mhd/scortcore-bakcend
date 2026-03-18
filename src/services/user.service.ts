import { hash } from "bcryptjs";

import type { Prisma } from "@prisma/client";
import { env } from "../config/env.js";
import { userModel } from "../models/user.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
} from "../validations/user.validation.js";

interface ListUsersResult {
  users: Awaited<ReturnType<typeof userModel.listUsers>>["users"];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const getUserById = async (id: string) => {
  const user = await userModel.findUserById(id);

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

const listUsers = async (query: ListUsersQuery): Promise<ListUsersResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await userModel.listUsers({
    skip,
    take: limit,
    search: query.search,
    role: query.role,
    sortBy: query.sortBy as Prisma.UserScalarFieldEnum,
    sortOrder: query.sortOrder,
  });

  const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / limit);

  return {
    users: result.users,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages,
    },
  };
};

const createUser = async (input: CreateUserInput) => {
  const existingUser = await userModel.findUserWithPasswordByEmail(input.email);

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const hashedPassword = await hash(input.password, env.BCRYPT_SALT_ROUNDS);

  return userModel.createUser({
    email: input.email,
    password: hashedPassword,
    role: input.role,
  });
};

const updateUser = async (id: string, input: UpdateUserInput, requesterId: string) => {
  const existingUser = await userModel.findUserWithPasswordById(id);

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  if (input.email) {
    const userWithSameEmail = await userModel.findUserWithPasswordByEmail(input.email);

    if (userWithSameEmail && userWithSameEmail.id !== id) {
      throw new AppError("User with this email already exists", 409);
    }
  }

  if (requesterId === id && input.role && input.role !== existingUser.role) {
    throw new AppError("You cannot change your own role from the admin panel", 400);
  }

  const updateData: {
    email?: string;
    password?: string;
    role?: CreateUserInput["role"];
  } = {};

  if (input.email) {
    updateData.email = input.email;
  }

  if (input.password) {
    updateData.password = await hash(input.password, env.BCRYPT_SALT_ROUNDS);
  }

  if (input.role) {
    updateData.role = input.role;
  }

  return userModel.updateUser(id, updateData);
};

const deleteUser = async (id: string, requesterId: string) => {
  const existingUser = await userModel.findUserById(id);

  if (!existingUser) {
    throw new AppError("User not found", 404);
  }

  if (requesterId === id) {
    throw new AppError("You cannot delete your own account from the admin panel", 400);
  }

  return userModel.deleteUser(id);
};

export const userService = {
  getUserById,
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
