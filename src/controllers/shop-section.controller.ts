import type { Request, RequestHandler } from "express";

import { shopSectionService } from "../services/shop-section.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  CreateShopSectionInput,
  ShopSectionIdParams,
  ListShopSectionsQuery,
  UpdateShopSectionInput,
} from "../validations/shop-section.validation.js";

type CreateRequest = Request<Record<string, never>, unknown, CreateShopSectionInput>;
type UpdateRequest = Request<ShopSectionIdParams, unknown, UpdateShopSectionInput>;
type GetRequest = Request<ShopSectionIdParams>;
type ListRequest = Request<Record<string, string>, unknown, unknown, ListShopSectionsQuery>;

const listActive: RequestHandler = async (_request, response, next) => {
  try {
    const sections = await shopSectionService.listActiveForStore();
    sendSuccessResponse(response, 200, { sections }, "Active shop sections retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const list: RequestHandler = async (request, response, next) => {
  try {
    const result = await shopSectionService.list(
      (request as unknown as ListRequest).query,
    );
    sendSuccessResponse(response, 200, result, "Shop sections retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const getOne: RequestHandler = async (request, response, next) => {
  try {
    const section = await shopSectionService.getById((request as GetRequest).params.id);
    sendSuccessResponse(response, 200, section, "Shop section retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = async (request, response, next) => {
  try {
    const section = await shopSectionService.create((request as CreateRequest).body);
    sendSuccessResponse(response, 201, section, "Shop section created successfully");
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = async (request, response, next) => {
  try {
    const typed = request as UpdateRequest;
    const section = await shopSectionService.update(typed.params.id, typed.body);
    sendSuccessResponse(response, 200, section, "Shop section updated successfully");
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = async (request, response, next) => {
  try {
    const section = await shopSectionService.remove((request as GetRequest).params.id);
    sendSuccessResponse(response, 200, section, "Shop section deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const shopSectionController = {
  listActive,
  list,
  getOne,
  create,
  update,
  remove,
};
