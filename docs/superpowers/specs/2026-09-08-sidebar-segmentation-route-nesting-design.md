# Sidebar Segmentation & Route Nesting Standardization

Date: 2026-09-08
Branch: `segmented-sidebar-and-proper-route-nesting`
Status: Approved design, pending implementation plan

## Problem

Two related structural defects in the admin app.

**The sidebar is unsegmented.** All eleven top-level entries render into a
single unlabeled `SidebarGroup` (`src/components/shared/AppSidebar.tsx:352-356`).
Catalog, sales, people, storefront and system concerns are interleaved in an
arbitrary order: Details Category, Brand and Category sit above Product; Roles
is wedged between Offers and Users. Five parent entries (`/product`, `/offers`,
`/users`, `/settings`, `/shop`) point at paths that have no `page.tsx`.

**Route nesting is inconsistent.** Resources are singular in some places and
plural in others (`brand`, `category`, `product` against `orders`, `users`,
`roles`). Paths repeat the resource name and embed verbs
(`/product/create-product`, `/product/update-product/[updateId]`,
`/product/all-products`). Dynamic parameters are named five different ways
(`[updateId]`, `[dealId]`, `[userId]`, `[id]`, `[templateId]`). Three grouping
segments (`offers`, `shop`, `settings`) exist solely to hold one child each.
`settings` holds PC Builder, which is a storefront feature rather than an
application setting and is filed under the wrong parent.
The dashboard lives at `src/app/page.tsx`, outside the `(mainLayout)` route
group, and wraps `<MainLayout>` by hand — duplicating what
`src/app/(mainLayout)/layout.tsx` already does and creating a second auth-gate
path.

The drift has already produced broken navigation: four links point at routes
that do not exist.

## Scope

In scope: sidebar grouping and ordering, sidebar active-state logic, sidebar
permission filtering, the `app/` directory structure and every resulting URL,
and all in-repo navigation references.

Out of scope: page-level UI, RTK Query endpoint URLs (these are backend API
paths and must not change), the backend itself apart from one optional data
migration, and any redirect layer for old URLs — the user explicitly declined
redirects.

## Decisions

These were settled during brainstorming and are not open for re-litigation
during implementation.

1. **Both sidebar and URLs change.** Not sidebar-only, not routes-only.
2. **No redirect layer.** Old bookmarks break. Accepted.
3. **Sidebar group labels are display-only; URL segments express namespaces.**
   A taxonomy label never becomes a path segment — `/brands`, not
   `/catalog/brands`. A path segment exists only where it is a genuine
   namespace shared by two or more sibling pages, which is why `/users/admins`,
   `/products/filters` and `/storefront/pc-builder` keep their parent segment while
   `/brands` and `/orders` sit at the root. A namespace segment need not be a
   reachable page or a clickable menu item.
4. **Collapsible submenus survive where a parent has 2+ children.** That is
   Products and Users only. Their parent triggers toggle rather than
   navigate — matching current behaviour — so neither needs a landing page.
5. **The sidebar filters by `read` permission.**
6. **PC Builder moves from `settings` to `storefront`**, joining Banner Builder
   under a STOREFRONT group. It configures a customer-facing surface, not the
   application. This promotes the container from a one-child holder into a
   two-child namespace, which is what earns it a URL segment under rule 3.
   There is no separate SYSTEM group.
7. **The namespace is named `storefront`, not `shop`, at both levels** — the
   sidebar label and the URL segment. `shop` is ambiguous in an e-commerce
   admin, where it could equally denote a merchant, a store location, or the
   admin's own shop entity; `storefront` names the customer-facing surface
   unambiguously. Using one word for the label and another for the path would
   reintroduce exactly the naming drift this work exists to remove, so
   `shop/banner-builder` moves to `storefront/banner-builder` as well.

## Route Map

| Current path                                                                                    | New path                                               |
| ----------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `app/page.tsx`                                                                                  | `app/(mainLayout)/page.tsx`                            |
| `(mainLayout)/brand/`                                                                           | `(mainLayout)/brands/`                                 |
| `(mainLayout)/category/`                                                                        | `(mainLayout)/categories/`                             |
| `(mainLayout)/details-category/`                                                                | `(mainLayout)/detail-categories/`                      |
| `(mainLayout)/product/all-products/`                                                            | `(mainLayout)/products/`                               |
| `(mainLayout)/product/create-product/`                                                          | `(mainLayout)/products/create/`                        |
| `(mainLayout)/product/update-product/[updateId]/`                                               | `(mainLayout)/products/[productId]/edit/`              |
| `(mainLayout)/product/bulk-upload/`                                                             | `(mainLayout)/products/bulk-upload/`                   |
| `(mainLayout)/product/bulk-upload/result/`                                                      | `(mainLayout)/products/bulk-upload/result/`            |
| `(mainLayout)/product/filters/`                                                                 | `(mainLayout)/products/filters/`                       |
| `(mainLayout)/orders/[id]/`                                                                     | `(mainLayout)/orders/[orderNumber]/`                   |
| `(mainLayout)/offers/deals/`                                                                    | `(mainLayout)/deals/`                                  |
| `(mainLayout)/offers/deals/[dealId]/`                                                           | `(mainLayout)/deals/[dealId]/`                         |
| `(mainLayout)/shop/banner-builder/`                                                             | `(mainLayout)/storefront/banner-builder/`              |
| `(mainLayout)/shop/banner-builder/[templateId]/`                                                | `(mainLayout)/storefront/banner-builder/[templateId]/` |
| `(mainLayout)/settings/pc-builder/`                                                             | `(mainLayout)/storefront/pc-builder/`                  |
| `(mainLayout)/orders/`, `users/admins/`, `users/admins/[userId]/`, `users/customers/`, `roles/` | unchanged                                              |

