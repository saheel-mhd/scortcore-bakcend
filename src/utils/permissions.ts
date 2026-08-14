import { Role } from "@prisma/client";

export const PERMISSION_MODULES = [
  "dashboard",
  "products",
  "orders",
  "units",
  "coupons",
  "layout",
  "settings",
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export type RolePermissionMap = Record<PermissionModule, boolean>;

const buildMap = (value: boolean): RolePermissionMap => {
  return PERMISSION_MODULES.reduce((map, module) => {
    map[module] = value;
    return map;
  }, {} as RolePermissionMap);
};

export const defaultPermissionsByRole: Record<Role, RolePermissionMap> = {
  [Role.admin]: buildMap(true),
  [Role.staff]: {
    dashboard: true,
    products: true,
    orders: true,
    units: true,
    coupons: true,
    layout: true,
    settings: false,
  },
  [Role.customer]: buildMap(false),
};

const isPermissionModule = (value: string): value is PermissionModule => {
  return (PERMISSION_MODULES as readonly string[]).includes(value);
};

export const resolvePermissions = (
  role: Role,
  rawPermissions: unknown,
): RolePermissionMap => {
  if (role === Role.admin) {
    return defaultPermissionsByRole[Role.admin];
  }

  const resolved = { ...defaultPermissionsByRole[role] };

  if (rawPermissions && typeof rawPermissions === "object" && !Array.isArray(rawPermissions)) {
    for (const [key, value] of Object.entries(rawPermissions)) {
      if (isPermissionModule(key) && typeof value === "boolean") {
        resolved[key] = value;
      }
    }
  }

  return resolved;
};
