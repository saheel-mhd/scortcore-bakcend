import type { Request, RequestHandler } from "express";

import { unitService } from "../services/unit.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  CreateUnitInput,
  ListUnitsQuery,
  UnitIdParams,
  UpdateUnitInput,
} from "../validations/unit.validation.js";

type CreateRequest = Request<Record<string, never>, unknown, CreateUnitInput>;
type UpdateRequest = Request<UnitIdParams, unknown, UpdateUnitInput>;
type GetRequest = Request<UnitIdParams>;
type ListRequest = Request<Record<string, string>, unknown, unknown, ListUnitsQuery>;

const list: RequestHandler = async (request, response, next) => {
  try {
    const result = await unitService.list((request as unknown as ListRequest).query);
    sendSuccessResponse(response, 200, result, "Units retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const getOne: RequestHandler = async (request, response, next) => {
  try {
    const record = await unitService.getById((request as GetRequest).params.id);
    sendSuccessResponse(response, 200, record, "Unit retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = async (request, response, next) => {
  try {
    const record = await unitService.create((request as CreateRequest).body);
    sendSuccessResponse(response, 201, record, "Unit created successfully");
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = async (request, response, next) => {
  try {
    const typed = request as UpdateRequest;
    const record = await unitService.update(typed.params.id, typed.body);
    sendSuccessResponse(response, 200, record, "Unit updated successfully");
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = async (request, response, next) => {
  try {
    const record = await unitService.remove((request as GetRequest).params.id);
    sendSuccessResponse(response, 200, record, "Unit deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const unitController = {
  list,
  getOne,
  create,
  update,
  remove,
};
