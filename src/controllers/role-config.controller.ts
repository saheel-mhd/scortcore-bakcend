import type { Request, RequestHandler } from "express";

import { roleConfigService } from "../services/role-config.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  CreateRoleConfigInput,
  RoleConfigIdParams,
  UpdateRoleConfigInput,
} from "../validations/role-config.validation.js";

type CreateRequest = Request<Record<string, never>, unknown, CreateRoleConfigInput>;
type UpdateRequest = Request<RoleConfigIdParams, unknown, UpdateRoleConfigInput>;
type GetRequest = Request<RoleConfigIdParams>;

const list: RequestHandler = async (_request, response, next) => {
  try {
    const roles = await roleConfigService.list();
    sendSuccessResponse(response, 200, { roles }, "Roles retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const getOne: RequestHandler = async (request, response, next) => {
  try {
    const role = await roleConfigService.getById((request as GetRequest).params.id);
    sendSuccessResponse(response, 200, role, "Role retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = async (request, response, next) => {
  try {
    const role = await roleConfigService.create((request as CreateRequest).body);
    sendSuccessResponse(response, 201, role, "Role created successfully");
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = async (request, response, next) => {
  try {
    const typed = request as UpdateRequest;
    const role = await roleConfigService.update(typed.params.id, typed.body);
    sendSuccessResponse(response, 200, role, "Role updated successfully");
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = async (request, response, next) => {
  try {
    const role = await roleConfigService.remove((request as GetRequest).params.id);
    sendSuccessResponse(response, 200, role, "Role deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const roleConfigController = {
  list,
  getOne,
  create,
  update,
  remove,
};
