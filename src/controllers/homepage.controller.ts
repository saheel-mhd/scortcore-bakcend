import type { Request, RequestHandler } from "express";

import { homepageService } from "../services/homepage.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  CreateHomepageInput,
  UpdateHomepageBannerInput,
  UpdateHomepageInput,
  UpdateHomepageLayoutInput,
  UpdateHomepageSectionsInput,
} from "../validations/homepage.validation.js";

type CreateHomepageRequest = Request<Record<string, never>, unknown, CreateHomepageInput>;
type UpdateHomepageRequest = Request<Record<string, never>, unknown, UpdateHomepageInput>;
type UpdateHomepageSectionsRequest = Request<Record<string, never>, unknown, UpdateHomepageSectionsInput>;
type UpdateHomepageBannerRequest = Request<Record<string, never>, unknown, UpdateHomepageBannerInput>;
type UpdateHomepageLayoutRequest = Request<Record<string, never>, unknown, UpdateHomepageLayoutInput>;

const getHomepage: RequestHandler = async (_request, response, next) => {
  try {
    const homepage = await homepageService.getHomepage();

    sendSuccessResponse(response, 200, homepage, "Homepage configuration retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const createHomepage: RequestHandler = async (request, response, next) => {
  try {
    const homepage = await homepageService.createHomepage((request as CreateHomepageRequest).body);

    sendSuccessResponse(response, 201, homepage, "Homepage configuration created successfully");
  } catch (error) {
    next(error);
  }
};

const updateHomepage: RequestHandler = async (request, response, next) => {
  try {
    const homepage = await homepageService.updateHomepage((request as UpdateHomepageRequest).body);

    sendSuccessResponse(response, 200, homepage, "Homepage configuration updated successfully");
  } catch (error) {
    next(error);
  }
};

const updateHomepageSections: RequestHandler = async (request, response, next) => {
  try {
    const homepage = await homepageService.updateHomepageSections(
      (request as UpdateHomepageSectionsRequest).body,
    );

    sendSuccessResponse(response, 200, homepage, "Homepage sections updated successfully");
  } catch (error) {
    next(error);
  }
};

const updateHomepageBanner: RequestHandler = async (request, response, next) => {
  try {
    const homepage = await homepageService.updateHomepageBanner(
      (request as UpdateHomepageBannerRequest).body,
    );

    sendSuccessResponse(response, 200, homepage, "Homepage banner updated successfully");
  } catch (error) {
    next(error);
  }
};

const updateHomepageLayout: RequestHandler = async (request, response, next) => {
  try {
    const homepage = await homepageService.updateHomepageLayout(
      (request as UpdateHomepageLayoutRequest).body,
    );

    sendSuccessResponse(response, 200, homepage, "Homepage layout updated successfully");
  } catch (error) {
    next(error);
  }
};

const deleteHomepage: RequestHandler = async (_request, response, next) => {
  try {
    const homepage = await homepageService.deleteHomepage();

    sendSuccessResponse(response, 200, homepage, "Homepage configuration deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const homepageController = {
  getHomepage,
  createHomepage,
  updateHomepage,
  updateHomepageSections,
  updateHomepageBanner,
  updateHomepageLayout,
  deleteHomepage,
};
