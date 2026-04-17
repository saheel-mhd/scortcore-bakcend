import type { Request, RequestHandler } from "express";

import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { authService } from "../services/auth.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  ChangePasswordInput,
  LoginUserInput,
  RegisterUserInput,
} from "../validations/auth.validation.js";

type RegisterRequest = Request<Record<string, never>, unknown, RegisterUserInput>;
type LoginRequest = Request<Record<string, never>, unknown, LoginUserInput>;

const registerUser: RequestHandler = async (request, response, next) => {
  try {
    const result = await authService.register((request as RegisterRequest).body);

    sendSuccessResponse(response, 201, result, "User registered successfully");
  } catch (error) {
    next(error);
  }
};

const loginUser: RequestHandler = async (request, response, next) => {
  try {
    const result = await authService.login((request as LoginRequest).body);

    sendSuccessResponse(response, 200, result, "Login successful");
  } catch (error) {
    next(error);
  }
};

const getMe: RequestHandler = async (request, response, next) => {
  try {
    const authed = request as AuthenticatedRequest;
    if (!authed.user) {
      throw new AppError("Authentication required", 401);
    }
    const user = await authService.getMe(authed.user.id);

    sendSuccessResponse(response, 200, user, "Current user retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const changeMyPassword: RequestHandler = async (request, response, next) => {
  try {
    const authed = request as AuthenticatedRequest;
    if (!authed.user) {
      throw new AppError("Authentication required", 401);
    }
    const user = await authService.changeMyPassword(
      authed.user.id,
      request.body as ChangePasswordInput,
    );

    sendSuccessResponse(response, 200, user, "Password changed successfully");
  } catch (error) {
    next(error);
  }
};

export const authController = {
  registerUser,
  loginUser,
  getMe,
  changeMyPassword,
};
