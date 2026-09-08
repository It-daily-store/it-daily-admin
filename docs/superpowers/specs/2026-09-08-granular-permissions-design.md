# Granular Role Permissions — Design

**Date:** 2026-09-08
**Status:** Approved, ready for implementation planning
**Repos touched:** `it-daily-backend`, `id-daily-admin`

## Problem

Permissions are stored per feature as a fixed CRUD object:

```ts
{ feature: EAppFeatures, access: { read, create, update, delete } }
```

One feature covers many distinct operations, so a single `read` bit has to stand for "list all products", "open one product", and "see the product page at all". Granting any of them grants all of them. There is no way to express "this role may edit products but may not create them", and no way to add a new kind of permission without changing the shape every role document carries.

## Goals

- A permission is a named string, granted per module.
- Adding a permission requires no change to the middleware or to any handler — only a catalog entry plus the string passed at the route.
- The admin renders its role editor from a catalog served by the backend, so the two can never drift.
- Existing roles keep their current effective access across the migration.

## Non-goals

- Per-record or per-field permissions.
- Changing how `isMasterAdmin` works — it continues to bypass all checks.
- Reworking authentication, sessions, or the login flow.

## Data model

`EAppFeatures` is renamed to `EAppModules` (same 14 values). The per-entry fields are renamed: `feature` → `module`, `access` → `permissions`.

```ts
export type TModulePermission = {
  module: EAppModules;
  permissions: Record<string, boolean>; // permission key -> granted
};

export interface TRole {
  role: string;
  description?: string;
  permissions: TModulePermission[];
  isDeleted?: boolean;
}
```

Mongoose stores `permissions` as `{ type: Map, of: Boolean, default: {} }`, which serialises to a plain object over JSON.

**An absent key means denied.** This is what makes new permissions cheap: a key added to the catalog needs no backfill onto existing role documents, and it is denied by default until someone grants it.

The outer array keeps the name `permissions`, so a check reads `role.permissions[i].permissions[key]`. This nesting was raised during design and accepted.

## Backend

### Catalog

`src/app/modules/roles/roles.permissions.ts` is the single source of truth:

```ts
type TPermissionDef = {
  key: string;
  label: string;
  legacy: keyof TCrud;   // migration only; removed once the migration has run
};

export const PERMISSION_CATALOG: Record<EAppModules, TPermissionDef[]> = { ... };
```

`legacy` exists solely to drive the one-time migration. Keeping it inside the catalog means the migration mapping cannot drift from the catalog it maps onto. It is deleted from the type after the migration has run in production.

The module asserts at import time that every key is globally unique across all modules. The admin's lookup helper depends on this invariant, so a duplicate key must fail at boot rather than silently granting two things at once.

### Middleware

`checkPermission(module, key)` keeps its shape. Only the check changes:

```ts
const entry = role.permissions.find((p) => p.module === module);
if (entry?.permissions?.get(key) !== true) {
  throw new AppError(
    httpStatus.UNAUTHORIZED,
    `You do not have permission: ${key}`,
  );
}
```

The master-admin bypass and the deleted/blocked account checks are unchanged. No handler is ever edited again to add a permission.

### Catalog endpoint

`GET /roles/permission-catalog` returns `{ module, label, permissions: [{ key, label }] }[]`, guarded by `can_see_role_page`. The payload is static per deploy.

### Model and validation

- `roles.model.ts`: the `pre("save")` hook currently rebuilds all 14 features × 4 booleans. It is reduced to "ensure one entry per module, preserve supplied keys, default to `{}`". It must **not** expand the catalog into explicit `false` values, or every new key becomes a backfill chore.
- `roles.validation.ts`: `access: TCrudSchema` becomes `permissions: z.record(z.string(), z.boolean())`, with keys validated against the catalog so a typo fails loudly when the role is saved rather than silently denying access forever.

## Catalog contents

ᵁ marks a key enforced only in the admin interface, with no server route behind it.

