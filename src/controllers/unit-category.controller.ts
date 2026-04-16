import type { Request, RequestHandler } from "express";

import { unitCategoryService } from "../services/unit-category.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  CreateUnitCategoryInput,
  ListUnitCategoriesQuery,
  UnitCategoryIdParams,
  UpdateUnitCategoryInput,
} from "../validations/unit-category.validation.js";

type CreateRequest = Request<Record<string, never>, unknown, CreateUnitCategoryInput>;
type UpdateRequest = Request<UnitCategoryIdParams, unknown, UpdateUnitCategoryInput>;
type GetRequest = Request<UnitCategoryIdParams>;
type ListRequest = Request<Record<string, string>, unknown, unknown, ListUnitCategoriesQuery>;

const list: RequestHandler = async (request, response, next) => {
  try {
    const result = await unitCategoryService.list(
      (request as unknown as ListRequest).query,
    );
    sendSuccessResponse(response, 200, result, "Unit categories retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const getOne: RequestHandler = async (request, response, next) => {
  try {
    const record = await unitCategoryService.getById(
      (request as GetRequest).params.id,
    );
    sendSuccessResponse(response, 200, record, "Unit category retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = async (request, response, next) => {
  try {
    const record = await unitCategoryService.create(
      (request as CreateRequest).body,
    );
    sendSuccessResponse(response, 201, record, "Unit category created successfully");
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = async (request, response, next) => {
  try {
    const typed = request as UpdateRequest;
    const record = await unitCategoryService.update(typed.params.id, typed.body);
    sendSuccessResponse(response, 200, record, "Unit category updated successfully");
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = async (request, response, next) => {
  try {
    const record = await unitCategoryService.remove(
      (request as GetRequest).params.id,
    );
    sendSuccessResponse(response, 200, record, "Unit category deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const unitCategoryController = {
  list,
  getOne,
  create,
  update,
  remove,
};
