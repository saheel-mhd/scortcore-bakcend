import { compare, hash } from "bcryptjs";

import { env } from "../config/env.js";

export const hashPassword = async (value: string): Promise<string> => {
  return hash(value, env.BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (plainText: string, hashedValue: string): Promise<boolean> => {
  return compare(plainText, hashedValue);
};
