import type { Request, RequestHandler } from "express";

import type { AuthenticatedRequest, AuthenticatedUser } from "../middlewares/auth.middleware.js";
import { wishlistService } from "../services/wishlist.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type { WishlistProductIdParams } from "../validations/wishlist.validation.js";

type ProductRequest = Request<WishlistProductIdParams>;

const requireAuth = (req: Request): AuthenticatedUser => {
  const user = (req as AuthenticatedRequest).user;
  if (!user) {
    throw new AppError("Authentication required", 401);
  }
  return user;
};

const list: RequestHandler = async (request, response, next) => {
  try {
    const user = requireAuth(request);
    const result = await wishlistService.listMine(user.id);
    sendSuccessResponse(response, 200, result, "Wishlist retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const add: RequestHandler = async (request, response, next) => {
  try {
    const user = requireAuth(request);
    const result = await wishlistService.add(
      user.id,
      (request as ProductRequest).params.productId,
    );
    sendSuccessResponse(response, 200, result, "Added to wishlist");
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = async (request, response, next) => {
  try {
    const user = requireAuth(request);
    const result = await wishlistService.remove(
      user.id,
      (request as ProductRequest).params.productId,
    );
    sendSuccessResponse(response, 200, result, "Removed from wishlist");
  } catch (error) {
    next(error);
  }
};

export const wishlistController = {
  list,
  add,
  remove,
};
