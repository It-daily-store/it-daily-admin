# Granular Role Permissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fixed per-feature CRUD permission object with named permission keys granted per module, catalogued on the backend and served to the admin.

**Architecture:** A role document holds `permissions: [{ module, permissions: Record<string, boolean> }]`. A single `PERMISSION_CATALOG` in the backend defines every valid key with a human label; `checkPermission(module, key)` looks the key up and never needs editing again. The admin fetches that catalog to render its role editor, and gates its own UI through a flattened `Set` of granted keys.

**Tech Stack:** Backend — Express, Mongoose, Zod, TypeScript, ts-node. Admin — Next.js 15 App Router, RTK Query, Redux Toolkit, shadcn/ui, Tailwind v4, Zod.

**Spec:** `docs/superpowers/specs/2026-09-08-granular-permissions-design.md` (in the `id-daily-admin` repo)

## Global Constraints

- **Two repos.** Tasks 1–7 are in `it-daily-backend`. Tasks 8–10 are in `id-daily-admin`. Every path below is relative to the repo named in the task's **Repo:** line.
- **No test framework exists in either repo.** `it-daily-backend`'s `npm test` is a stub that exits 1. Do not add Jest, Vitest, or any test runner — it is out of scope. Each task instead ends with a concrete verification command whose expected output is given.
- **Backend typecheck:** `npx tsc --noEmit`. **Admin typecheck:** `npx tsc --noEmit`.
- **`isMasterAdmin` bypasses all permission checks** and must keep doing so. Never add a check ahead of that bypass in `checkPermission`.
- **An absent key means denied.** Never expand the catalog into explicit `false` values when saving a role — that would turn every new key into a backfill chore.
- **Naming, exact:** the enum is `EAppModules`; the per-entry fields are `module` and `permissions`; the role field holding the array stays `permissions`. So a check reads `role.permissions[i].permissions[key]`.
- **Do not reformat files you are not otherwise changing.** Both repos run lint-staged with prettier on commit; let it do its own work.
- **Commit after every task.** The admin repo's pre-commit hook runs a full `next build`, which takes ~60s — expect it.

---

### Task 1: Permission catalog and module enum

**Repo:** `it-daily-backend`

**Files:**

- Create: `src/app/modules/roles/roles.permissions.ts`
- Modify: `src/app/modules/roles/roles.interface.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: `EAppModules` (enum, 14 values), `TPermissionDef`, `PERMISSION_CATALOG: Record<EAppModules, TPermissionDef[]>`, `TPermissionKey` (union of every key), `ALL_PERMISSION_KEYS: Set<string>`, `TModulePermission`, `TCrud`, `TRole`, `TRoleModel`. Every later backend task imports from these two files.

- [ ] **Step 1: Rewrite `src/app/modules/roles/roles.interface.ts`**

`EAppFeatures` is renamed to `EAppModules` with the same 14 values. `TCrud` is kept **only** because the catalog's `legacy` field references it during the migration; it is deleted in Task 7.

```ts
import { Model } from "mongoose";

// Retained only to type the catalog's `legacy` field, which drives the
// one-time migration in src/scripts/migratePermissions.ts.
export interface TCrud {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
}

export enum EAppModules {
  gallery = "gallery",
  role = "role",
  product = "product",
  productDetails = "productDetails",
  category = "category",
  photo = "photo",
  user = "user",
  brand = "brand",
  bulkUpload = "bulkUpload",
  productFilter = "productFilter",
  deals = "deals",
  settings = "settings",
  orders = "orders",
  banner = "banner",
}

export interface TModulePermission {
  module: EAppModules;
  permissions: Record<string, boolean>;
}

export interface TRole {
  role: string;
  description?: string;
  permissions: TModulePermission[];
  isDeleted?: boolean;
}

export interface TRoleModel extends Model<TRole> {
  isRoleExist(id: string): Promise<TRole>;
}
```

- [ ] **Step 2: Create `src/app/modules/roles/roles.permissions.ts`**

Write the file exactly as below. The `label` strings are what admins read in the roles editor. The `legacy` value is the old CRUD flag this key inherits from during migration — nothing else reads it.

```ts
import { EAppModules, TCrud } from "./roles.interface";

export type TPermissionDef = {
  key: string;
  label: string;
  legacy: keyof TCrud;
};

export const MODULE_LABELS: Record<EAppModules, string> = {
  [EAppModules.product]: "Products",
  [EAppModules.orders]: "Orders",
  [EAppModules.user]: "Users",
  [EAppModules.role]: "Roles",
  [EAppModules.banner]: "Banner Builder",
  [EAppModules.deals]: "Deals",
  [EAppModules.category]: "Categories",
  [EAppModules.brand]: "Brands",
  [EAppModules.gallery]: "Gallery",
  [EAppModules.photo]: "Photos",
  [EAppModules.productFilter]: "Product Filters",
  [EAppModules.productDetails]: "Detail Categories",
  [EAppModules.bulkUpload]: "Bulk Upload",
  [EAppModules.settings]: "Settings",
};

