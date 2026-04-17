import { addressModel } from "../models/address.model.js";
import { AppError } from "../utils/app-error.js";
import type {
  CreateAddressInput,
  UpdateAddressInput,
} from "../validations/address.validation.js";

const ensureOwnership = async (id: string, customerId: string) => {
  const existing = await addressModel.findById(id);

  if (!existing) {
    throw new AppError("Address not found", 404);
  }

  if (existing.customerId !== customerId) {
    throw new AppError("You are not authorized to access this address", 403);
  }

  return existing;
};

const listMine = async (customerId: string) => {
  return addressModel.listByCustomer(customerId);
};

const create = async (customerId: string, input: CreateAddressInput) => {
  const existingCount = await addressModel.listByCustomer(customerId);
  const shouldDefault = existingCount.length === 0 ? true : input.isDefault;

  return addressModel.create({
    customerId,
    label: input.label,
    fullName: input.fullName,
    phone: input.phone,
    line1: input.line1,
    line2: input.line2,
    city: input.city,
    state: input.state,
    postalCode: input.postalCode,
    country: input.country,
    isDefault: shouldDefault,
  });
};

const update = async (id: string, customerId: string, input: UpdateAddressInput) => {
  await ensureOwnership(id, customerId);
  return addressModel.update(id, customerId, input);
};

const remove = async (id: string, customerId: string) => {
  const existing = await ensureOwnership(id, customerId);
  const removed = await addressModel.remove(id);

  if (existing.isDefault) {
    const remaining = await addressModel.listByCustomer(customerId);
    if (remaining.length > 0) {
      await addressModel.update(remaining[0].id, customerId, { isDefault: true });
    }
  }

  return removed;
};

export const addressService = {
  listMine,
  create,
  update,
  remove,
};
