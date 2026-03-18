import type { ErrorRequestHandler } from "express";
import { Prisma } from "@prisma/client";
import { ZodError } from "zod";

import { AppError } from "../utils/app-error.js";

export const errorMiddleware: ErrorRequestHandler = (error, _request, response, next) => {
  if (response.headersSent) {
    next(error);
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  if (error instanceof ZodError) {
    const validationMessage =
      error.issues[0]?.message ?? "Validation failed for the provided request data";

    response.status(400).json({
      success: false,
      message: validationMessage,
    });
    return;
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
    response.status(409).json({
      success: false,
      message: "A resource with the provided unique field already exists",
    });
    return;
  }

  response.status(500).json({
    success: false,
    message: "Internal server error",
  });
};