export const PERMISSION_CATALOG: Record<EAppModules, TPermissionDef[]> = {
  [EAppModules.product]: [
    { key: "can_see_product_page", label: "See product page", legacy: "read" },
    {
      key: "can_read_all_products",
      label: "View all products",
      legacy: "read",
    },
    {
      key: "can_read_product_details",
      label: "View product details",
      legacy: "read",
    },
    { key: "can_create_product", label: "Create product", legacy: "create" },
    { key: "can_update_product", label: "Edit product", legacy: "update" },
    {
      key: "can_bulk_upload_products",
      label: "Bulk upload products",
      legacy: "create",
    },
    {
      key: "can_download_product_template",
      label: "Download product template",
      legacy: "read",
    },
  ],
  [EAppModules.orders]: [
    { key: "can_see_order_page", label: "See order page", legacy: "read" },
    { key: "can_read_all_orders", label: "View all orders", legacy: "read" },
    {
      key: "can_read_order_details",
      label: "View order details",
      legacy: "read",
    },
    {
      key: "can_update_order_status",
      label: "Update order status",
      legacy: "update",
    },
  ],
  [EAppModules.user]: [
    { key: "can_see_admin_page", label: "See admins page", legacy: "read" },
    {
      key: "can_see_customer_page",
      label: "See customers page",
      legacy: "read",
    },
    { key: "can_read_all_users", label: "View all users", legacy: "read" },
    {
      key: "can_read_user_details",
      label: "View user details",
      legacy: "read",
    },
    { key: "can_create_admin", label: "Create admin", legacy: "create" },
    { key: "can_delete_user", label: "Delete user", legacy: "delete" },
  ],
  [EAppModules.role]: [
    { key: "can_see_role_page", label: "See roles page", legacy: "read" },
    { key: "can_read_all_roles", label: "View all roles", legacy: "read" },
    { key: "can_create_role", label: "Create role", legacy: "create" },
    { key: "can_update_role", label: "Edit role", legacy: "update" },
    { key: "can_delete_role", label: "Delete role", legacy: "delete" },
  ],
  [EAppModules.banner]: [
    {
      key: "can_see_banner_page",
      label: "See banner builder page",
      legacy: "read",
    },
    {
      key: "can_read_all_banners",
      label: "View all banner templates",
      legacy: "read",
    },
    {
      key: "can_read_banner_details",
      label: "Open a banner template",
      legacy: "read",
    },
    {
      key: "can_create_banner",
      label: "Create banner template",
      legacy: "create",
    },
    {
      key: "can_update_banner",
      label: "Edit banner template",
      legacy: "update",
    },
    {
      key: "can_rename_banner",
      label: "Rename banner template",
      legacy: "update",
    },
    {
      key: "can_publish_banner",
      label: "Publish banner template",
      legacy: "update",
    },
    {
      key: "can_duplicate_banner",
      label: "Duplicate banner template",
      legacy: "create",
    },
    {
      key: "can_delete_banner",
      label: "Delete banner template",
      legacy: "delete",
    },
  ],
  [EAppModules.deals]: [
    { key: "can_see_deal_page", label: "See deals page", legacy: "read" },
    { key: "can_read_all_deals", label: "View all deals", legacy: "read" },
    {
      key: "can_read_deal_details",
      label: "View deal details",
      legacy: "read",
    },
    { key: "can_create_deal", label: "Create deal", legacy: "create" },
    { key: "can_update_deal", label: "Edit deal", legacy: "update" },
    {
      key: "can_manage_deal_products",
      label: "Add or remove deal products",
      legacy: "update",
    },
  ],
  [EAppModules.category]: [
    {
      key: "can_see_category_page",
      label: "See categories page",
      legacy: "read",
    },
    {
      key: "can_read_all_categories",
      label: "View all categories",
      legacy: "read",
    },
    {
      key: "can_read_category_details",
      label: "View category details",
      legacy: "read",
    },
    { key: "can_create_category", label: "Create category", legacy: "create" },
    { key: "can_update_category", label: "Edit category", legacy: "update" },
    { key: "can_delete_category", label: "Delete category", legacy: "delete" },
  ],
  [EAppModules.brand]: [
    { key: "can_see_brand_page", label: "See brands page", legacy: "read" },
    { key: "can_read_all_brands", label: "View all brands", legacy: "read" },
    { key: "can_create_brand", label: "Create brand", legacy: "create" },
    { key: "can_update_brand", label: "Edit brand", legacy: "update" },
    { key: "can_delete_brand", label: "Delete brand", legacy: "delete" },
  ],
  [EAppModules.gallery]: [
    {
      key: "can_read_all_folders",
      label: "View gallery folders",
      legacy: "read",
    },
    {
      key: "can_create_folder",
      label: "Create gallery folder",
      legacy: "create",
    },
    {
      key: "can_update_folder",
      label: "Edit gallery folder",
      legacy: "update",
    },
    {
      key: "can_delete_folder",
      label: "Delete gallery folder",
      legacy: "delete",
    },
  ],
  [EAppModules.photo]: [
    { key: "can_read_all_photos", label: "View photos", legacy: "read" },
    { key: "can_upload_photo", label: "Upload photo", legacy: "create" },
    { key: "can_delete_photo", label: "Delete photo", legacy: "delete" },
  ],
  [EAppModules.productFilter]: [
    { key: "can_see_filter_page", label: "See filters page", legacy: "read" },
    { key: "can_read_all_filters", label: "View all filters", legacy: "read" },
    { key: "can_create_filter", label: "Create filter", legacy: "create" },
    { key: "can_update_filter", label: "Edit filter", legacy: "update" },
    { key: "can_delete_filter", label: "Delete filter", legacy: "delete" },
  ],
  [EAppModules.productDetails]: [
    {
      key: "can_see_details_category_page",
      label: "See detail categories page",
      legacy: "read",
    },
    {
      key: "can_read_all_details_categories",
      label: "View all detail categories",
      legacy: "read",
    },
    {
      key: "can_create_details_category",
      label: "Create detail category",
      legacy: "create",
    },
    {
      key: "can_update_details_category",
      label: "Edit detail category",
      legacy: "update",
    },
    {
      key: "can_delete_details_category",
      label: "Delete detail category",
      legacy: "delete",
    },
  ],
  [EAppModules.bulkUpload]: [
    {
      key: "can_see_bulk_upload_page",
      label: "See bulk upload page",
      legacy: "read",
    },
    {
      key: "can_read_bulk_upload_history",
      label: "View bulk upload history",
      legacy: "read",
    },
  ],
  [EAppModules.settings]: [
    {
      key: "can_see_pc_builder_page",
      label: "See PC builder page",
      legacy: "read",
    },
    { key: "can_read_settings", label: "View settings", legacy: "read" },
    { key: "can_update_settings", label: "Update settings", legacy: "update" },
  ],
};

export const ALL_PERMISSION_KEYS = new Set<string>();

// The admin resolves a key without naming its module, so a key appearing under
// two modules would silently grant both. Fail at boot instead.
for (const defs of Object.values(PERMISSION_CATALOG)) {
  for (const def of defs) {
    if (ALL_PERMISSION_KEYS.has(def.key)) {
      throw new Error(
        `Duplicate permission key in PERMISSION_CATALOG: ${def.key}`,
      );
    }
    ALL_PERMISSION_KEYS.add(def.key);
  }
}