Naming rules, applied uniformly: resource segments are plural; a path never
repeats its resource name or embeds a verb outside a leaf action segment
(`create`, `edit`); dynamic segments are named `[resourceId]` after the
resource they identify.

`orders/[id]` becomes `[orderNumber]` because the value routed into it is
`row.original.orderNumber` (`orders/page.tsx:85,168`), not a Mongo `_id`. The
rename makes the page honest about what it receives.

The dashboard move drops its hand-rolled `<MainLayout>` wrapper; the route
group's `layout.tsx` supplies it.

## Sidebar Structure

Five `SidebarGroup`s, each with a `SidebarGroupLabel`:

```
OVERVIEW
  Dashboard                     /
CATALOG
  Products (collapsible)
    All Products                /products
    Create Product              /products/create
    Bulk Upload                 /products/bulk-upload
    Filters                     /products/filters
  Categories                    /categories
  Detail Categories             /detail-categories
  Brands                        /brands
SALES
  Orders                        /orders
  Deals                         /deals
PEOPLE
  Users (collapsible)
    Admins                      /users/admins
    Customers                   /users/customers
  Roles                         /roles
STOREFRONT
  Banner Builder                /storefront/banner-builder
  PC Builder                    /storefront/pc-builder
```

STOREFRONT's two entries stay flat. `storefront` is a URL namespace, not a menu
item, so it gets no collapsible — the group label already supplies the visual
grouping, and wrapping two items in a collapsible inside a labelled group would
add a level of nesting that buys nothing. Collapsibles appear only for Products
and Users, which are real menu items with children.

### Configuration shape

The menu data moves out of the component into
`src/components/shared/sidebarMenus.ts`. `AppSidebar.tsx` currently carries
~130 lines of literal data ahead of its render logic; separating them lets the
component be read as rendering logic alone and lets the menu be changed without
touching JSX.

```ts
type TSidebarItem = {
  title: string;
  link: string;
  icon: LucideIcon;
  feature?: EAppFeatures; // omitted => always visible
  children?: TSidebarItem[];
};

type TSidebarGroup = {
  label: string;
  items: TSidebarItem[];
};
```

The numeric `id` field is dropped. It served only as a React key, which the
`link` — unique by construction — supplies instead, and its values were
duplicated across sibling subtrees.

## Active State

`isLinkActive`, the substring-based `parentActive`, and the `openRoute` state
are all replaced by a single helper:

```ts
const isActive = (path: string, link: string) =>
  link === "/" ? path === "/" : path === link || path.startsWith(link + "/");
```

This fixes three defects:

- `parentActive` used `pathName.includes(menu.link)`, which is true for every
  path when `link === "/"`, so Dashboard read as active everywhere.
- `isLinkActive` compared for exact equality, so no parent ever highlighted
  while a child route was open; `/products/[productId]/edit` will now highlight
  Products.
- Substring matching could collide between sibling routes that share a prefix.
  Boundary-aware `startsWith` cannot.

`openRoute` (`AppSidebar.tsx:208`) is written and never read — destructured as
`const [, setOpenRoute]`. It is deleted along with its `useEffect`. A
collapsible's open state comes from `defaultOpen={parentActive}`, as today.

## Permission Filtering

An item renders only when the user holds `read` on its declared feature:

```ts
const canRead = (item: TSidebarItem) =>
  !item.feature ||
  !!permissions?.find((p) => p.feature === item.feature)?.access.read;
```

A collapsible parent hides when every child hides. A group hides — label
included — when every item hides. Items without a `feature` (Dashboard) always
render.

| Item                                   | Feature          |
| -------------------------------------- | ---------------- |
| Dashboard                              | —                |
| Products, All Products, Create Product | `product`        |
| Bulk Upload                            | `bulkUpload`     |
| Filters                                | `productFilter`  |
| Categories                             | `category`       |
| Detail Categories                      | `productDetails` |
| Brands                                 | `brand`          |
| Orders                                 | `orders`         |
| Deals                                  | `deals`          |
| Admins, Customers                      | `user`           |
| Roles                                  | `role`           |
| Banner Builder                         | `banner`         |
| PC Builder                             | `settings`       |

