import type { Request, RequestHandler } from "express";

import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { userService } from "../services/user.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  CreateUserInput,
  ListUsersQuery,
  UpdateUserInput,
  UserIdParams,
} from "../validations/user.validation.js";

type CreateUserRequest = Request<Record<string, never>, unknown, CreateUserInput>;
type UpdateUserRequest = Request<UserIdParams, unknown, UpdateUserInput>;
type GetUserRequest = Request<UserIdParams>;
type ListUsersRequest = Request<Record<string, string>, unknown, unknown, ListUsersQuery>;

const listUsers: RequestHandler = async (request, response, next) => {
  try {
    const result = await userService.listUsers((request as unknown as ListUsersRequest).query);

    sendSuccessResponse(response, 200, result, "Users retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const getUser: RequestHandler = async (request, response, next) => {
  try {
    const user = await userService.getUserById((request as GetUserRequest).params.id);

    sendSuccessResponse(response, 200, user, "User retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const createUser: RequestHandler = async (request, response, next) => {
  try {
    const user = await userService.createUser((request as CreateUserRequest).body);

    sendSuccessResponse(response, 201, user, "User created successfully");
  } catch (error) {
    next(error);
  }
};

const updateUser: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest & UpdateUserRequest;

    const user = await userService.updateUser(
      authenticatedRequest.params.id,
      authenticatedRequest.body,
      authenticatedRequest.user!.id,
    );

    sendSuccessResponse(response, 200, user, "User updated successfully");
  } catch (error) {
    next(error);
  }
};

const deleteUser: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest & GetUserRequest;

    const user = await userService.deleteUser(
      authenticatedRequest.params.id,
      authenticatedRequest.user!.id,
    );

    sendSuccessResponse(response, 200, user, "User deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const userController = {
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
};
