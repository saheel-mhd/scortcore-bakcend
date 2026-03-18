import { ComplaintStatus, type Prisma, type Role } from "@prisma/client";

import { complaintModel } from "../models/complaint.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateComplaintInput,
  ListComplaintsQuery,
  ListMyComplaintsQuery,
  ReplyComplaintInput,
  UpdateComplaintStatusInput,
} from "../validations/complaint.validation.js";

interface ListComplaintsResult {
  complaints: Awaited<ReturnType<typeof complaintModel.listComplaints>>["complaints"];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const complaintStatusTransitions: Record<ComplaintStatus, ComplaintStatus[]> = {
  open: [ComplaintStatus.in_progress, ComplaintStatus.resolved, ComplaintStatus.closed],
  in_progress: [ComplaintStatus.resolved, ComplaintStatus.closed],
  resolved: [ComplaintStatus.closed, ComplaintStatus.in_progress],
  closed: [],
};

const ensureComplaintAccess = (
  complaintCustomerId: string,
  authenticatedUser: { id: string; role: Role },
): void => {
  if (authenticatedUser.role === "admin") {
    return;
  }

  if (complaintCustomerId !== authenticatedUser.id) {
    throw new AppError("You are not authorized to access this complaint", 403);
  }
};

const buildComplaintListResult = async (
  query: {
    page: number;
    limit: number;
    status?: ComplaintStatus;
    customerId?: string;
    search?: string;
    sortBy: string;
    sortOrder: Prisma.SortOrder;
  },
): Promise<ListComplaintsResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const result = await complaintModel.listComplaints({
    skip,
    take: limit,
    status: query.status,
    customerId: query.customerId,
    search: query.search,
    sortBy: query.sortBy as Prisma.ComplaintScalarFieldEnum,
    sortOrder: query.sortOrder,
  });

  const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / limit);

  return {
    complaints: result.complaints,
    pagination: {
      page,
      limit,
      total: result.total,
      totalPages,
    },
  };
};

const createComplaint = async (
  input: CreateComplaintInput,
  authenticatedUser: { id: string; role: Role },
) => {
  return complaintModel.createComplaint({
    customerId: authenticatedUser.id,
    subject: input.subject,
    message: input.message,
  });
};

const getComplaintById = async (
  id: string,
  authenticatedUser: { id: string; role: Role },
) => {
  const complaint = await complaintModel.findComplaintById(id);

  if (!complaint) {
    throw new AppError("Complaint not found", 404);
  }

  ensureComplaintAccess(complaint.customerId, authenticatedUser);

  return complaint;
};

const listMyComplaints = async (
  query: ListMyComplaintsQuery,
  authenticatedUser: { id: string; role: Role },
): Promise<ListComplaintsResult> => {
  return buildComplaintListResult({
    ...query,
    customerId: authenticatedUser.id,
  });
};

const listComplaints = async (query: ListComplaintsQuery): Promise<ListComplaintsResult> => {
  return buildComplaintListResult(query);
};

const replyToComplaint = async (
  id: string,
  input: ReplyComplaintInput,
  authenticatedUser: { id: string; role: Role },
) => {
  const complaint = await complaintModel.findComplaintById(id);

  if (!complaint) {
    throw new AppError("Complaint not found", 404);
  }

  const nextStatus = input.status ?? ComplaintStatus.in_progress;

  if (complaint.status === ComplaintStatus.closed && nextStatus !== ComplaintStatus.closed) {
    throw new AppError("Closed complaints cannot be reopened by reply", 400);
  }

  return complaintModel.updateComplaint(id, {
    adminReply: input.reply,
    repliedById: authenticatedUser.id,
    repliedAt: new Date(),
    status: nextStatus,
  });
};

const updateComplaintStatus = async (id: string, input: UpdateComplaintStatusInput) => {
  const complaint = await complaintModel.findComplaintById(id);

  if (!complaint) {
    throw new AppError("Complaint not found", 404);
  }

  if (complaint.status === input.status) {
    return complaint;
  }

  const allowedNextStatuses = complaintStatusTransitions[complaint.status];

  if (!allowedNextStatuses.includes(input.status)) {
    throw new AppError(
      `Invalid complaint status transition from ${complaint.status} to ${input.status}`,
      400,
    );
  }

  return complaintModel.updateComplaint(id, {
    status: input.status,
  });
};

export const complaintService = {
  createComplaint,
  getComplaintById,
  listMyComplaints,
  listComplaints,
  replyToComplaint,
  updateComplaintStatus,
};
