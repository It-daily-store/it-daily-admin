import { EAppFeatures } from "@/interface/auth.interface";
import { z } from "zod";

export const TCrudSchema = z.object({
  read: z.boolean().default(false),
  create: z.boolean().default(false),
  update: z.boolean().default(false),
  delete: z.boolean().default(false),
});

export const TPermissionSchema = z.object({
  feature: z.nativeEnum(EAppFeatures),
  access: TCrudSchema,
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
  permissions: z.array(TPermissionSchema).optional(),
});

export const createRoleValidationSchema = z.object({
  role: z
    .string({ error: "Role name is required" })
    .min(1, "Role name is required"),
  description: z
    .string({ error: "Descriptio should be string" })
    .max(400, "Description can't be more than 400 characters")
    .optional(),
  permissions: z.array(TPermissionSchema).optional(),
});
