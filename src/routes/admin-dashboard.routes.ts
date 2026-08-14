import { Router } from "express";
import { adminDashboardController } from "../controllers/admin-dashboard.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";

const adminDashboardRouter = Router();

adminDashboardRouter.use(authenticate, requirePermission("dashboard"));
adminDashboardRouter.get("/", adminDashboardController.getDashboard);

export { adminDashboardRouter };
export default adminDashboardRouter;
