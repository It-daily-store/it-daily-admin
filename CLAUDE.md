# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 15 (App Router, React 19, Turbopack) admin dashboard for "Daily It" (an e-commerce/IT products platform). TypeScript, Tailwind CSS v4, shadcn/ui (new-york style, Radix UI primitives), Redux Toolkit + RTK Query for state/data, react-hook-form + zod for forms, axios for HTTP, socket.io-client for realtime cache updates.

Package manager: **npm** (`package-lock.json` present). Run commands from PowerShell.

## Commands

```powershell
npm install              # install dependencies
npm run dev               # dev server on port 7000, Turbopack (local .env)
npm run dev:prod          # dev server using .env.prod (via env-cmd)
npm run build              # production build (Turbopack)
npm run build:prod         # production build using .env.prod
npm run start               # start built app on port 7000
npm run start:prod           # start built app using .env.prod
npm run lint                # eslint
npm run lint:fix             # eslint --fix
npm run lint:strict          # eslint over all js/jsx/ts/tsx
npm run prettier              # prettier --write across the repo
```

There is no test script/framework configured in this project — do not assume Jest/Vitest exists.

Husky + lint-staged run on pre-commit (see `.husky/pre-commit`, `.lintstagedrc`, `lint-staged.config.js`) — staged files are linted/formatted automatically on commit.

## High-Level Architecture

### Routing (`src/app`)

- App Router with two top-level route groups:
  - `(auth)` — `login`, `reset-password`, `verify-email`. Has its own `layout.tsx`, no sidebar/nav.
  - `(mainLayout)` — every authenticated admin page (`brand`, `category`, `roles`, `users/*`, `product/*`, `orders`, `offers/deals`, `details-category`, `settings/*`, `shop/*`, etc.). Its `layout.tsx` wraps `children` with `<MainLayout>` from `src/components/layouts/MainLayout.tsx`.
- `MainLayout` is the single client-side auth gate: it reads `isAuthenticated` from the Redux `auth` slice, redirects to `/login` when false, otherwise calls `GET /auth/getMyData` to hydrate the current user + `permissions` into the store, sets up the socket connection (`connectSocket`/`disconnectSocket`, `adminJoin` room), and renders `AppSidebar` + `Navbar` + a `sonner` `Toaster`. A logo/spinner screen is shown until the user fetch resolves. Any new authenticated page just needs a `page.tsx` under `(mainLayout)/...` — no per-page auth boilerplate is needed.
- Dynamic routes use bracket folders, e.g. `users/admins/[userId]/page.tsx`, `product/update-product/[updateId]/page.tsx`, `offers/deals/[dealId]/page.tsx`.

### State & Data: RTK Query API-slice pattern (`src/redux/**`)

This is the dominant pattern in the codebase — every feature module (brand, category, roles, product, deals, orders, users, filters, dashboard, notifications, gallery, bulk upload, settings...) follows the same shape, so new features should extrapolate from it rather than invent a new one.

