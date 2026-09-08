import { EAppModules } from "@/interface/auth.interface";
import { z } from "zod";

export const TModulePermissionSchema = z.object({
  module: z.nativeEnum(EAppModules),
  permissions: z.record(z.string(), z.boolean()),
});

export const updateRoleValidationSchema = z.object({
  role: z
    .string({ error: "Role name title is required" })
    .min(1, "Role name is required")
    .optional(),
  description: z
    .string({ error: "Descriptio should be string" })
    .max(400, "Description can't be more than 400 characters")
    .optional(),
  permissions: z.array(TModulePermissionSchema).optional(),
});

export const createRoleValidationSchema = z.object({
  role: z
    .string({ error: "Role name is required" })
    .min(1, "Role name is required"),
  description: z
    .string({ error: "Descriptio should be string" })
    .max(400, "Description can't be more than 400 characters")
    .optional(),
  permissions: z.array(TModulePermissionSchema).optional(),
});
