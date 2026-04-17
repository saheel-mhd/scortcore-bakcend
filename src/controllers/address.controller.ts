import type { Request, RequestHandler } from "express";

import type { AuthenticatedRequest, AuthenticatedUser } from "../middlewares/auth.middleware.js";
import { addressService } from "../services/address.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  AddressIdParams,
  CreateAddressInput,
  UpdateAddressInput,
} from "../validations/address.validation.js";

type IdRequest = Request<AddressIdParams>;

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
    const addresses = await addressService.listMine(user.id);
    sendSuccessResponse(response, 200, { addresses }, "Addresses retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = async (request, response, next) => {
  try {
    const user = requireAuth(request);
    const address = await addressService.create(user.id, request.body as CreateAddressInput);
    sendSuccessResponse(response, 201, address, "Address created successfully");
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = async (request, response, next) => {
  try {
    const user = requireAuth(request);
    const params = (request as IdRequest).params;
    const address = await addressService.update(
      params.id,
      user.id,
      request.body as UpdateAddressInput,
    );
    sendSuccessResponse(response, 200, address, "Address updated successfully");
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = async (request, response, next) => {
  try {
    const user = requireAuth(request);
    const address = await addressService.remove(
      (request as IdRequest).params.id,
      user.id,
    );
    sendSuccessResponse(response, 200, address, "Address deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const addressController = {
  list,
  create,
  update,
  remove,
};
