import type { Response } from "express";

interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export const sendSuccessResponse = <T>(
  response: Response,
  statusCode: number,
  data: T,
  message?: string,
): void => {
  const payload: SuccessResponse<T> = {
    success: true,
    data,
    ...(message ? { message } : {}),
  };

  response.status(statusCode).json(payload);
};
