import type { NextFunction, Request, Response } from "express";
import type { JwtPayload } from "jsonwebtoken";

import { Role } from "@prisma/client";
import { AppError } from "../utils/app-error.js";
import { verifyAuthToken } from "../utils/jwt.js";

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: Role;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

const isAuthenticatedPayload = (
  payload: string | JwtPayload,
): payload is JwtPayload & { sub: string; email: string; role: Role } => {
  return (
    typeof payload !== "string" &&
    typeof payload.sub === "string" &&
    typeof payload.email === "string" &&
    Object.values(Role).includes(payload.role as Role)
  );
};

export const authenticate = (
  request: AuthenticatedRequest,
  _response: Response,
  next: NextFunction,
): void => {
  const authorizationHeader = request.headers.authorization;

  if (!authorizationHeader?.startsWith("Bearer ")) {
    next(new AppError("Authentication token is required", 401));
    return;
  }

  const token = authorizationHeader.replace("Bearer ", "").trim();

  try {
    const decodedToken = verifyAuthToken(token);

    if (!isAuthenticatedPayload(decodedToken)) {
      next(new AppError("Invalid authentication token", 401));
      return;
    }

    request.user = {
      id: decodedToken.sub,
      email: decodedToken.email,
      role: decodedToken.role,
    };

    next();
  } catch {
    next(new AppError("Invalid or expired authentication token", 401));
  }
};

export const authorize =
  (...roles: Role[]) =>
  (request: AuthenticatedRequest, _response: Response, next: NextFunction): void => {
    if (!request.user) {
      next(new AppError("Authentication is required", 401));
      return;
    }

    if (!roles.includes(request.user.role)) {
      next(new AppError("You are not authorized to access this resource", 403));
      return;
    }

    next();
  };