| Module           | Keys                                                                                                                                                                                                        |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `product`        | `can_see_product_page`ᵁ, `can_read_all_products`, `can_read_product_details`, `can_create_product`, `can_update_product`, `can_bulk_upload_products`, `can_download_product_template`                       |
| `orders`         | `can_see_order_page`ᵁ, `can_read_all_orders`, `can_read_order_details`ᵁ, `can_update_order_status`                                                                                                          |
| `user`           | `can_see_admin_page`ᵁ, `can_see_customer_page`ᵁ, `can_read_all_users`, `can_read_user_details`, `can_create_admin`, `can_delete_user`                                                                       |
| `role`           | `can_see_role_page`ᵁ, `can_read_all_roles`, `can_create_role`, `can_update_role`, `can_delete_role`                                                                                                         |
| `banner`         | `can_see_banner_page`ᵁ, `can_read_all_banners`, `can_read_banner_details`, `can_create_banner`, `can_update_banner`, `can_rename_banner`, `can_publish_banner`, `can_duplicate_banner`, `can_delete_banner` |
| `deals`          | `can_see_deal_page`ᵁ, `can_read_all_deals`, `can_read_deal_details`, `can_create_deal`, `can_update_deal`, `can_manage_deal_products`                                                                       |
| `category`       | `can_see_category_page`ᵁ, `can_read_all_categories`ᵁ, `can_read_category_details`, `can_create_category`, `can_update_category`, `can_delete_category`                                                      |
| `brand`          | `can_see_brand_page`ᵁ, `can_read_all_brands`, `can_create_brand`, `can_update_brand`, `can_delete_brand`                                                                                                    |
| `gallery`        | `can_read_all_folders`, `can_create_folder`, `can_update_folder`, `can_delete_folder`                                                                                                                       |
| `photo`          | `can_read_all_photos`, `can_upload_photo`, `can_delete_photo`                                                                                                                                               |
| `productFilter`  | `can_see_filter_page`ᵁ, `can_read_all_filters`, `can_create_filter`, `can_update_filter`, `can_delete_filter`                                                                                               |
| `productDetails` | `can_see_details_category_page`ᵁ, `can_read_all_details_categories`, `can_create_details_category`, `can_update_details_category`, `can_delete_details_category`                                            |
| `bulkUpload`     | `can_see_bulk_upload_page`ᵁ, `can_read_bulk_upload_history`                                                                                                                                                 |
| `settings`       | `can_see_pc_builder_page`ᵁ, `can_read_settings`, `can_update_settings`                                                                                                                                      |

Seventy keys total.

Notes on specific entries:

- **`product` has no delete key** — the backend exposes no product delete route.
- **`gallery` and `photo` get no page key** — neither has a page of its own; they are reached through the image picker inside other forms.
- **`settings` has no page key** — the admin has no settings page; the only thing the sidebar exposes under this module is PC Builder.
- **`user` gets two page keys but one list key.** Admins and Customers are separate pages, but both call the same endpoint — `useGetAllAdminsQuery("customer")` hits `user/admin/get-all` with a `userType` param. So `can_read_all_users` guards that one route and the two `can_see_*_page` keys do the separating in the UI. Enforcing the split server-side would mean branching on `req.query.userType` inside the middleware; that is out of scope here.

### Newly enforceable routes

`product/get-all` and `product-details-category/get-all` are currently unguarded. Both are called by the admin only — the storefront reads products through the `/customer/*` namespace — so both gain real `checkPermission` guards under this change.

`category/get-all` must stay public: the storefront navbar (`NavbarMain.tsx`, `MobileCategoryMenu.tsx`) fetches it directly. So `can_read_all_categories` is UI-only. Pointing those two call sites at the existing `/customer/category/get-all` would let it be guarded too; that is a deliberate follow-up, not part of this change.

## Admin

### Types

`EAppFeatures` → `EAppModules`; `TPermission` → `TModulePermission`; `TCrud` is deleted.

The admin also declares `TPermissionKey` — a string-literal union of every key. This is **type-only**; labels and grouping still come from the fetched catalog. The two serve different jobs and the split is deliberate:

- The **fetched catalog** drives the roles editor, so a key added on the backend appears in the UI with no admin deploy.
- The **union type** exists only so hardcoded `can("...")` call sites get autocomplete and fail the build on a typo — a runtime-fetched catalog cannot give compile-time safety.

A key present on the backend but missing from the union costs nothing: it still renders and is still grantable, and only becomes relevant if the admin wants to gate on it in code, at which point the union needs the entry anyway.

### Lookup helper

Storage is grouped by module, but keys are globally unique, so call sites should not have to name the module twice. `src/lib/permissions.ts` flattens once:

```ts
export const useCan = () => {
  const { permissions } = useAppSelector((s) => s.auth);
  const granted = useMemo(
    () =>
      new Set(
        permissions?.flatMap((m) =>
          Object.entries(m.permissions)
            .filter(([, v]) => v)
            .map(([k]) => k),
        ) ?? [],
      ),
    [permissions],
  );
  return useCallback((key: TPermissionKey) => granted.has(key), [granted]);
};
```

