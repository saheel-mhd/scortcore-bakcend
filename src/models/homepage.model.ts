import type { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const publicHomepageSelect = {
  id: true,
  key: true,
  sections: true,
  banner: true,
  layoutConfig: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.HomepageSelect;

export type HomepageRecord = Prisma.HomepageGetPayload<{
  select: typeof publicHomepageSelect;
}>;

export interface CreateHomepageRecordData {
  key: string;
  sections: Prisma.InputJsonValue;
  banner: Prisma.InputJsonValue;
  layoutConfig: Prisma.InputJsonValue;
}

export interface UpdateHomepageRecordData {
  sections?: Prisma.InputJsonValue;
  banner?: Prisma.InputJsonValue;
  layoutConfig?: Prisma.InputJsonValue;
}

const findHomepageByKey = async (key: string): Promise<HomepageRecord | null> => {
  return prisma.homepage.findUnique({
    where: { key },
    select: publicHomepageSelect,
  });
};

const createHomepage = async (data: CreateHomepageRecordData): Promise<HomepageRecord> => {
  return prisma.homepage.create({
    data,
    select: publicHomepageSelect,
  });
};

const updateHomepage = async (key: string, data: UpdateHomepageRecordData): Promise<HomepageRecord> => {
  return prisma.homepage.update({
    where: { key },
    data,
    select: publicHomepageSelect,
  });
};

const deleteHomepage = async (key: string): Promise<HomepageRecord> => {
  return prisma.homepage.delete({
    where: { key },
    select: publicHomepageSelect,
  });
};

export const homepageModel = {
  findHomepageByKey,
  createHomepage,
  updateHomepage,
  deleteHomepage,
};
