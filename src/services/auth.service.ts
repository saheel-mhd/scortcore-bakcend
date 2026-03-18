import type { Role, User } from "@prisma/client";
import { authModel, type PublicUser } from "../models/auth.model.js";
import type { LoginUserInput, RegisterUserInput } from "../validations/auth.validation.js";
import { AppError } from "../utils/app-error.js";
import { comparePassword, hashPassword } from "../utils/hash.js";
import { generateAuthToken } from "../utils/jwt.js";

export interface AuthResult {
  user: PublicUser;
  token: string;
}

interface JwtUserPayload {
  sub: string;
  email: string;
  role: Role;
}

const fallbackPasswordHash = "$2b$12$EggAxUWRdIMB5pop4etW/OJroEGUVATFx15b57VlqwrCqsIyOy5F2";

const toPublicUser = (user: User): PublicUser => {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const generateToken = (payload: JwtUserPayload): string => {
  return generateAuthToken(payload);
};

const register = async (input: RegisterUserInput): Promise<AuthResult> => {
  const existingUser = await authModel.findUserByEmail(input.email);

  if (existingUser) {
    throw new AppError("User with this email already exists", 409);
  }

  const hashedPassword = await hashPassword(input.password);

  const createdUser = await authModel.createUser({
    email: input.email,
    password: hashedPassword,
    role: input.role,
  });

  const token = generateToken({
    sub: createdUser.id,
    email: createdUser.email,
    role: createdUser.role,
  });

  return {
    user: createdUser,
    token,
  };
};

const login = async (input: LoginUserInput): Promise<AuthResult> => {
  const existingUser = await authModel.findUserByEmail(input.email);

  if (!existingUser) {
    await comparePassword(input.password, fallbackPasswordHash);
    throw new AppError("Invalid email or password", 401);
  }

  const isPasswordValid = await comparePassword(input.password, existingUser.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", 401);
  }

  const publicUser = toPublicUser(existingUser);
  const token = generateToken({
    sub: publicUser.id,
    email: publicUser.email,
    role: publicUser.role,
  });

  return {
    user: publicUser,
    token,
  };
};

export const authService = {
  register,
  login,
};
