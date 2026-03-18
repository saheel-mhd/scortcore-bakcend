import { Router } from "express";

import { Role } from "@prisma/client";
import { complaintController } from "../controllers/complaint.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { validateRequest } from "../middlewares/validate.middleware.js";
import {
  createComplaintValidationSchema,
  getComplaintValidationSchema,
  listComplaintsValidationSchema,
  listMyComplaintsValidationSchema,
  replyComplaintValidationSchema,
  updateComplaintStatusValidationSchema,
} from "../validations/complaint.validation.js";

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
  authorize(Role.admin),
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
  authorize(Role.admin),
  validateRequest(replyComplaintValidationSchema),
  complaintController.replyToComplaint,
);
complaintRouter.put(
  "/:id/status",
  authorize(Role.admin),
  validateRequest(updateComplaintStatusValidationSchema),
  complaintController.updateComplaintStatus,
);

export { complaintRouter };
export default complaintRouter;
