import type { RequestHandler } from "express";

import { adminDashboardService } from "../services/admin-dashboard.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";

const getDashboard: RequestHandler = async (_request, response, next) => {
  try {
    const summary = await adminDashboardService.getDashboard();
    sendSuccessResponse(response, 200, summary, "Dashboard retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export const adminDashboardController = {
  getDashboard,
};
