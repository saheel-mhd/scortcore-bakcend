import { Router } from "express";
import { complaintController } from "../controllers/complaint.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { requirePermission } from "../middlewares/permission.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import { createComplaintValidationSchema, getComplaintValidationSchema, listComplaintsValidationSchema, listMyComplaintsValidationSchema, replyComplaintValidationSchema, updateComplaintStatusValidationSchema, } from "../validations/complaint.validation.js";

const complaintRouter = Router();

complaintRouter.use(authenticate);

complaintRouter.post(
  "/",
  validateRequest(createComplaintValidationSchema),
  complaintController.createComplaint,
);
complaintRouter.get(
  "/my-complaints",
  validateRequest(listMyComplaintsValidationSchema),
  complaintController.listMyComplaints,
);
complaintRouter.get(
  "/",
  requirePermission("orders"),
  validateRequest(listComplaintsValidationSchema),
  complaintController.listComplaints,
);
complaintRouter.get(
  "/:id",
  validateRequest(getComplaintValidationSchema),
  complaintController.getComplaint,
);
complaintRouter.put(
  "/:id/reply",
  requirePermission("orders"),
  validateRequest(replyComplaintValidationSchema),
  complaintController.replyToComplaint,
);
complaintRouter.put(
  "/:id/status",
  requirePermission("orders"),
  validateRequest(updateComplaintStatusValidationSchema),
  complaintController.updateComplaintStatus,
);

export { complaintRouter };
export default complaintRouter;