export type TPermissionKey = string;
```

- [ ] **Step 3: Verify the enum rename has broken exactly the files you expect**

Run: `npx tsc --noEmit`

Expected: FAIL, many errors, all of the form `Module '"./roles.interface"' has no exported member 'EAppFeatures'` or `Property 'access' does not exist on type 'TModulePermission'`. These are fixed by Tasks 2–6. Confirm the errors are confined to `src/app/modules/**` and `src/app/middleware/checkPermission.ts` — an error anywhere else means a consumer this plan has not accounted for; stop and report it.

- [ ] **Step 4: Verify the catalog loads and the uniqueness assertion holds**

Run:

```bash
npx ts-node --transpile-only -e "const c=require('./src/app/modules/roles/roles.permissions'); console.log('keys:', c.ALL_PERMISSION_KEYS.size); console.log('modules:', Object.keys(c.PERMISSION_CATALOG).length);"
```

Expected: `keys: 70` and `modules: 14`. If it throws `Duplicate permission key`, you mistyped a key — find and fix the duplicate.

- [ ] **Step 5: Commit**

```bash
git add src/app/modules/roles/roles.interface.ts src/app/modules/roles/roles.permissions.ts
git commit -m "feat(roles): add permission catalog and rename EAppFeatures to EAppModules"
```

---

### Task 2: Role model and validation

**Repo:** `it-daily-backend`

**Files:**

- Modify: `src/app/modules/roles/roles.model.ts`
- Modify: `src/app/modules/roles/roles.validation.ts`

**Interfaces:**

- Consumes: `EAppModules`, `TModulePermission`, `TRole`, `TRoleModel` from `roles.interface`; `ALL_PERMISSION_KEYS` from `roles.permissions`.
- Produces: `Roles` model whose documents store `permissions[].permissions` as a Mongoose `Map<Boolean>`; `RolesValidations.createRoleValidationSchema` and `RolesValidations.updateRoleValidationSchema`.

- [ ] **Step 1: Replace the body of `src/app/modules/roles/roles.model.ts`**

The current `pre("save")` hook rebuilds all 14 features × 4 booleans. The replacement only guarantees one entry per module and preserves whatever keys were supplied — it must not write `false` for unsupplied keys.

```ts
import { model, Schema } from "mongoose";
import {
  EAppModules,
  TModulePermission,
  TRole,
  TRoleModel,
} from "./roles.interface";

const PermissionsSchema = new Schema<TModulePermission>(
  {
    module: {
      type: String,
      enum: Object.values(EAppModules),
      required: [true, "Module name is required"],
    },
    permissions: {
      type: Map,
      of: Boolean,
      default: {},
    },
  },
  { _id: false },
);

const RolesSchema = new Schema<TRole>({
  role: {
    type: String,
    required: [true, "Role is required"],
    unique: true,
  },
  description: {
    type: String,
    default: "",
  },
  permissions: {
    type: [PermissionsSchema],
    default: () =>
      Object.values(EAppModules).map((module) => ({ module, permissions: {} })),
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

// Guarantee one entry per module without materialising unsupplied keys —
// an absent key already means denied.
RolesSchema.pre("save", function (next) {
  const role = this as unknown as TRole;
  const supplied = role.permissions ?? [];

  role.permissions = Object.values(EAppModules).map((module) => {
    const existing = supplied.find((p) => p.module === module);
    return existing ?? { module, permissions: {} };
  });

  next();
});

RolesSchema.statics.isRoleExist = async (id: string) => {
  return Roles.findById(id);
};

export const Roles = model<TRole, TRoleModel>("Roles", RolesSchema);
```

- [ ] **Step 2: Replace the body of `src/app/modules/roles/roles.validation.ts`**

An unknown key must fail loudly at save time rather than becoming a permission nobody can ever grant.

```ts
import { z } from "zod";
import { EAppModules } from "./roles.interface";
import { ALL_PERMISSION_KEYS } from "./roles.permissions";

const TModulePermissionSchema = z.object({
  module: z.nativeEnum(EAppModules),
  permissions: z.record(z.string(), z.boolean()).refine(
    (value) => Object.keys(value).every((key) => ALL_PERMISSION_KEYS.has(key)),
    (value) => ({
      message: `Unknown permission key: ${Object.keys(value)
        .filter((key) => !ALL_PERMISSION_KEYS.has(key))
        .join(", ")}`,
    }),
  ),
});

const createRoleValidationSchema = z.object({
  role: z
    .string({ required_error: "Role name is required" })
    .min(1, "Role name is required"),
  description: z
    .string({ invalid_type_error: "Description should be string" })
    .max(400, "Description can't be more than 400 characters")
    .optional(),
  permissions: z.array(TModulePermissionSchema).optional(),
});

const updateRoleValidationSchema = z.object({
  role: z
    .string({ required_error: "Role name is required" })
    .min(1, "Role name is required")
    .optional(),
  description: z
    .string({ invalid_type_error: "Description should be string" })
    .max(400, "Description can't be more than 400 characters")
    .optional(),
  permissions: z.array(TModulePermissionSchema).optional(),
});

export const RolesValidations = {
  createRoleValidationSchema,
  updateRoleValidationSchema,
};
```

- [ ] **Step 3: Verify the validation schema accepts a good payload and rejects a typo**

Run:

```bash
npx ts-node --transpile-only -e "
const { RolesValidations } = require('./src/app/modules/roles/roles.validation');
const ok = RolesValidations.createRoleValidationSchema.safeParse({
  role: 'Test', permissions: [{ module: 'product', permissions: { can_update_product: true } }],
});
const bad = RolesValidations.createRoleValidationSchema.safeParse({
  role: 'Test', permissions: [{ module: 'product', permissions: { can_update_prodcut: true } }],
});
console.log('valid payload accepted:', ok.success);
console.log('typo rejected:', !bad.success, bad.success ? '' : bad.error.issues[0].message);
"
```

Expected: `valid payload accepted: true` and `typo rejected: true Unknown permission key: can_update_prodcut`.

- [ ] **Step 4: Commit**

```bash
git add src/app/modules/roles/roles.model.ts src/app/modules/roles/roles.validation.ts
git commit -m "feat(roles): store permissions as a keyed map and validate keys against the catalog"
```

---

### Task 3: checkPermission middleware

**Repo:** `it-daily-backend`

**Files:**

- Modify: `src/app/middleware/checkPermission.ts`

**Interfaces:**

- Consumes: `EAppModules`, `TRole` from `roles.interface`; `TPermissionKey` from `roles.permissions`; `Roles` model.
- Produces: `checkPermission(module: EAppModules, key: TPermissionKey)` — the default export, used by every route file in Task 4.

- [ ] **Step 1: Rewrite `src/app/middleware/checkPermission.ts`**

Only the signature's second parameter and the lookup change. The master-admin bypass and the deleted/blocked checks stay exactly where they are and in the same order.

```ts
import httpStatus from "http-status";
import AppError from "../errors/AppError";
import { User } from "../modules/user/user.model";
import catchAsync from "../utils/catchAsync";
import { EAppModules, TRole } from "../modules/roles/roles.interface";
import { TPermissionKey } from "../modules/roles/roles.permissions";
import { Roles } from "../modules/roles/roles.model";

const checkPermission = (module: EAppModules, key: TPermissionKey) => {
  return catchAsync(async (req, res, next) => {
    const user = req.user;

    const userExist = await User.isUserExistsByEmail(user?.email);

    if (!userExist) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user request");
    }

    if (userExist.isMasterAdmin) {
      return next();
    }
    if (userExist.isDeleted) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Your account was deleted",
        "unauthorized access request",
      );
    }

    if (!userExist.isActive) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Your account is blocked",
        "unauthorized access request",
      );
    }

    const role: TRole | null = await Roles.findById(userExist.role);

    if (!role || role.isDeleted) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Unauthorized user request");
    }

    const entry = role.permissions.find((p) => p.module === module);

    // Mongoose hydrates `permissions` as a Map; a lean/plain object needs the
    // bracket read. Support both so this works either way.
    const granted =
      entry?.permissions instanceof Map
        ? entry.permissions.get(key)
        : entry?.permissions?.[key];

    if (granted !== true) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        `You do not have permission: ${key}`,
      );
    }

    next();
  });
};

export default checkPermission;
```

- [ ] **Step 2: Verify**

Run: `npx tsc --noEmit`

Expected: still FAIL, but `src/app/middleware/checkPermission.ts` no longer appears in the output. Remaining errors are in route files (Task 4) and `roles.service.ts` (Task 5).

- [ ] **Step 3: Commit**

```bash
git add src/app/middleware/checkPermission.ts
git commit -m "feat(auth): check named permission keys instead of CRUD flags"
```

---

### Task 4: Migrate all route call sites to named keys

**Repo:** `it-daily-backend`

**Files (all Modify):**

- `src/app/modules/banner/banner.routes.ts`
- `src/app/modules/brand/brand.route.ts`
- `src/app/modules/bulkUpload/bulkUpload.route.ts`
- `src/app/modules/category/category.route.ts`
- `src/app/modules/deals/deal.route.ts`
- `src/app/modules/gallery/gallery.route.ts`
- `src/app/modules/Images/image.route.ts`
- `src/app/modules/order/order.route.ts`
- `src/app/modules/product/product.route.ts`
- `src/app/modules/productDetailsCategory/productDetailsCategory.route.ts`
- `src/app/modules/productFilters/filter.routes.ts`
- `src/app/modules/roles/roles.routes.ts`
- `src/app/modules/settings/settings.route.ts`
- `src/app/modules/user/user.routes.ts`

**Interfaces:**

- Consumes: `checkPermission` (Task 3), `EAppModules` (Task 1).
- Produces: nothing importable. This task must be completed in full — a partially migrated route layer does not compile.

- [ ] **Step 1: Update every import**

In all 14 files, `import { EAppFeatures } from "../roles/roles.interface"` becomes `import { EAppModules } from "../roles/roles.interface"`. In `roles.routes.ts` the path is `"./roles.interface"`.

- [ ] **Step 2: Replace each `checkPermission` call using this table**

Every row is `route path` → `checkPermission(EAppModules.<module>, "<key>")`. Match on the route path, not on line number — line numbers shift as you edit.

**banner.routes.ts** — module `banner`:

| Route                   | Key                       |
| ----------------------- | ------------------------- |
| `GET /get/:id`          | `can_read_banner_details` |
| `GET /get-all`          | `can_read_all_banners`    |
| `POST /create`          | `can_create_banner`       |
| `PATCH /update/:id`     | `can_update_banner`       |
| `PATCH /rename/:id`     | `can_rename_banner`       |
| `PATCH /set-active/:id` | `can_publish_banner`      |
| `POST /duplicate/:id`   | `can_duplicate_banner`    |
| `DELETE /delete/:id`    | `can_delete_banner`       |

**brand.route.ts** — module `brand`:

| Route                | Key                   |
| -------------------- | --------------------- |
| `POST /create`       | `can_create_brand`    |
| `PATCH /update/:id`  | `can_update_brand`    |
| `GET /get-all`       | `can_read_all_brands` |
| `DELETE /delete/:id` | `can_delete_brand`    |

**bulkUpload.route.ts** — module `bulkUpload`:

| Route          | Key                            |
| -------------- | ------------------------------ |
| `GET /get-all` | `can_read_bulk_upload_history` |

**category.route.ts** — module `category`:

| Route             | Key                                      |
| ----------------- | ---------------------------------------- |
| `POST /create`    | `can_create_category`                    |
| `GET /get-all`    | **leave unguarded — do not add a check** |
| `GET /single/:id` | `can_read_category_details`              |
| `DELETE /:id`     | `can_delete_category`                    |
| `PATCH /:id`      | `can_update_category`                    |

`GET /category/get-all` is fetched directly by the storefront's `NavbarMain.tsx` and `MobileCategoryMenu.tsx`. Guarding it breaks the public site.

**deal.route.ts** — module `deals`:

| Route                   | Key                        |
| ----------------------- | -------------------------- |
| `POST /create`          | `can_create_deal`          |
| `PUT /add-products/:id` | `can_manage_deal_products` |
| `GET /get-all`          | `can_read_all_deals`       |
| `GET /get-by-id/:id`    | `can_read_deal_details`    |
| `GET /get-products/:id` | `can_read_deal_details`    |
| `PATCH /:id`            | `can_update_deal`          |

**gallery.route.ts** — module `gallery`:

| Route                      | Key                    |
| -------------------------- | ---------------------- |
| `POST /create-folder`      | `can_create_folder`    |
| `GET /get-folders`         | `can_read_all_folders` |
| `PATCH /update-folder/:id` | `can_update_folder`    |
| `DELETE /delete/:id`       | `can_delete_folder`    |

**image.route.ts** — module `photo`:

| Route                   | Key                   |
| ----------------------- | --------------------- |
| `POST /upload-image`    | `can_upload_photo`    |
| `GET /get-all`          | `can_read_all_photos` |
| `DELETE /delete-images` | `can_delete_photo`    |

**order.route.ts** — module `orders`:

| Route                     | Key                       |
| ------------------------- | ------------------------- |
| `PATCH /admin/update/:id` | `can_update_order_status` |
| `GET /admin/get-all`      | `can_read_all_orders`     |

**product.route.ts** — module `product`:

| Route                       | Key                                                                                 |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `POST /create-product`      | `can_create_product`                                                                |
| `GET /get-all`              | `can_read_all_products` — **this route is currently unguarded; add the middleware** |
| `POST /bulk-upload`         | `can_bulk_upload_products`                                                          |
| `POST /bulk-upload-json`    | `can_bulk_upload_products`                                                          |
| `GET /single/:id`           | `can_read_product_details`                                                          |
| `GET /json-template`        | `can_download_product_template`                                                     |
| `PATCH /update-product/:id` | `can_update_product`                                                                |

The `GET /get-all` line is currently `router.get("/get-all", ProductControllers.getAllProduct);` and becomes:

```ts
router.get(
  "/get-all",
  checkPermission(EAppModules.product, "can_read_all_products"),
  ProductControllers.getAllProduct,
);
```

This is safe because the storefront reads products through the `/customer/*` namespace, not this route. Verified by searching both `id-daily-admin` and `it-daily-homepage`.

**productDetailsCategory.route.ts** — module `productDetails`:

| Route                | Key                                                                 |
| -------------------- | ------------------------------------------------------------------- |
| `POST /create`       | `can_create_details_category`                                       |
| `PATCH /update/:id`  | `can_update_details_category`                                       |
| `GET /single/:id`    | `can_read_all_details_categories` — **currently unguarded; add it** |
| `GET /get-all`       | `can_read_all_details_categories` — **currently unguarded; add it** |
| `DELETE /delete/:id` | `can_delete_details_category`                                       |

**filter.routes.ts** — module `productFilter`:

| Route                | Key                    |
| -------------------- | ---------------------- |
| `POST /create`       | `can_create_filter`    |
| `PATCH /update/:id`  | `can_update_filter`    |
| `GET /get-all`       | `can_read_all_filters` |
| `DELETE /delete/:id` | `can_delete_filter`    |

**roles.routes.ts** — module `role`:

| Route                     | Key                  |
| ------------------------- | -------------------- |
| `POST /create-role`       | `can_create_role`    |
| `GET /get-all`            | `can_read_all_roles` |
| `PATCH /update-role/:id`  | `can_update_role`    |
| `DELETE /delete-role/:id` | `can_delete_role`    |

**settings.route.ts** — module `settings`:

| Route   | Key                   |
| ------- | --------------------- |
| `GET /` | `can_read_settings`   |
| `PUT /` | `can_update_settings` |

**user.routes.ts** — module `user`:

| Route                | Key                     |
| -------------------- | ----------------------- |
| `POST /create-admin` | `can_create_admin`      |
| `GET /admin/get-all` | `can_read_all_users`    |
| `DELETE /:userId`    | `can_delete_user`       |
| `GET /:id`           | `can_read_user_details` |

- [ ] **Step 3: Verify no old-style call survives**

Run:

```bash
grep -rn "EAppFeatures\|checkPermission([^,]*, *[\"']\(read\|create\|update\|delete\)[\"']" src --include=*.ts
```

Expected: no output. Any hit is a call site you missed.

- [ ] **Step 4: Verify the guarded call site count**

Run: `grep -rn "checkPermission(EAppModules" src --include=*.ts | wc -l`

Expected: `58` (the original 55, plus `product/get-all`, `productDetails/get-all`, and `productDetails/single/:id`).

- [ ] **Step 5: Commit**

```bash
git add src/app/modules
git commit -m "feat(auth): pass named permission keys at every guarded route"
```

---

### Task 5: Role service permission merge

**Repo:** `it-daily-backend`

**Files:**

- Modify: `src/app/modules/roles/roles.service.ts`

**Interfaces:**

- Consumes: `EAppModules`, `TModulePermission`, `TRole` from `roles.interface`; `Roles` model.
- Produces: `RolesService.createRoleIntoDB`, `getAllRolesFromDB`, `updateRoleIntoDB`, `deleteRoleFromDB` — signatures unchanged.

- [ ] **Step 1: Replace the permission-merge block inside `updateRoleIntoDB`**

The current implementation builds `defaultPermissions` with explicit CRUD `false`s, then reads `payloadPermission.access.read` and friends field by field. Delete that entire block — from `const defaultPermissions = ...` through the end of the `newPermissions` assignment — and replace it with:

```ts
const newPermissions: TModulePermission[] = Object.values(EAppModules).map(
  (module) => {
    const payloadPermission = payload.permissions?.find(
      (p) => p.module === module,
    );
    if (payloadPermission) {
      return { module, permissions: payloadPermission.permissions ?? {} };
    }

    const existing = thisRole.permissions?.find((p) => p.module === module);
    if (existing) {
      // Mongoose hydrates this as a Map; normalise before writing it back.
      const permissions =
        existing.permissions instanceof Map
          ? Object.fromEntries(existing.permissions)
          : (existing.permissions ?? {});
      return { module, permissions };
    }

    return { module, permissions: {} };
  },
);
```

A module present in the payload is replaced wholesale — the admin always sends the full key set for a module it touched, so a merge would make un-ticking a permission impossible.

- [ ] **Step 2: Fix the remaining import**

`roles.service.ts` currently imports `{ EAppFeatures, TPermission, TRole }`. Change to `{ EAppModules, TModulePermission, TRole }`.

- [ ] **Step 3: Verify the backend now compiles clean**

Run: `npx tsc --noEmit`

Expected: PASS, no output. If anything remains, it is a consumer of `EAppFeatures`/`access` this plan missed — report it rather than patching around it.

- [ ] **Step 4: Commit**

```bash
git add src/app/modules/roles/roles.service.ts
git commit -m "feat(roles): merge keyed permission maps on role update"
```

---

### Task 6: Permission catalog endpoint

**Repo:** `it-daily-backend`

**Files:**

- Modify: `src/app/modules/roles/roles.service.ts`
- Modify: `src/app/modules/roles/roles.controller.ts`
- Modify: `src/app/modules/roles/roles.routes.ts`

**Interfaces:**

- Consumes: `PERMISSION_CATALOG`, `MODULE_LABELS` from `roles.permissions` (Task 1).
- Produces: `GET /roles/permission-catalog` responding with
  `{ success, statusCode, message, data: { module: string; label: string; permissions: { key: string; label: string }[] }[] }`.
  Task 10 consumes this exact shape.

- [ ] **Step 1: Add the service function to `roles.service.ts`**

Note the `legacy` field is deliberately stripped — it is a migration detail and no client needs it.

```ts
const getPermissionCatalog = () => {
  return Object.entries(PERMISSION_CATALOG).map(([module, defs]) => ({
    module,
    label: MODULE_LABELS[module as EAppModules],
    permissions: defs.map(({ key, label }) => ({ key, label })),
  }));
};
```

Add `getPermissionCatalog` to the exported `RolesService` object, and add the import:

```ts
import { MODULE_LABELS, PERMISSION_CATALOG } from "./roles.permissions";
```

- [ ] **Step 2: Add the controller to `roles.controller.ts`**

```ts
const getPermissionCatalog = catchAsync(async (req, res) => {
  const result = RolesService.getPermissionCatalog();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "retrived permission catalog successfully",
    data: result,
  });
});
```

Add `getPermissionCatalog` to the exported `RolesController` object.

- [ ] **Step 3: Register the route in `roles.routes.ts`**

Place it **above** `/get-all` so the literal path is matched before any parameterised sibling is ever added.

```ts
router.get(
  "/permission-catalog",
  checkPermission(EAppModules.role, "can_see_role_page"),
  RolesController.getPermissionCatalog,
);
```

- [ ] **Step 4: Verify the endpoint responds**

Start the server with `npm run dev`, then in a second terminal — substituting a real master-admin token:

```bash
curl -s -H "Authorization: <MASTER_ADMIN_TOKEN>" http://localhost:5000/api/v1/roles/permission-catalog | head -c 400
```

Expected: JSON with `"success":true` and a `data` array whose first element has `module`, `label`, and a `permissions` array of `{key,label}` objects. Confirm the port and route prefix against `src/app/routes/index.ts` if the URL 404s.

- [ ] **Step 5: Commit**

```bash
git add src/app/modules/roles
git commit -m "feat(roles): serve the permission catalog to the admin"
```

---

### Task 7: Migration script

**Repo:** `it-daily-backend`

**Files:**

- Create: `src/scripts/migratePermissions.ts`
- Modify: `package.json` (add the script entry)
- Modify: `src/app/modules/roles/roles.interface.ts` (remove `TCrud` — see Step 5)

**Interfaces:**

- Consumes: `PERMISSION_CATALOG` from `roles.permissions`; `config.database_url`.
- Produces: `npm run migrate:permissions` — a manually-run, idempotent one-shot.

**Do not** copy the connection style of `src/scripts/seed.ts`: it hardcodes a MongoDB URI with credentials. Use `config.database_url`.

- [ ] **Step 1: Create `src/scripts/migratePermissions.ts`**

```ts
import mongoose from "mongoose";
import config from "../app/config";
import { EAppModules } from "../app/modules/roles/roles.interface";
import { PERMISSION_CATALOG } from "../app/modules/roles/roles.permissions";

type TLegacyAccess = Partial<
  Record<"read" | "create" | "update" | "delete", boolean>
>;
type TLegacyEntry = { feature?: string; access?: TLegacyAccess };

const APPLY = process.argv.includes("--apply");

const migrate = async () => {
  if (!config.database_url) {
    throw new Error("DATABASE_URL is not set");
  }

  await mongoose.connect(config.database_url);
  const collection = mongoose.connection.collection("roles");

  const roles = await collection.find({}).toArray();
  console.log(`Found ${roles.length} role document(s).\n`);

  let migrated = 0;
  let skipped = 0;

  for (const role of roles) {
    const entries: TLegacyEntry[] = role.permissions ?? [];

    if (entries.every((e) => !e.feature)) {
      console.log(`SKIP  ${role.role} — already migrated`);
      skipped += 1;
      continue;
    }

    const next = Object.values(EAppModules).map((module) => {
      const legacy = entries.find((e) => e.feature === module);
      const permissions = Object.fromEntries(
        PERMISSION_CATALOG[module].map((def) => [
          def.key,
          legacy?.access?.[def.legacy] === true,
        ]),
      );
      return { module, permissions };
    });

    const grantedCount = next.reduce(
      (sum, e) => sum + Object.values(e.permissions).filter(Boolean).length,
      0,
    );
    const legacyCount = entries.reduce(
      (sum, e) => sum + Object.values(e.access ?? {}).filter(Boolean).length,
      0,
    );
    console.log(
      `MIGRATE ${role.role} — ${legacyCount} legacy flag(s) -> ${grantedCount} granted key(s)`,
    );

    if (APPLY) {
      await collection.updateOne(
        { _id: role._id },
        { $set: { permissions: next } },
      );
      migrated += 1;
    }
  }

  console.log(
    `\n${APPLY ? "Applied" : "DRY RUN — nothing written"}. migrated=${migrated} skipped=${skipped}`,
  );
  console.log(APPLY ? "" : "Re-run with --apply to write.");

  await mongoose.disconnect();
};

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

The script defaults to a dry run. It is idempotent: a document whose entries no longer carry `feature` is skipped.

- [ ] **Step 2: Add the npm script to `package.json`**

```json
"migrate:permissions": "ts-node src/scripts/migratePermissions.ts"
```

- [ ] **Step 3: Back up the collection, then dry-run**

```bash
mongodump --uri="<DATABASE_URL>" --collection=roles --out=./backup-roles-$(date +%F)
npm run migrate:permissions
```

Expected: one `MIGRATE` line per legacy role showing a legacy-flag count and a granted-key count, then `DRY RUN — nothing written`. A role with `read+update` on one module should show a granted count noticeably higher than its legacy count, because one `read` fans out to several keys.

- [ ] **Step 4: Apply, then confirm idempotency**

```bash
npm run migrate:permissions -- --apply
npm run migrate:permissions
```

Expected: the first command prints `Applied. migrated=<n> skipped=0`; the second prints only `SKIP` lines and `skipped=<n>`.

- [ ] **Step 5: Remove `TCrud`**

`TCrud` exists only to type the catalog's `legacy` field. Now that the migration has run, in `roles.permissions.ts` change `legacy: keyof TCrud` to `legacy: "read" | "create" | "update" | "delete"`, drop the `TCrud` import, and delete the `TCrud` interface from `roles.interface.ts`.

Run: `npx tsc --noEmit` — expected PASS.

Keep the `legacy` field itself: it costs nothing and documents where each key came from.

- [ ] **Step 6: Commit**

```bash
git add src/scripts/migratePermissions.ts package.json src/app/modules/roles
git commit -m "feat(roles): add one-time permission migration script"
```

---

### Task 8: Admin types and permission helper

**Repo:** `id-daily-admin`

**Files:**

- Modify: `src/interface/auth.interface.ts`
- Create: `src/lib/permissions.ts`
- Modify: `src/redux/reducers/auth/authSlice.ts`
- Modify: `src/components/utilities/validations/RoleValidation.ts`

**Interfaces:**

- Consumes: nothing from earlier tasks at compile time (the backend is a separate repo).
- Produces: `EAppModules`, `TModulePermission`, `TPermissionKey`, `TRole` from `@/interface/auth.interface`; `useCan()` from `@/lib/permissions`. Tasks 9 and 10 use all of these.

- [ ] **Step 1: Update `src/interface/auth.interface.ts`**

Delete `TCrud`, rename `EAppFeatures` to `EAppModules`, and replace `TPermission`:

```ts
// Must mirror EAppModules in it-daily-backend roles.interface.ts — values are persisted on role documents
export enum EAppModules {
  gallery = "gallery",
  role = "role",
  product = "product",
  productDetails = "productDetails",
  category = "category",
  photo = "photo",
  user = "user",
  brand = "brand",
  bulkUpload = "bulkUpload",
  productFilter = "productFilter",
  deals = "deals",
  settings = "settings",
  orders = "orders",
  banner = "banner",
}

export type TPermissionKey =
  | "can_see_product_page"
  | "can_read_all_products"
  | "can_read_product_details"
  | "can_create_product"
  | "can_update_product"
  | "can_bulk_upload_products"
  | "can_download_product_template"
  | "can_see_order_page"
  | "can_read_all_orders"
  | "can_read_order_details"
  | "can_update_order_status"
  | "can_see_admin_page"
  | "can_see_customer_page"
  | "can_read_all_users"
  | "can_read_user_details"
  | "can_create_admin"
  | "can_delete_user"
  | "can_see_role_page"
  | "can_read_all_roles"
  | "can_create_role"
  | "can_update_role"
  | "can_delete_role"
  | "can_see_banner_page"
  | "can_read_all_banners"
  | "can_read_banner_details"
  | "can_create_banner"
  | "can_update_banner"
  | "can_rename_banner"
  | "can_publish_banner"
  | "can_duplicate_banner"
  | "can_delete_banner"
  | "can_see_deal_page"
  | "can_read_all_deals"
  | "can_read_deal_details"
  | "can_create_deal"
  | "can_update_deal"
  | "can_manage_deal_products"
  | "can_see_category_page"
  | "can_read_all_categories"
  | "can_read_category_details"
  | "can_create_category"
  | "can_update_category"
  | "can_delete_category"
  | "can_see_brand_page"
  | "can_read_all_brands"
  | "can_create_brand"
  | "can_update_brand"
  | "can_delete_brand"
  | "can_read_all_folders"
  | "can_create_folder"
  | "can_update_folder"
  | "can_delete_folder"
  | "can_read_all_photos"
  | "can_upload_photo"
  | "can_delete_photo"
  | "can_see_filter_page"
  | "can_read_all_filters"
  | "can_create_filter"
  | "can_update_filter"
  | "can_delete_filter"
  | "can_see_details_category_page"
  | "can_read_all_details_categories"
  | "can_create_details_category"
  | "can_update_details_category"
  | "can_delete_details_category"
  | "can_see_bulk_upload_page"
  | "can_read_bulk_upload_history"
  | "can_see_pc_builder_page"
  | "can_read_settings"
  | "can_update_settings";

export type TModulePermission = {
  module: EAppModules;
  permissions: Record<string, boolean>;
};
```

Then change `TRole.permissions` to `TModulePermission[]`.

This union is **type-only** — it gives `can("...")` call sites autocomplete and a build error on a typo. The roles editor renders from the fetched catalog, not from this union, so a key the backend adds still appears in the UI without touching this file.

- [ ] **Step 2: Create `src/lib/permissions.ts`**

```ts
import { useAppSelector } from "@/redux/hooks";
import { TPermissionKey } from "@/interface/auth.interface";
import { useCallback, useMemo } from "react";

// Keys are globally unique across modules, so call sites never name the module.
export const useCan = () => {
  const { permissions } = useAppSelector((s) => s.auth);

  const granted = useMemo(
    () =>
      new Set(
        permissions?.flatMap((m) =>
          Object.entries(m.permissions ?? {})
            .filter(([, value]) => value)
            .map(([key]) => key),
        ) ?? [],
      ),
    [permissions],
  );

  return useCallback((key: TPermissionKey) => granted.has(key), [granted]);
};
```

- [ ] **Step 3: Update `src/redux/reducers/auth/authSlice.ts`**

Change the import from `TPermission` to `TModulePermission`, and both `TSetUserData.permissions` and `TInitialState.permissions` to `TModulePermission[]`. Nothing else in the slice changes.

- [ ] **Step 4: Update `src/components/utilities/validations/RoleValidation.ts`**

```ts
import { EAppModules } from "@/interface/auth.interface";
import { z } from "zod";

export const TModulePermissionSchema = z.object({
  module: z.nativeEnum(EAppModules),
  permissions: z.record(z.string(), z.boolean()),
});
```

Delete `TCrudSchema` and `TPermissionSchema`, and change `permissions: z.array(TPermissionSchema).optional()` to `permissions: z.array(TModulePermissionSchema).optional()` in both `createRoleValidationSchema` and `updateRoleValidationSchema`.

- [ ] **Step 5: Verify the expected files break**

Run: `npx tsc --noEmit`

Expected: FAIL. Errors confined to `src/components/shared/AppSidebar.tsx`, `src/components/shared/sidebarMenus.ts`, `src/app/(mainLayout)/roles/page.tsx`, both `storefront/banner-builder` pages, and the three `src/components/roles/*Modal.tsx` files. Those are Tasks 9 and 10. An error anywhere else is an unaccounted consumer — report it.

- [ ] **Step 6: Do not commit yet**

This repo's pre-commit hook runs a full build, which will fail while Tasks 9 and 10 are outstanding. Commit Tasks 8–10 together at the end of Task 10 instead. Move on to Task 9 without committing.

---

### Task 9: Sidebar and page-level gating

**Repo:** `id-daily-admin`

**Files:**

- Modify: `src/components/shared/sidebarMenus.ts`
- Modify: `src/components/shared/AppSidebar.tsx:43-55`
- Modify: `src/app/(mainLayout)/roles/page.tsx:35,100,108`
- Modify: `src/app/(mainLayout)/storefront/banner-builder/page.tsx:32-33,122,162,174,183,205`
- Modify: `src/app/(mainLayout)/storefront/banner-builder/[templateId]/page.tsx:29-30,106`
- Create: `src/components/global/PermissionGuard.tsx`
- Modify: `src/app/(mainLayout)/products/[productId]/edit/page.tsx`
- Modify: `src/app/(mainLayout)/orders/[orderNumber]/page.tsx`
- Modify: `src/app/(mainLayout)/deals/[dealId]/page.tsx`
- Modify: `src/app/(mainLayout)/users/admins/[userId]/page.tsx`

**Interfaces:**

- Consumes: `useCan` from `@/lib/permissions`, `TPermissionKey` from `@/interface/auth.interface` (Task 8).
- Produces: `TSidebarItem` with a `permission?: TPermissionKey` field replacing `feature?: EAppFeatures`; `<PermissionGuard permission children message />`.

- [ ] **Step 1: Update `TSidebarItem` in `src/components/shared/sidebarMenus.ts`**

Replace the `feature?: EAppFeatures` field with `permission?: TPermissionKey`, and change the import from `EAppFeatures` to `TPermissionKey`.

- [ ] **Step 2: Set each item's key**

Replace every `feature: EAppFeatures.x` line with a `permission:` line per this table. Dashboard has no `feature` today and gains no `permission` — it stays visible to everyone.

| Sidebar entry               | Line                                          |
| --------------------------- | --------------------------------------------- |
| Products (parent)           | `permission: "can_see_product_page"`          |
| Products › All Products     | `permission: "can_see_product_page"`          |
| Products › Create Product   | `permission: "can_create_product"`            |
| Products › Bulk Upload      | `permission: "can_see_bulk_upload_page"`      |
| Products › Filters          | `permission: "can_see_filter_page"`           |
| Categories                  | `permission: "can_see_category_page"`         |
| Detail Categories           | `permission: "can_see_details_category_page"` |
| Brands                      | `permission: "can_see_brand_page"`            |
| Orders                      | `permission: "can_see_order_page"`            |
| Deals                       | `permission: "can_see_deal_page"`             |
| Users (parent)              | `permission: "can_see_admin_page"`            |
| Users › Admins              | `permission: "can_see_admin_page"`            |
| Users › Customers           | `permission: "can_see_customer_page"`         |
| Roles                       | `permission: "can_see_role_page"`             |
| Storefront › Banner Builder | `permission: "can_see_banner_page"`           |
| Storefront › PC Builder     | `permission: "can_see_pc_builder_page"`       |

- [ ] **Step 3: Update the gating functions in `src/components/shared/AppSidebar.tsx`**

`canRead` and `visibleItems` currently take a `TPermission[]`. Change them to take the `can` predicate:

```ts
type TCan = (key: TPermissionKey) => boolean;

const canRead = (item: TSidebarItem, can: TCan) =>
  !item.permission || can(item.permission);

function visibleItems(items: TSidebarItem[], can: TCan) {
  return items.reduce<TSidebarItem[]>((acc, item) => {
    if (item.children?.length) {
      const children = item.children.filter((c) => canRead(c, can));
      if (children.length) acc.push({ ...item, children });
      return acc;
    }
    if (canRead(item, can)) acc.push(item);
    return acc;
  }, []);
}
```

In the `AppSidebar` component, replace `const { permissions } = useAppSelector((s) => s.auth);` with `const can = useCan();`, change the `visibleItems(group.items, permissions)` call to `visibleItems(group.items, can)`, and change the `useMemo` dependency from `[permissions]` to `[can]`. Remove the now-unused `TPermission` and `useAppSelector` imports; add `useCan` and `TPermissionKey`.

- [ ] **Step 4: Update `src/app/(mainLayout)/roles/page.tsx`**

Delete the `rolePermission` lookup (line 35) and add `const can = useCan();`. Then:

- line 100: `rolePermission?.access.update &&` becomes `can("can_update_role") &&`
- line 108: `rolePermission?.access.delete &&` becomes `can("can_delete_role") &&`

Remove `TPermission` from the imports; keep the `user` value from `useAppSelector` if it is still used elsewhere in the file.

- [ ] **Step 5: Update both banner-builder pages**

In `storefront/banner-builder/page.tsx`, delete the `permissions` selector and `bannerPermission` lookup (lines 32–33), add `const can = useCan();`, then:

- line 122: `bannerPermission?.access.update ?` becomes `can("can_publish_banner") ?` — this cell renders the active/publish toggle
- line 162: `bannerPermission?.access.update &&` becomes `can("can_update_banner") &&`
- line 174: `bannerPermission?.access.create &&` becomes `can("can_duplicate_banner") &&` — this is the duplicate action
- line 183: `bannerPermission?.access.delete &&` becomes `can("can_delete_banner") &&`
- line 205: `bannerPermission?.access.create ?` becomes `can("can_create_banner") ?`

Confirm each mapping against the surrounding JSX before editing — the line numbers are from the current file and shift as you edit.

In `storefront/banner-builder/[templateId]/page.tsx`, do the same for lines 29–30, and change line 106's `bannerPermission?.access.update ?` to `can("can_update_banner") ?`.

- [ ] **Step 6: Create `src/components/global/PermissionGuard.tsx`**

The spec gates four detail pages that have no gating today. They are reachable by direct URL even when the sidebar hides their parent, so each needs its own check. A shared component keeps the four call sites to one line each.

```tsx
"use client";

import React from "react";
import { TPermissionKey } from "@/interface/auth.interface";
import { useCan } from "@/lib/permissions";

type TProps = {
  permission: TPermissionKey;
  children: React.ReactNode;
  message?: string;
};

const PermissionGuard = ({ permission, children, message }: TProps) => {
  const can = useCan();

  if (!can(permission)) {
    return (
      <div className="rounded-md border border-border-color bg-background p-6 text-gray">
        <p>{message ?? "You don't have permission to view this page."}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
```

- [ ] **Step 7: Gate the four detail pages**

In each file, wrap the component's returned JSX in the guard — `return <PermissionGuard permission="...">{...existing JSX...}</PermissionGuard>`. Keep every hook call above the return; wrapping the JSX rather than early-returning avoids changing hook order.

| Page                                                      | Permission               |
| --------------------------------------------------------- | ------------------------ |
| `src/app/(mainLayout)/products/[productId]/edit/page.tsx` | `can_update_product`     |
| `src/app/(mainLayout)/orders/[orderNumber]/page.tsx`      | `can_read_order_details` |
| `src/app/(mainLayout)/deals/[dealId]/page.tsx`            | `can_read_deal_details`  |
| `src/app/(mainLayout)/users/admins/[userId]/page.tsx`     | `can_read_user_details`  |

`storefront/banner-builder/[templateId]` is not in this table — Step 5 already gave it inline gating that also renders the template's read-only metadata, which is better than a blanket block.

- [ ] **Step 8: Verify**

Run: `npx tsc --noEmit`

Expected: FAIL, with errors now confined to the three `src/components/roles/*Modal.tsx` files. That is Task 10.

- [ ] **Step 9: Do not commit yet** — the pre-commit hook builds, and the roles modals are still broken. Continue to Task 10.

---

### Task 10: Roles editor UI

**Repo:** `id-daily-admin`

**Files:**

- Modify: `src/redux/api/tagTypes.ts`
- Modify: `src/redux/api/rolesApi.ts`
- Create: `src/components/roles/PermissionMatrix.tsx`
- Modify: `src/components/roles/CreateRoleModal.tsx`
- Modify: `src/components/roles/EditRoleModal.tsx`
- Modify: `src/components/roles/ViewRoleModal.tsx`

**Interfaces:**

- Consumes: `GET /roles/permission-catalog` (Task 6); `EAppModules`, `TModulePermission`, `TRole` (Task 8).
- Produces: `TPermissionCatalog`, `useGetPermissionCatalogQuery`, and
  `<PermissionMatrix catalog value onChange readOnly />` where
  `value: TModulePermission[]` and `onChange: (next: TModulePermission[]) => void`.

- [ ] **Step 1: Add the cache tag**

In `src/redux/api/tagTypes.ts`, add `permissionCatalog = "permissionCatalog",` to the `tagTypes` enum and `tagTypes.permissionCatalog,` to `tagTypesList`. Both must be updated — a tag missing from the list throws at runtime.

- [ ] **Step 2: Add the query to `src/redux/api/rolesApi.ts`**

```ts
export type TPermissionCatalog = {
  module: EAppModules;
  label: string;
  permissions: { key: string; label: string }[];
}[];
```

Inside `injectEndpoints`, alongside `getRoles`:

```ts
    getPermissionCatalog: build.query({
      query: () => {
        return {
          url: "/roles/permission-catalog",
          method: "GET",
        };
      },
      providesTags: [tagTypes.permissionCatalog],
    }),
```

Add `useGetPermissionCatalogQuery` to the exported hooks and import `EAppModules`.

- [ ] **Step 3: Create `src/components/roles/PermissionMatrix.tsx`**

```tsx
"use client";

import React, { useMemo, useState } from "react";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { EAppModules, TModulePermission } from "@/interface/auth.interface";
import { TPermissionCatalog } from "@/redux/api/rolesApi";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type TProps = {
  catalog: TPermissionCatalog;
  value: TModulePermission[];
  onChange?: (next: TModulePermission[]) => void;
  readOnly?: boolean;
};

const PermissionMatrix = ({ catalog, value, onChange, readOnly }: TProps) => {
  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const grantedFor = (module: EAppModules) =>
    value.find((v) => v.module === module)?.permissions ?? {};

  const setModule = (
    module: EAppModules,
    permissions: Record<string, boolean>,
  ) => {
    if (!onChange) return;
    const rest = value.filter((v) => v.module !== module);
    onChange([...rest, { module, permissions }]);
  };

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return catalog;
    return catalog
      .map((group) => ({
        ...group,
        permissions: group.permissions.filter(
          (p) =>
            p.label.toLowerCase().includes(term) ||
            p.key.toLowerCase().includes(term),
        ),
      }))
      .filter((group) => group.permissions.length > 0);
  }, [catalog, search]);

  return (
    <div className="flex flex-col gap-3">
      {!readOnly && (
        <Input
          placeholder="Search permissions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      <div className="flex max-h-[45vh] flex-col gap-2 overflow-y-auto pr-1">
        {filtered.map((group) => {
          const granted = grantedFor(group.module);
          const grantedCount = group.permissions.filter(
            (p) => granted[p.key],
          ).length;
          const allGranted = grantedCount === group.permissions.length;
          const isCollapsed = collapsed[group.module];

          return (
            <div key={group.module} className="rounded-md bg-background p-3">
              <div className="mb-2 flex items-center justify-between border-b border-border-color pb-2">
                <button
                  type="button"
                  onClick={() =>
                    setCollapsed((prev) => ({
                      ...prev,
                      [group.module]: !prev[group.module],
                    }))
                  }
                  className="flex items-center gap-1 font-semibold"
                >
                  {isCollapsed ? (
                    <ChevronRight size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                  {group.label}
                </button>

                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "text-sm",
                      grantedCount ? "text-primary" : "text-gray",
                    )}
                  >
                    {grantedCount}/{group.permissions.length}
                  </span>
                  {!readOnly && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setModule(
                          group.module,
                          Object.fromEntries(
                            group.permissions.map((p) => [p.key, !allGranted]),
                          ),
                        )
                      }
                    >
                      {allGranted ? "Revoke all" : "Grant all"}
                    </Button>
                  )}
                </div>
              </div>

              {!isCollapsed && (
                <div className="flex flex-col gap-1">
                  {group.permissions.map((p) => (
                    <div
                      key={p.key}
                      className="flex items-center justify-between"
                    >
                      <span className="text-gray">{p.label}</span>
                      <Switch
                        checked={granted[p.key] === true}
                        disabled={readOnly}
                        onCheckedChange={() =>
                          setModule(group.module, {
                            ...granted,
                            [p.key]: !granted[p.key],
                          })
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionMatrix;
```

- [ ] **Step 4: Rewire `CreateRoleModal.tsx`**

Delete `resetPermissions`, `handleAccessChange`, the `useEffect` that seeds permissions, and the whole `<div>` block that renders the feature grid (the one under `<h3>Permissions:</h3>`). Replace with:

```tsx
const { data: catalogRes } = useGetPermissionCatalogQuery(undefined);
const catalog: TPermissionCatalog = catalogRes?.data ?? [];
const [permissions, setPermissions] = useState<TModulePermission[]>([]);
```

and, in the JSX where the grid was:

```tsx
<div>
  <h3 className="text-base font-semibold text-black">Permissions:</h3>
  <div className="pt-2">
    <PermissionMatrix
      catalog={catalog}
      value={permissions}
      onChange={setPermissions}
    />
  </div>
</div>
```

In the success branch of `handleCreateRole`, replace the `resetPermissions()` call with `setPermissions([])`. Drop the `EAppFeatures`, `TCrud`, `TPermission` and `Switch` imports; add `TModulePermission`, `PermissionMatrix`, `useGetPermissionCatalogQuery`, `TPermissionCatalog`.

- [ ] **Step 5: Rewire `EditRoleModal.tsx`**

Apply the same replacement. The `useEffect` that runs `setPermissions(editData.permissions)` stays — it is still correct, since `editData.permissions` is now `TModulePermission[]`. Type the state as `useState<TModulePermission[]>([])`.

- [ ] **Step 6: Rewire `ViewRoleModal.tsx`**

Replace the permissions grid with the read-only matrix, and delete the stray `console.log(acc)` on the way out:

```tsx
const { data: catalogRes } = useGetPermissionCatalogQuery(undefined);
const catalog: TPermissionCatalog = catalogRes?.data ?? [];
```

```tsx
<div>
  <h3 className="text-base font-semibold text-black">Permissions:</h3>
  <div className="pt-2">
    <PermissionMatrix
      catalog={catalog}
      value={viewData?.permissions ?? []}
      readOnly
    />
  </div>
</div>
```

- [ ] **Step 7: Verify the admin compiles and builds**

Run: `npx tsc --noEmit` — expected PASS, no output.

Run: `npm run build` — expected `✓ Compiled successfully`. Pre-existing `react-hooks/exhaustive-deps` warnings are fine; a warning naming a file you touched is not — fix it.

- [ ] **Step 8: Verify against the running app**

Start the backend (`npm run dev` in `it-daily-backend`) and the admin (`npm run dev`, port 7000). As a master admin:

1. Open `/roles` and click Create Role. Confirm 14 collapsible module sections appear with human labels, that the search box filters, and that Grant all flips a whole module's count to `n/n`.
2. Create a role granting only `can_see_product_page` and `can_read_all_products`. Save, reopen it in Edit, and confirm exactly those two are on — this is the round-trip that catches a broken save.
3. Assign that role to a non-master admin, log in as them, and confirm the sidebar shows only Dashboard and Products › All Products, and that `/roles` returns a permission error rather than data.
4. Confirm the storefront homepage still loads — it must, since `category/get-all` was left unguarded.

- [ ] **Step 9: Commit Tasks 8–10 together**

```bash
git add src/interface src/lib/permissions.ts src/redux src/components src/app
git commit -m "feat(roles): granular permission keys across admin UI, sidebar and roles editor"
```

---

## Post-implementation

Deploy as one window, in this order — there is no intermediate state where an old admin talks safely to a new backend:

1. Deploy `it-daily-backend`.
2. Run `npm run migrate:permissions` (dry run), then `-- --apply`.
3. Deploy `id-daily-admin`.

Known follow-ups, deliberately out of scope:

- `can_read_all_categories` is UI-only until `NavbarMain.tsx` and `MobileCategoryMenu.tsx` in `it-daily-homepage` move to the existing `/customer/category/get-all`. Only then can `category/get-all` be guarded.
- `can_see_admin_page` and `can_see_customer_page` separate the two pages in the UI, but both lists come from `user/admin/get-all` guarded by the single `can_read_all_users`. Splitting server-side needs the middleware to branch on `req.query.userType`.
- `src/scripts/seed.ts` hardcodes a MongoDB URI with credentials. It should move to `config.database_url` and the exposed credentials should be rotated.