- `src/redux/api/baseApi.ts` defines one `createApi` instance (`reducerPath: "baseApi"`) using a **custom axios-based base query** (`src/lib/axiosBaseQuery.ts`, wrapping `src/lib/axiosInstance.ts`) instead of `fetchBaseQuery`. `tagTypes` come from a single shared enum.
- `src/redux/api/tagTypes.ts` centralizes every cache tag as the `tagTypes` enum plus a `tagTypesList` array passed into `baseApi`. **Any new feature must add its tag here first**, then reference `tagTypes.<feature>` in its slice — do not invent ad-hoc string tags.
- Each feature gets its own file under `src/redux/api/*.ts` (e.g. `brandApi.ts`, `categories.ts`, `rolesApi.ts`, `productApi.ts`) that calls `baseApi.injectEndpoints({...})` and exports the generated hooks (`useGetAllXQuery`, `useCreateXMutation`, `useUpdateXMutation`, `useDeleteXMutation`). Conventions:
  - `query` endpoints return `{ url, method: "GET" }`; mutations return `{ url, method: "POST"|"PATCH"|"DELETE", data: payload }` (axios-style `data`, not RTKQ's `body`).
  - REST URL convention: `/<resource>/get-all`, `/<resource>/create`, `/<resource>/update/:id` (or PATCH `/<resource>/:id`), `/<resource>/delete/:id` (or DELETE `/<resource>/:id`) — mirrors patterns vary slightly per module, check the sibling backend route before assuming one form.
  - `providesTags: [tagTypes.<feature>]` on list/get queries; `invalidatesTags: (result) => (result ? [tagTypes.<feature>] : [])` (or a plain array) on mutations — invalidation is coarse-grained (whole-list) per tag, not per-id.
  - Some list queries (e.g. `categories.ts`) additionally use `onCacheEntryAdded` to subscribe to a `socket.io` event (see `src/lib/socket.ts`) and mutate the RTK Query cache directly via `updateCachedData`/`draft` for realtime create/update/delete — follow this same pattern when a feature needs live updates instead of polling.
- `src/redux/reducers/` holds plain Redux slices (`auth/authSlice.ts` for `{ user, token, isAuthenticated, permissions }`, `general/generalReducer.ts`) combined in `combinedReducer.ts`. `src/redux/store.ts` wires `redux-persist` (persisting through `FLUSH/REHYDRATE/PAUSE/PERSIST/PURGE/REGISTER` in the serializableCheck ignore list) plus `baseApi.middleware`. Access state via the typed hooks in `src/redux/hooks/index.ts` (`useAppDispatch`/`useAppSelector`), never plain `react-redux` hooks.
- Domain types for each feature live in `src/interface/*.ts` (e.g. `brand.interface.ts`, `category.ts`, `auth.interface.ts`) and are imported into both the API slice and the components — add/extend interfaces here rather than inlining shapes in components.

### Auth / Permissions (RBAC)

- Roles carry a `permissions: TPermission[]` array where each entry is `{ feature: EAppFeatures, access: { read, create, update, delete } }` (`src/interface/auth.interface.ts`). `EAppFeatures` is the enum of gate-able modules (role, product, category, gallery, user, brand, productFilter, ...) — add a new value here when a new gated module is introduced.
- `permissions` are hydrated into the `auth` slice by `MainLayout` after `GET /auth/getMyData` and read via `useAppSelector((s) => s.auth)`. Pages that need to gate actions look up their own feature's entry, e.g. `roles/page.tsx` does `permissions?.find(p => p.feature === "role")`, then conditionally render create/edit/delete controls based on `access.create`/`update`/`delete`.
- `handleLogout()` / `globalError()` (in `src/lib/utils.ts`) are the standard helpers: `globalError(err)` extracts `err.data.errorSources[0].message` from an RTK Query error and shows a `sonner` toast; use it in every mutation's `catch` block instead of ad-hoc error parsing.

### Component organization (`src/components`)

- `components/ui/` — shadcn/ui primitives (button, dialog, table, form, input, tabs, sidebar, etc.), generated/configured per `components.json` (style: new-york, base color neutral, icon library lucide, `@/components/ui` alias). Treat these as the low-level design-system layer; extend variants (e.g. `button.tsx` has custom `edit_button`/`delete_button`/`view_button` variants) rather than styling raw Radix elements.
- `components/custom/` and `components/global/` — reusable app-level wrappers built on top of `ui/`, e.g. `custom/Modal.tsx` (generic Dialog wrapper with `open`/`title`/`triggerText`/`withTrigger`) and `global/DeleteModal.tsx` (confirmation dialog with `onConfirm`/`isLoading`/custom warning `children`). Every "create/edit" feature modal wraps `custom/Modal`; every destructive action reuses `global/DeleteModal` rather than a bespoke confirm dialog.
- `components/common/` — shared page-composition pieces: `PageHeader` (title/subtitle/action buttons), `GlobalTable`/`GlobalTable.tsx` (a `@tanstack/react-table` wrapper taking `defaultColumns: TCustomColumnDef<T>[]`, `data`, `isLoading`, `limit`, `tableName` — the standard list-page table), `GlobalDropdown`, `GlobalModal`, `UserCard`.
- Feature-specific components live in their own folder named after the feature (`components/brand/`, `components/categories/`, `components/roles/`, `components/deals/`, `components/product/`), typically split into `Create<Feature>.tsx` / `Edit<Feature>.tsx` (each a self-contained Modal + react-hook-form + zod schema + the feature's create/update mutation hook).
- `components/svgs/common/` holds one-off inline SVG icon components (prefer `lucide-react` for anything not already here).

### CRUD list-page pattern

List pages under `(mainLayout)/**/page.tsx` (see `brand/page.tsx`, `category/page.tsx`, `roles/page.tsx`) are consistently structured:

1. `"use client"` component that calls the feature's `useGetAllXQuery()` and a `useDeleteXMutation()`.
2. Local `useState` for modal targets: `editOpen`/`deleteOpen` (holding the record or id) rather than separate boolean + selected-item state.
3. `if (!isLoading && error) globalError(error)` for query errors.
4. `<PageHeader title=... subtitle=... buttons={<Create<Feature> />} />`.
5. `<GlobalTable defaultColumns={...} data={...} isLoading={...} />` with a `defaultColumns` array of `TCustomColumnDef<T>` — each column defines `accessorKey`, `header`, `cell`, `id`, `visible`, `canHide`, and size hints (`minSize`/`maxSize`); an "actions" column renders the `edit_button`/`delete_button` Button variants wired to the local modal state.
6. `<Edit<Feature> open... setOpen=... />` plus a `<DeleteModal open={deleteOpen !== null} onOpenChange={...} onConfirm={handleDelete} isLoading={isDeleting} title=...>` with feature-specific warning copy as `children`.
7. Create/Edit components (`components/<feature>/Create<Feature>.tsx`) build a `zod` schema, wire it via `useForm({ resolver: zodResolver(schema) })`, render `<Form>`/`<FormField>`/`<FormItem>` from `components/ui/form`, and on submit call the mutation `.unwrap()`, `toast.success(res.message)`, `form.reset()`, close the modal — with `globalError(err)` in the catch.

When adding a new CRUD feature, replicate this whole chain: add a `tagTypes` entry -> new `src/redux/api/<feature>Api.ts` -> `src/interface/<feature>.interface.ts` -> `components/<feature>/Create<Feature>.tsx` + `Edit<Feature>.tsx` -> `(mainLayout)/<feature>/page.tsx` using `GlobalTable` + `PageHeader` + `DeleteModal`.

### Styling

- Tailwind CSS v4 via `@tailwindcss/postcss` (no separate `tailwind.config.*` — theme/tokens live in `src/app/globals.css` using `@theme`/CSS custom properties, consumed through shadcn's `cn()` helper in `src/lib/utils.ts`, which merges `clsx` + `tailwind-merge`).
- Dark mode via `next-themes` (`useTheme()`), referenced directly in components like `MainLayout` to switch logo assets.
- `prettier-plugin-tailwindcss` is enabled, so class ordering is auto-sorted by `npm run prettier` — don't hand-order Tailwind classes.

### Notable conventions

- ESLint (`eslint.config.mjs`, flat config extending `next/core-web-vitals` + `next/typescript`) intentionally disables `no-unused-vars`, `@typescript-eslint/no-explicit-any`, and several stylistic rules — this codebase does not enforce strict `any`-avoidance despite the general engineering guidance to prefer types; match existing file style rather than over-annotating.
- HTTP goes through `src/lib/axiosInstance.ts` (axios instance with interceptors) — never call `fetch`/`axios` directly in components; always go through an RTK Query endpoint in `src/redux/api/`.
- Realtime: `src/lib/socket.ts` exports `socket`, `connectSocket`, `disconnectSocket`; sockets are connected once in `MainLayout` and individual API slices subscribe to specific events inside `onCacheEntryAdded`.