PC Builder's feature stays `settings` even though its URL moves to
`/storefront/`.
The permission key is defined by the backend enum and is unrelated to the
frontend path; renaming it would require a backend change and a data migration
for no benefit.

### The enum must be corrected first

`EAppFeatures` in `src/interface/auth.interface.ts:8-19` diverges from the
backend's authoritative copy in
`it-daily-backend/src/app/modules/roles/roles.interface.ts:10-25`:

- Missing entirely: `bulkUpload`, `deals`, `settings`, `orders`.
- Misspelled: `productFilter = "porductFilter"` against the backend's
  `productFilter = "productFilter"`.

Filtering cannot work until the two match, so the frontend enum is corrected to
mirror the backend exactly.

**This has a data consequence.** `CreateRoleModal.tsx:49` builds its permission
matrix from `Object.values(EAppFeatures)`, so every role created through this
admin UI has persisted the string `"porductFilter"` into MongoDB. Correcting
the spelling orphans those stored entries, and the affected roles silently lose
product-filter access.

Resolution: correct the enum, and author a one-off migration renaming the
stored key from `porductFilter` to `productFilter` across the roles collection.
The script is written into the backend repo but **is not executed** as part of
this work — running a write against the database requires explicit
authorization at the time of running, which has not been given. Until it runs,
roles carrying the old spelling will not see the Filters item.

## Navigation Reference Updates

Every in-repo navigation reference is rewritten. RTK Query `url` values in
`src/redux/api/*.ts` are backend API paths and are explicitly excluded — a
naive find-and-replace over `/product/` or `/brand` would corrupt them.

Call sites to update:

- `offers/deals/page.tsx:215,261,269`
- `orders/[id]/page.tsx:171`
- `product/all-products/page.tsx:229,274`
- `product/bulk-upload/result/page.tsx:43,169,175`
- `product/update-product/[updateId]/page.tsx:84,108`
- `shop/banner-builder/[templateId]/page.tsx:98`
- `shop/banner-builder/page.tsx:157`
- `components/banner/CreateBannerTemplate.tsx:32`
- `components/product/all-product/AllProductsGridView.tsx:109`
- `components/notifications/notificationConfig.ts` — all nine `route`
  functions
- `components/shared/AppSidebar.tsx` — via the extracted menu config

Pages consuming a renamed dynamic parameter must update their `useParams`
destructuring: `orders/[id]/page.tsx:83` (`id` to `orderNumber`) and
`product/update-product/[updateId]/page.tsx:71` (`updateId` to `productId`).

### Pre-existing broken links, fixed in passing

Four links already point at routes that do not exist. They are repaired as part
of this work rather than carried forward:

| Location                            | Broken target           | Fix              |
| ----------------------------------- | ----------------------- | ---------------- |
| `orders/[id]/page.tsx:630`          | `/admin/orders`         | `/orders`        |
| `components/deals/DealCard.tsx:106` | `/deal/update-deal/:id` | `/deals/:id`     |
| `components/shared/Navbar.tsx:63`   | `/my-profile`           | remove the entry |
| `components/shared/Navbar.tsx:70`   | `/settings`             | remove the entry |

The two Navbar entries are placeholder links in the avatar dropdown, sitting
beside a working Logout. Neither destination has ever existed in the app.
Building a profile page and a settings page to justify them is outside this
scope, so both `<Link>` entries are deleted and the dropdown keeps Logout
alone. If those pages are wanted later, the entries come back with them.

## Verification

The project has no test framework — `CLAUDE.md` states this explicitly, and no
test script exists in `package.json`. Verification is therefore build, lint,
static sweep and manual walkthrough:

1. `npm run build` passes.
2. `npm run lint` passes.
3. A grep sweep returns zero hits for every retired path string
   (`/product/`, `/offers/`, `/shop/`, `/settings/`, `/details-category`,
   `"/brand"`, `"/category"`, `/admin/orders`, `/deal/update-deal`,
   `/my-profile`) across `src/**/*.{ts,tsx}`, excluding `src/redux/api/`.
4. Every route in the new map loads without a 404.
5. Every sidebar entry navigates to its intended page and highlights correctly,
   including a child route highlighting its collapsible parent.
6. Signing in as a role with partial permissions hides exactly the expected
   items and collapses any group left empty.

## Risks

- **Broken bookmarks.** Accepted by explicit decision; no redirects.
- **API path corruption.** The highest-risk failure mode is a bulk rename
  reaching `src/redux/api/*.ts`. Route edits must be made per call site, and
  verification step 3 excludes that directory precisely so it cannot mask a
  mistake there.
- **Orphaned `porductFilter` permissions** until the migration is run. Known,
  documented above.
- **Merge conflicts** against concurrent work — this touches roughly 20 files
  including most pages.
