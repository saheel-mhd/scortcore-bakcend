import type { Request, RequestHandler } from "express";

import { themeService } from "../services/theme.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  CreateThemeInput,
  ListThemesQuery,
  ThemeIdParams,
  UpdateThemeInput,
} from "../validations/theme.validation.js";

type CreateThemeRequest = Request<Record<string, never>, unknown, CreateThemeInput>;
type UpdateThemeRequest = Request<ThemeIdParams, unknown, UpdateThemeInput>;
type GetThemeRequest = Request<ThemeIdParams>;
type ListThemesRequest = Request<Record<string, string>, unknown, unknown, ListThemesQuery>;

const getActiveTheme: RequestHandler = async (_request, response, next) => {
  try {
    const theme = await themeService.getActiveTheme();

    sendSuccessResponse(response, 200, theme, "Active theme retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const listThemes: RequestHandler = async (request, response, next) => {
  try {
    const result = await themeService.listThemes((request as unknown as ListThemesRequest).query);

    sendSuccessResponse(response, 200, result, "Themes retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const getTheme: RequestHandler = async (request, response, next) => {
  try {
    const theme = await themeService.getThemeById((request as GetThemeRequest).params.id);

    sendSuccessResponse(response, 200, theme, "Theme retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const createTheme: RequestHandler = async (request, response, next) => {
  try {
    const theme = await themeService.createTheme((request as CreateThemeRequest).body);

    sendSuccessResponse(response, 201, theme, "Theme created successfully");
  } catch (error) {
    next(error);
  }
};

const updateTheme: RequestHandler = async (request, response, next) => {
  try {
    const typedRequest = request as UpdateThemeRequest;
    const theme = await themeService.updateTheme(typedRequest.params.id, typedRequest.body);

    sendSuccessResponse(response, 200, theme, "Theme updated successfully");
  } catch (error) {
    next(error);
  }
};

const activateTheme: RequestHandler = async (request, response, next) => {
  try {
    const theme = await themeService.activateTheme((request as GetThemeRequest).params.id);

    sendSuccessResponse(response, 200, theme, "Theme activated successfully");
  } catch (error) {
    next(error);
  }
};

const deleteTheme: RequestHandler = async (request, response, next) => {
  try {
    const theme = await themeService.deleteTheme((request as GetThemeRequest).params.id);

    sendSuccessResponse(response, 200, theme, "Theme deleted successfully");
  } catch (error) {
    next(error);
  }
};

export const themeController = {
  getActiveTheme,
  listThemes,
  getTheme,
  createTheme,
  updateTheme,
  activateTheme,
  deleteTheme,
};
