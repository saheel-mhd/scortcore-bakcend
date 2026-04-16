import { Router } from "express";

import { Role } from "@prisma/client";
import { adminDashboardController } from "../controllers/admin-dashboard.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const adminDashboardRouter = Router();

adminDashboardRouter.use(authenticate, authorize(Role.admin, Role.staff));

adminDashboardRouter.get("/", adminDashboardController.getDashboard);

export { adminDashboardRouter };
export default adminDashboardRouter;
