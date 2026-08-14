import type { NextFunction, RequestHandler, Response } from "express";
import { authModel } from "../models/auth.model.js";
import { AppError } from "../utils/app-error.js";
import { resolvePermissions, type PermissionModule, type RolePermissionMap, } from "../utils/permissions.js";
import type { AuthenticatedRequest } from "./auth.middleware.js";

interface PermissionedRequest extends AuthenticatedRequest {
  permissions?: RolePermissionMap;
}

const loadPermissions = async (request: PermissionedRequest): Promise<RolePermissionMap> => {
  if (request.permissions) {
    return request.permissions;
  }

  const authorization = await authModel.findUserAuthorization(request.user!.id);

  if (!authorization) {
    throw new AppError("Authenticated user no longer exists", 401);
  }

  const permissions = resolvePermissions(authorization.role, authorization.permissions);
  request.permissions = permissions;

  return permissions;
};

export const requirePermission = (module: PermissionModule): RequestHandler => {
  return (request, _response: Response, next: NextFunction) => {
    const authed = request as PermissionedRequest;

    if (!authed.user) {
      next(new AppError("Authentication is required", 401));
      return;
    }

    loadPermissions(authed)
      .then((permissions) => {
        if (!permissions[module]) {
          next(
            new AppError(`You do not have access to ${module}`, 403),
          );
          return;
        }

        next();
      })
      .catch(next);
  };
};
