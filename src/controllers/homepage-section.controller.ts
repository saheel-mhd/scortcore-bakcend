import type { Request, RequestHandler } from "express";

import { homepageSectionService } from "../services/homepage-section.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  CreateHomepageSectionInput,
  HomepageSectionIdParams,
  ListHomepageSectionsQuery,
  UpdateHomepageSectionInput,
} from "../validations/homepage-section.validation.js";

type CreateRequest = Request<Record<string, never>, unknown, CreateHomepageSectionInput>;
type UpdateRequest = Request<HomepageSectionIdParams, unknown, UpdateHomepageSectionInput>;
type GetRequest = Request<HomepageSectionIdParams>;
type ListRequest = Request<Record<string, string>, unknown, unknown, ListHomepageSectionsQuery>;

const listActive: RequestHandler = async (_request, response, next) => {
  try {
    const sections = await homepageSectionService.listActiveForStore();
    sendSuccessResponse(response, 200, { sections }, "Active homepage sections retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const list: RequestHandler = async (request, response, next) => {
  try {
    const result = await homepageSectionService.list(
      (request as unknown as ListRequest).query,
    );
    sendSuccessResponse(response, 200, result, "Homepage sections retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const getOne: RequestHandler = async (request, response, next) => {
  try {
    const section = await homepageSectionService.getById((request as GetRequest).params.id);
    sendSuccessResponse(response, 200, section, "Homepage section retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const create: RequestHandler = async (request, response, next) => {
  try {
    const section = await homepageSectionService.create((request as CreateRequest).body);
    sendSuccessResponse(response, 201, section, "Homepage section created successfully");
  } catch (error) {
    next(error);
  }
};

const update: RequestHandler = async (request, response, next) => {
  try {
    const typed = request as UpdateRequest;
    const section = await homepageSectionService.update(typed.params.id, typed.body);
    sendSuccessResponse(response, 200, section, "Homepage section updated successfully");
  } catch (error) {
    next(error);
  }
};

const remove: RequestHandler = async (request, response, next) => {
  try {
    const section = await homepageSectionService.remove((request as GetRequest).params.id);
    sendSuccessResponse(response, 200, section, "Homepage section deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const homepageSectionController = {
  listActive,
  list,
  getOne,
  create,
  update,
  remove,
};