Call sites read `can("can_update_product")`.

### Sidebar

`TSidebarItem.feature?: EAppFeatures` becomes `permission?: TPermissionKey`. `canRead` becomes `!item.permission || can(item.permission)`. Each entry in `sidebarMenus.ts` gets its key:

| Sidebar entry               | Key                             |
| --------------------------- | ------------------------------- |
| Dashboard                   | none — always visible           |
| Products › All Products     | `can_see_product_page`          |
| Products › Create Product   | `can_create_product`            |
| Products › Bulk Upload      | `can_see_bulk_upload_page`      |
| Products › Filters          | `can_see_filter_page`           |
| Categories                  | `can_see_category_page`         |
| Detail Categories           | `can_see_details_category_page` |
| Brands                      | `can_see_brand_page`            |
| Orders                      | `can_see_order_page`            |
| Deals                       | `can_see_deal_page`             |
| Users › Admins              | `can_see_admin_page`            |
| Users › Customers           | `can_see_customer_page`         |
| Roles                       | `can_see_role_page`             |
| Storefront › Banner Builder | `can_see_banner_page`           |
| Storefront › PC Builder     | `can_see_pc_builder_page`       |

Detail pages not in the sidebar gate on their own keys: `/products/[productId]/edit` → `can_update_product`, `/orders/[orderNumber]` → `can_read_order_details`, `/deals/[dealId]` → `can_read_deal_details`, `/users/admins/[userId]` → `can_read_user_details`, `/storefront/banner-builder/[templateId]` → `can_read_banner_details`.

### Roles page

`useGetPermissionCatalogQuery()` feeds the Create, Edit and View modals. Seventy toggles cannot be a flat grid, so the editor is:

- one collapsible section per module,
- a header row per module showing a granted count (`7/9`) and a grant-all / revoke-all toggle,
- a search box filtering by label across all modules.

Create and Edit share a single `<PermissionMatrix catalog value onChange />` component instead of duplicating the grid, as they do today. `ViewRoleModal` renders the same catalog read-only, listing granted keys only.

### Page-level gating

`roles/page.tsx` and both `storefront/banner-builder` pages replace their `permissions?.find(...)` plus `access.create` reads with `can(...)` calls.

### RTK Query

`tagTypes.permissionCatalog` is added to `tagTypes.ts` and `tagTypesList` first, then `getPermissionCatalog` is injected in `rolesApi.ts`. The catalog is static per deploy, so it is fetched once and cached.

## Migration

A standalone script, `src/scripts/migratePermissions.ts`, run manually — not on boot. For each role, for each module entry, it expands the old CRUD booleans through the catalog's `legacy` field:

```ts
const permissions = Object.fromEntries(
  PERMISSION_CATALOG[module].map((d) => [
    d.key,
    old.access?.[d.legacy] === true,
  ]),
);
```

So `access.read: true` on `product` grants `can_see_product_page`, `can_read_all_products` and `can_read_product_details` together. Every existing admin keeps exactly the access they have today; granularity is tightened afterwards from the UI.

The script is idempotent (it skips documents already carrying `module`), backs up the collection before writing, and prints a per-role before/after diff for review.

Master admins are unaffected throughout — `isMasterAdmin` short-circuits before any permission is read.

## Rollout

This is a breaking change across both repos; there is no intermediate state in which an old admin talks safely to a new backend.

1. Backend: catalog, `EAppModules`, model, validation, middleware, all 55 call sites, catalog endpoint.
2. Run the migration against a restored copy of production; verify the diffs.
3. Admin: types, `useCan`, sidebar, roles UI, page gating.
4. Deploy backend, run the migration, deploy admin — as one window.

## Verification

Neither repo has a test framework, so verification is manual:

- Log in as a non-master admin holding a role with partial grants.
- Confirm the sidebar hides exactly the entries whose keys are not granted.
- Confirm guarded routes return 401 with the permission key in the message.
- Confirm the roles page round-trips a save without dropping keys.
- Confirm the storefront still renders after `product/get-all` and `product-details-category/get-all` become guarded.

## Risks

- **Skipping the migration silently locks out every non-master admin**, because absent keys read as denied. The deploy window must include the migration run.
- `can_read_all_categories` is UI-only until the storefront's two navbar call sites move to `/customer/category/get-all`.
- Guarding `product/get-all` breaks any caller not yet identified. The two sibling repos were searched; a third consumer would surface as a 401.
