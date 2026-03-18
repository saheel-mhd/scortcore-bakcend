import type { Request, RequestHandler } from "express";

import type { AuthenticatedRequest } from "../middlewares/auth.middleware.js";
import { complaintService } from "../services/complaint.service.js";
import { sendSuccessResponse } from "../utils/api-response.js";
import type {
  ComplaintIdParams,
  CreateComplaintInput,
  ListComplaintsQuery,
  ListMyComplaintsQuery,
  ReplyComplaintInput,
  UpdateComplaintStatusInput,
} from "../validations/complaint.validation.js";

type CreateComplaintRequest = Request<Record<string, never>, unknown, CreateComplaintInput>;
type GetComplaintRequest = Request<ComplaintIdParams>;
type ListMyComplaintsRequest = Request<Record<string, string>, unknown, unknown, ListMyComplaintsQuery>;
type ListComplaintsRequest = Request<Record<string, string>, unknown, unknown, ListComplaintsQuery>;
type ReplyComplaintRequest = Request<ComplaintIdParams, unknown, ReplyComplaintInput>;
type UpdateComplaintStatusRequest = Request<
  ComplaintIdParams,
  unknown,
  UpdateComplaintStatusInput
>;

const createComplaint: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest & CreateComplaintRequest;
    const complaint = await complaintService.createComplaint(
      authenticatedRequest.body,
      authenticatedRequest.user!,
    );

    sendSuccessResponse(response, 201, complaint, "Complaint created successfully");
  } catch (error) {
    next(error);
  }
};

const getComplaint: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest & GetComplaintRequest;
    const complaint = await complaintService.getComplaintById(
      authenticatedRequest.params.id,
      authenticatedRequest.user!,
    );

    sendSuccessResponse(response, 200, complaint, "Complaint retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const listMyComplaints: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest;
    const result = await complaintService.listMyComplaints(
      (request as unknown as ListMyComplaintsRequest).query,
      authenticatedRequest.user!,
    );

    sendSuccessResponse(response, 200, result, "User complaints retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const listComplaints: RequestHandler = async (request, response, next) => {
  try {
    const result = await complaintService.listComplaints(
      (request as unknown as ListComplaintsRequest).query,
    );

    sendSuccessResponse(response, 200, result, "Complaints retrieved successfully");
  } catch (error) {
    next(error);
  }
};

const replyToComplaint: RequestHandler = async (request, response, next) => {
  try {
    const authenticatedRequest = request as AuthenticatedRequest & ReplyComplaintRequest;
    const complaint = await complaintService.replyToComplaint(
      authenticatedRequest.params.id,
      authenticatedRequest.body,
      authenticatedRequest.user!,
    );

    sendSuccessResponse(response, 200, complaint, "Complaint replied successfully");
  } catch (error) {
    next(error);
  }
};

const updateComplaintStatus: RequestHandler = async (request, response, next) => {
  try {
    const typedRequest = request as UpdateComplaintStatusRequest;
    const complaint = await complaintService.updateComplaintStatus(
      typedRequest.params.id,
      typedRequest.body,
    );

    sendSuccessResponse(response, 200, complaint, "Complaint status updated successfully");
  } catch (error) {
    next(error);
  }
};

export const complaintController = {
  createComplaint,
  getComplaint,
  listMyComplaints,
  listComplaints,
  replyToComplaint,
  updateComplaintStatus,
};
