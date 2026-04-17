import type { Prisma } from "@prisma/client";

import { prisma } from "../config/prisma.js";

const publicAddressSelect = {
  id: true,
  customerId: true,
  label: true,
  fullName: true,
  phone: true,
  line1: true,
  line2: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AddressSelect;

export type AddressRecord = Prisma.AddressGetPayload<{
  select: typeof publicAddressSelect;
}>;

export interface CreateAddressRecordData {
  customerId: string;
  label?: string;
  fullName: string;
  phone?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface UpdateAddressRecordData {
  label?: string | null;
  fullName?: string;
  phone?: string | null;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string | null;
  postalCode?: string;
  country?: string;
  isDefault?: boolean;
}

const listByCustomer = async (customerId: string): Promise<AddressRecord[]> => {
  return prisma.address.findMany({
    where: { customerId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }],
    select: publicAddressSelect,
  });
};

const findById = async (id: string): Promise<AddressRecord | null> => {
  return prisma.address.findUnique({
    where: { id },
    select: publicAddressSelect,
  });
};

const create = async (data: CreateAddressRecordData): Promise<AddressRecord> => {
  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { customerId: data.customerId, isDefault: true },
        data: { isDefault: false },
      });
    }

    return tx.address.create({
      data,
      select: publicAddressSelect,
    });
  });
};

const update = async (
  id: string,
  customerId: string,
  data: UpdateAddressRecordData,
): Promise<AddressRecord> => {
  return prisma.$transaction(async (tx) => {
    if (data.isDefault) {
      await tx.address.updateMany({
        where: { customerId, isDefault: true, NOT: { id } },
        data: { isDefault: false },
      });
    }

    return tx.address.update({
      where: { id },
      data,
      select: publicAddressSelect,
    });
  });
};

const remove = async (id: string): Promise<AddressRecord> => {
  return prisma.address.delete({
    where: { id },
    select: publicAddressSelect,
  });
};

export const addressModel = {
  listByCustomer,
  findById,
  create,
  update,
  remove,
};
