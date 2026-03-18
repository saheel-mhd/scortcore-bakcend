import type { Request, RequestHandler } from "express";

import { authService } from "../services/auth.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type { LoginUserInput, RegisterUserInput } from "../validations/auth.validation.js";

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

export const authController = {
  registerUser,
  loginUser,
};
