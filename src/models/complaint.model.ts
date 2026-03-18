import type { ComplaintStatus, Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const complaintCustomerSelect = {
  id: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

const complaintReplyAuthorSelect = {
  id: true,
  email: true,
  role: true,
} satisfies Prisma.UserSelect;

const publicComplaintSelect = {
  id: true,
  customerId: true,
  customer: {
    select: complaintCustomerSelect,
  },
  subject: true,
  message: true,
  adminReply: true,
  repliedById: true,
  repliedBy: {
    select: complaintReplyAuthorSelect,
  },
  repliedAt: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.ComplaintSelect;

export type ComplaintRecord = Prisma.ComplaintGetPayload<{
  select: typeof publicComplaintSelect;
}>;

export interface CreateComplaintRecordData {
  customerId: string;
  subject: string;
  message: string;
}

export interface UpdateComplaintRecordData {
  adminReply?: string;
  repliedById?: string;
  repliedAt?: Date | null;
  status?: ComplaintStatus;
}

export interface ListComplaintsOptions {
  skip: number;
  take: number;
  status?: ComplaintStatus;
  customerId?: string;
  search?: string;
  sortBy: Prisma.ComplaintScalarFieldEnum;
  sortOrder: Prisma.SortOrder;
}

const buildComplaintWhereInput = (
  options: Pick<ListComplaintsOptions, "status" | "customerId" | "search">,
): Prisma.ComplaintWhereInput => {
  const andConditions: Prisma.ComplaintWhereInput[] = [];

  if (options.status) {
    andConditions.push({
      status: options.status,
    });
  }

  if (options.customerId) {
    andConditions.push({
      customerId: options.customerId,
    });
  }

  if (options.search) {
    andConditions.push({
      OR: [
        {
          subject: {
            contains: options.search,
            mode: "insensitive",
          },
        },
        {
          message: {
            contains: options.search,
            mode: "insensitive",
          },
        },
      ],
    });
  }

  if (andConditions.length === 0) {
    return {};
  }

  return {
    AND: andConditions,
  };
};

const findComplaintById = async (id: string): Promise<ComplaintRecord | null> => {
  return prisma.complaint.findUnique({
    where: { id },
    select: publicComplaintSelect,
  });
};

const createComplaint = async (data: CreateComplaintRecordData): Promise<ComplaintRecord> => {
  return prisma.complaint.create({
    data,
    select: publicComplaintSelect,
  });
};

const updateComplaint = async (
  id: string,
  data: UpdateComplaintRecordData,
): Promise<ComplaintRecord> => {
  return prisma.complaint.update({
    where: { id },
    data,
    select: publicComplaintSelect,
  });
};

const listComplaints = async (options: ListComplaintsOptions) => {
  const where = buildComplaintWhereInput(options);

  const [complaints, total] = await prisma.$transaction([
    prisma.complaint.findMany({
      where,
      skip: options.skip,
      take: options.take,
      orderBy: {
        [options.sortBy]: options.sortOrder,
      },
      select: publicComplaintSelect,
    }),
    prisma.complaint.count({ where }),
  ]);

  return {
    complaints,
    total,
  };
};

export const complaintModel = {
  findComplaintById,
  createComplaint,
  updateComplaint,
  listComplaints,
};
