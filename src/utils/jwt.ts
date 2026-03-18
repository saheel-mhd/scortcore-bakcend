import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

import { env } from "../config/env.js";
import type { Role } from "@prisma/client";

export interface AuthTokenPayload {
  sub: string;
  email: string;
  role: Role;
}

const jwtExpiresIn = env.JWT_EXPIRES_IN as SignOptions["expiresIn"];

export const generateAuthToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(
    {
      email: payload.email,
      role: payload.role,
    },
    env.JWT_SECRET,
    {
      algorithm: "HS256",
      subject: payload.sub,
      expiresIn: jwtExpiresIn,
      issuer: env.JWT_ISSUER,
      audience: env.JWT_AUDIENCE,
    },
  );
};

export const verifyAuthToken = (token: string): string | JwtPayload => {
  return jwt.verify(token, env.JWT_SECRET, {
    algorithms: ["HS256"],
    issuer: env.JWT_ISSUER,
    audience: env.JWT_AUDIENCE,
  });
};
