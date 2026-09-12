# Meta Pixel + CAPI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an admin configure the Meta Pixel and Conversions API from the admin panel, map Meta events to fixed storefront trigger points, and fire CAPI events when an order reaches a chosen status — idempotently, observably, and without a deploy.

**Architecture:** A new backend module `metaPixel` owns a single encrypted config document, a per-order identity snapshot, and an event log. The storefront reads a masked public config and fires the browser pixel from a fixed code-defined trigger registry. Server-side sends go through a BullMQ queue reusing the existing Redis, so Meta latency never touches an admin request. Order status changes run a rule engine that consults a per-order ledger to guarantee exactly-once sends.

**Tech Stack:** Backend — Express 4, Mongoose, Zod, BullMQ 5.58, ioredis, axios, Node `crypto`. Admin — Next.js 15 App Router, RTK Query (axios base query), react-hook-form + zod, shadcn/ui, TanStack Table. Storefront — Next.js 15 App Router, server actions.

**Spec:** `docs/superpowers/specs/2026-09-09-meta-pixel-capi-design.md` (in the `id-daily-admin` repo)

## Repositories

Three separate git repos. Every task states which one it touches.

| Alias  | Path                           |
| ------ | ------------------------------ |
| **BE** | `e:\itdaily\it-daily-backend`  |
| **AD** | `e:\itdaily\id-daily-admin`    |
| **FE** | `e:\itdaily\it-daily-homepage` |

Commit per repo, on a branch named `meta-pixel-capi-module` in each. The spec and this plan live in **AD**.

## Global Constraints

- **Graph API version is `v21.0`**, referenced from one exported constant. Never inline the version string at a call site.
- **No test runner exists in any of the three repos.** `npm test` in BE is a stub that exits 1. Do not add a framework — it is out of scope for this plan. Verification is: `npx tsc --noEmit` (BE, AD, FE), `npm run build` (AD, FE), purpose-built `ts-node` scripts under `BE/src/scripts/` following the existing `seed.ts` / `migratePermissions.ts` convention, `curl` against a running dev server, and Meta Events Manager Test Events. Every task ends with an explicit runnable verification step and its expected output.
- **No hardcoded secrets.** The encryption key is `process.env.META_PIXEL_ENCRYPTION_KEY`. The Meta access token exists only in the database (encrypted) and in `process.env` for nothing. Test values in scripts use obvious placeholders.
- **Currency defaults to `BDT`**, stored in config, never hardcoded in a payload builder.
- **Comments:** only where the code cannot explain itself (a non-obvious workaround, a business rule, a deliberate edge case), one line. This is a standing repo rule in all three CLAUDE.md files.
- **`value` is goods-only after discount** — sum of `item.finalPrice * item.quantity`, minus `couponDiscount.discountValue`, excluding `shippingCost` and `taxAmount`.
- **Deduplication** is by `event_name` + `event_id` pair. The `event_id` for an order event is always `` `${order._id}:${eventName}` ``.
- **Quote style differs per repo** — BE and AD use double quotes, FE uses single quotes. Prettier enforces it; run the repo's format script rather than hand-matching.
- **BE pre-commit** runs eslint via husky. **AD pre-commit runs a full `next build`** and takes about a minute — expect it, do not bypass it.
- **RTK Query conventions (AD):** add the tag to `src/redux/api/tagTypes.ts` (enum _and_ `tagTypesList`) before writing the slice; mutations use axios-style `data`, not `body`; every mutation catch calls `globalError(err)` from `src/lib/utils.ts`.

---

## File Structure

### BE — `it-daily-backend`

| File                                                   | Responsibility                                                                                              |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `src/app/modules/metaPixel/metaPixel.constants.ts`     | Graph API version, trigger registry, Meta standard event list, backend-visible key set                      |
| `src/app/modules/metaPixel/metaPixel.interface.ts`     | `IMetaPixelConfig`, `IMetaPixelTrigger`, `IMetaPixelStatusRule`, `IMetaPixelEventLog`, `IOrderTrackingData` |
| `src/app/modules/metaPixel/metaPixel.crypto.ts`        | AES-256-GCM encrypt/decrypt of the access token                                                             |
| `src/app/modules/metaPixel/metaPixel.identity.ts`      | PII normalization + SHA-256 hashing, `fbc` construction, CIDR/bot matching                                  |
| `src/app/modules/metaPixel/metaPixel.model.ts`         | `MetaPixelConfig` model                                                                                     |
| `src/app/modules/metaPixel/metaPixelEventLog.model.ts` | `MetaPixelEventLog` model with TTL index                                                                    |
| `src/app/modules/metaPixel/metaPixel.payload.ts`       | Builds a CAPI payload from an order or a trigger payload                                                    |
| `src/app/modules/metaPixel/metaPixel.sender.ts`        | `sendToMeta()` — the only place that talks to Graph API                                                     |
| `src/app/modules/metaPixel/metaPixel.queue.ts`         | BullMQ queue + worker, retry policy, ledger/log outcome writes                                              |
| `src/app/modules/metaPixel/metaPixel.service.ts`       | Config CRUD, test connection, preview, status-rule engine, log queries                                      |
| `src/app/modules/metaPixel/metaPixel.validation.ts`    | Zod schemas                                                                                                 |
| `src/app/modules/metaPixel/metaPixel.controller.ts`    | Thin controllers                                                                                            |
| `src/app/modules/metaPixel/metaPixel.route.ts`         | Routes + `checkPermission` gates                                                                            |
| `src/scripts/verifyMetaPixelIdentity.ts`               | Assertion script for crypto + hashing (stands in for unit tests)                                            |

Modified: `roles.interface.ts`, `roles.permissions.ts`, `interface/common.ts` (RedisKeys), `routes/index.ts`, `config/index.ts`, `order.interface.ts`, `order.model.ts`, `order.service.ts`, `order.route.ts`, `server.ts`.

### AD — `id-daily-admin`

| File                                                      | Responsibility                                               |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| `src/interface/metaPixel.interface.ts`                    | Mirrored types + the trigger registry labels shown in the UI |
| `src/redux/api/metaPixelApi.ts`                           | All eight endpoints                                          |
| `src/app/(mainLayout)/marketing/meta-pixel/page.tsx`      | Tab shell                                                    |
| `src/app/(mainLayout)/marketing/meta-pixel/logs/page.tsx` | Event log list                                               |
| `src/components/marketing/MetaPixelSetupTab.tsx`          | Credentials + test connection                                |
| `src/components/marketing/MetaPixelEventsTab.tsx`         | Trigger registry table                                       |
| `src/components/marketing/MetaPixelStatusRulesTab.tsx`    | Status rule list                                             |
| `src/components/marketing/MetaPixelStatusRuleModal.tsx`   | Create/edit a rule                                           |
| `src/components/marketing/MetaPixelHygieneTab.tsx`        | Kill switch, excluded IPs, bots                              |
| `src/components/marketing/PayloadPreviewModal.tsx`        | Shared JSON preview dialog                                   |
| `src/components/marketing/OrderMetaEventsCard.tsx`        | Per-order ledger card                                        |

Modified: `src/redux/api/tagTypes.ts`, `src/interface/auth.interface.ts`, `src/components/shared/sidebarMenus.ts`, the order detail page.

### FE — `it-daily-homepage`

| File                                   | Responsibility                                                     |
| -------------------------------------- | ------------------------------------------------------------------ |
| `src/lib/metaPixel/triggers.ts`        | The trigger registry — must stay byte-identical in meaning to BE's |
| `src/lib/metaPixel/getPublicConfig.ts` | Server-side cached fetch of the masked config                      |
| `src/providers/MetaPixelProvider.tsx`  | Client context + base pixel script + `useTrackEvent`               |
| `src/lib/metaPixel/serverEvent.ts`     | Forwards an eventId to BE's ingress endpoint                       |

Modified: `src/app/layout.tsx`, `src/actions/checkout.ts`, and one call site per trigger key.

---

## Task 1: RBAC — the `marketing` module

**Repo:** BE, then AD

**Files:**

- Modify: `BE/src/app/modules/roles/roles.interface.ts`
- Modify: `BE/src/app/modules/roles/roles.permissions.ts`
- Modify: `AD/src/interface/auth.interface.ts`

**Interfaces:**

- Consumes: nothing.
- Produces: `EAppModules.marketing`; permission keys `can_see_meta_pixel_page`, `can_read_marketing`, `can_update_marketing`, `can_read_meta_pixel_logs`, `can_retry_meta_pixel_event`. Every later BE route uses these; every later AD component uses them via `useCan()`.

`PERMISSION_CATALOG` is declared `satisfies Record<EAppModules, readonly TPermissionDef[]>` and `MODULE_LABELS` is a `Record<EAppModules, string>`, so adding the enum value makes both files fail to compile until updated. That is the verification.

- [ ] **Step 1: Add the enum value and watch the compile break**

In `roles.interface.ts`, add to `EAppModules`:

```ts
  marketing = "marketing",
```

- [ ] **Step 2: Run the type check to confirm it fails in exactly two places**

```bash
cd /e/itdaily/it-daily-backend && npx tsc --noEmit
```

Expected: FAIL — errors on `MODULE_LABELS` and `PERMISSION_CATALOG` in `roles.permissions.ts`, both saying property `marketing` is missing.

- [ ] **Step 3: Add the label and the permission definitions**

In `roles.permissions.ts`, add to `MODULE_LABELS`:

```ts
  [EAppModules.marketing]: "Marketing",
```

and add to `PERMISSION_CATALOG`:

```ts
  [EAppModules.marketing]: [
    {
      key: "can_see_meta_pixel_page",
      label: "See Meta pixel page",
      legacy: "read",
    },
    {
      key: "can_read_marketing",
      label: "View Meta pixel configuration",
      legacy: "read",
    },
    {
      key: "can_update_marketing",
      label: "Update Meta pixel configuration",
      legacy: "update",
    },
    {
      key: "can_read_meta_pixel_logs",
      label: "View Meta pixel event log",
      legacy: "read",
    },
    {
      key: "can_retry_meta_pixel_event",
      label: "Retry a failed Meta pixel event",
      legacy: "update",
    },
  ],
```

- [ ] **Step 4: Verify the type check passes and the catalog has no duplicate keys**

```bash
cd /e/itdaily/it-daily-backend && npx tsc --noEmit && npx ts-node -e "require('./src/app/modules/roles/roles.permissions'); console.log('catalog loaded, no duplicate keys')"
```

Expected: no tsc output, then `catalog loaded, no duplicate keys`. The module throws at import time on a duplicate key, so a silent collision cannot pass this step.

- [ ] **Step 5: Mirror the keys in the admin permission union**

In `AD/src/interface/auth.interface.ts`, append to the `TPermissionKey` union (it currently ends at `"can_update_settings"`):

```ts
  | "can_see_meta_pixel_page"
  | "can_read_marketing"
  | "can_update_marketing"
  | "can_read_meta_pixel_logs"
  | "can_retry_meta_pixel_event";
```

- [ ] **Step 6: Verify the admin type check passes**

```bash
cd /e/itdaily/id-daily-admin && npx tsc --noEmit
```

Expected: no output.

No role migration script is needed: a role document with no `marketing` entry yields `granted !== true` in `checkPermission`, which denies. `isMasterAdmin` short-circuits before any lookup, so the master admin has access immediately.

- [ ] **Step 7: Commit both repos**

```bash
cd /e/itdaily/it-daily-backend && git checkout -b meta-pixel-capi-module && git add src/app/modules/roles && git commit -m "feat(roles): add marketing module permissions for Meta pixel"
cd /e/itdaily/id-daily-admin && git add src/interface/auth.interface.ts && git commit -m "feat(roles): mirror marketing permission keys"
```

---

## Task 2: Token encryption and identity hashing

**Repo:** BE

**Files:**

- Create: `src/app/modules/metaPixel/metaPixel.crypto.ts`
- Create: `src/app/modules/metaPixel/metaPixel.identity.ts`
- Create: `src/scripts/verifyMetaPixelIdentity.ts`
- Modify: `src/app/config/index.ts`
- Modify: `package.json` (one script entry)

**Interfaces:**

- Consumes: nothing.
- Produces:
  - `encryptToken(plain: string): string` and `decryptToken(stored: string): string`
  - `maskToken(plain: string): string` → last 4 characters
  - `hashIdentity(value: string | undefined, kind: TIdentityKind): string | undefined`
  - `buildFbc(fbclid: string, timestampMs: number): string`
  - `isIpExcluded(ip: string | undefined, patterns: string[]): boolean`
  - `isBotUserAgent(ua: string | undefined): boolean`
  - `type TIdentityKind = "em" | "ph" | "fn" | "ln" | "ct" | "st" | "zp" | "country" | "external_id"`

- [ ] **Step 1: Write the verification script first — it defines the contract**

Create `src/scripts/verifyMetaPixelIdentity.ts`:

```ts
import assert from "assert";
import {
  decryptToken,
  encryptToken,
  maskToken,
} from "../app/modules/metaPixel/metaPixel.crypto";
import {
  buildFbc,
  hashIdentity,
  isBotUserAgent,
  isIpExcluded,
} from "../app/modules/metaPixel/metaPixel.identity";

const run = () => {
  // crypto round trip
  const token = "EAAG_placeholder_token_value_1234";
  const stored = encryptToken(token);
  assert.notStrictEqual(stored, token, "ciphertext must differ from plaintext");
  assert.strictEqual(decryptToken(stored), token, "round trip must restore");
  assert.notStrictEqual(
    encryptToken(token),
    stored,
    "random IV must produce different ciphertext each time",
  );
  assert.strictEqual(maskToken(token), "1234");

  // a tampered payload must throw, not silently return garbage
  assert.throws(() => decryptToken(stored.slice(0, -2) + "00"));

  // email: trim + lowercase before hashing
  const expectedEmail =
    "973dfe463ec85785f5f95af5ba3906eedb2d931c24e69824a89ea65dba4e813b";
  assert.strictEqual(hashIdentity("  Test@Example.com ", "em"), expectedEmail);
  assert.strictEqual(hashIdentity("test@example.com", "em"), expectedEmail);

  // phone: digits only, Bangladesh local form gets the country code
  assert.strictEqual(
    hashIdentity("01712-345678", "ph"),
    hashIdentity("8801712345678", "ph"),
  );
  assert.strictEqual(
    hashIdentity("+880 1712 345678", "ph"),
    hashIdentity("8801712345678", "ph"),
  );

  // zip: digits only. country: lowercase two-letter
  assert.strictEqual(hashIdentity("1207-A", "zp"), hashIdentity("1207", "zp"));
  assert.strictEqual(
    hashIdentity("BD", "country"),
    hashIdentity("bd", "country"),
  );

  // external_id is an opaque id: not lowercased, only trimmed
  assert.notStrictEqual(
    hashIdentity("AbC123", "external_id"),
    hashIdentity("abc123", "external_id"),
  );

  // empty in, empty out — never hash a blank string
  assert.strictEqual(hashIdentity("", "em"), undefined);
  assert.strictEqual(hashIdentity("   ", "em"), undefined);
  assert.strictEqual(hashIdentity(undefined, "em"), undefined);

  assert.strictEqual(
    buildFbc("IwAR123", 1757370000000),
    "fb.1.1757370000000.IwAR123",
  );

  assert.strictEqual(isIpExcluded("203.0.113.7", ["203.0.113.7"]), true);
  assert.strictEqual(isIpExcluded("203.0.113.7", ["203.0.113.0/24"]), true);
  assert.strictEqual(isIpExcluded("203.0.114.7", ["203.0.113.0/24"]), false);
  assert.strictEqual(isIpExcluded(undefined, ["203.0.113.0/24"]), false);
  assert.strictEqual(isIpExcluded("203.0.113.7", []), false);

  assert.strictEqual(
    isBotUserAgent("Mozilla/5.0 (compatible; Googlebot/2.1)"),
    true,
  );
  assert.strictEqual(isBotUserAgent("facebookexternalhit/1.1"), true);
  assert.strictEqual(
    isBotUserAgent("Mozilla/5.0 (Windows NT 10.0) Chrome/128.0"),
    false,
  );
  assert.strictEqual(isBotUserAgent(undefined), false);

  console.log("all meta pixel identity assertions passed");
};

run();
```

- [ ] **Step 2: Add the script entry and run it to confirm it fails**

In `package.json` scripts add:

```json
"verify:meta-pixel": "ts-node src/scripts/verifyMetaPixelIdentity.ts"
```

Run:

```bash
cd /e/itdaily/it-daily-backend && npm run verify:meta-pixel
```

Expected: FAIL — `Cannot find module '../app/modules/metaPixel/metaPixel.crypto'`.

- [ ] **Step 3: Add the config entry and generate a key**

In `src/app/config/index.ts` add to the exported object:

```ts
  meta_pixel_encryption_key: process.env.META_PIXEL_ENCRYPTION_KEY,
```

Generate a key and put it in `.env` (and `.env.prod`):

```bash
cd /e/itdaily/it-daily-backend && node -e "console.log('META_PIXEL_ENCRYPTION_KEY=' + require('crypto').randomBytes(32).toString('hex'))"
```

Append the printed line to `.env`. Never commit `.env`.

- [ ] **Step 4: Implement the crypto module**

Create `src/app/modules/metaPixel/metaPixel.crypto.ts`:

```ts
import crypto from "crypto";
import httpStatus from "http-status";
import config from "../../config";
import AppError from "../../errors/AppError";

const ALGORITHM = "aes-256-gcm";

const getKey = (): Buffer => {
  const raw = config.meta_pixel_encryption_key;

  if (!raw) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "META_PIXEL_ENCRYPTION_KEY is not configured",
    );
  }

  const key = Buffer.from(raw, "hex");

  if (key.length !== 32) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "META_PIXEL_ENCRYPTION_KEY must be 32 bytes of hex",
    );
  }

  return key;
};

export const encryptToken = (plain: string): string => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plain, "utf8"),
    cipher.final(),
  ]);

  return [
    iv.toString("hex"),
    cipher.getAuthTag().toString("hex"),
    encrypted.toString("hex"),
  ].join(":");
};

export const decryptToken = (stored: string): string => {
  const [ivHex, tagHex, dataHex] = stored.split(":");

  if (!ivHex || !tagHex || !dataHex) {
    throw new AppError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Stored Meta access token is malformed",
    );
  }

  const decipher = crypto.createDecipheriv(
    ALGORITHM,
    getKey(),
    Buffer.from(ivHex, "hex"),
  );
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
};

export const maskToken = (plain: string): string => plain.slice(-4);
```

- [ ] **Step 5: Implement the identity module**

Create `src/app/modules/metaPixel/metaPixel.identity.ts`:

```ts
import crypto from "crypto";

export type TIdentityKind =
  | "em"
  | "ph"
  | "fn"
  | "ln"
  | "ct"
  | "st"
  | "zp"
  | "country"
  | "external_id";

const BOT_UA_PATTERN =
  /bot|crawler|spider|crawling|facebookexternalhit|slurp|bingpreview|headlesschrome|lighthouse|pingdom|semrush|ahrefs/i;

// Meta requires E.164 digits with no plus. Local Bangladesh numbers arrive as
// 01XXXXXXXXX, so the leading zero is replaced with the country code.
const normalizePhone = (value: string): string => {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("880")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `880${digits.slice(1)}`;
  }

  return digits;
};

const normalize = (value: string, kind: TIdentityKind): string => {
  const trimmed = value.trim();

  switch (kind) {
    case "ph":
      return normalizePhone(trimmed);
    case "zp":
      return trimmed.replace(/\D/g, "");
    case "external_id":
      return trimmed;
    default:
      return trimmed.toLowerCase();
  }
};

export const hashIdentity = (
  value: string | undefined,
  kind: TIdentityKind,
): string | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = normalize(value, kind);

  if (!normalized) {
    return undefined;
  }

  return crypto.createHash("sha256").update(normalized).digest("hex");
};

export const buildFbc = (fbclid: string, timestampMs: number): string =>
  `fb.1.${timestampMs}.${fbclid}`;

const ipToLong = (ip: string): number | null => {
  const parts = ip.split(".");

  if (parts.length !== 4) {
    return null;
  }

  return parts.reduce((acc, part) => {
    const octet = Number(part);
    return octet >= 0 && octet <= 255 ? (acc << 8) + octet : NaN;
  }, 0);
};

export const isIpExcluded = (
  ip: string | undefined,
  patterns: string[],
): boolean => {
  if (!ip || !patterns.length) {
    return false;
  }

  const target = ipToLong(ip);

  return patterns.some((pattern) => {
    if (!pattern.includes("/")) {
      return pattern.trim() === ip;
    }

    const [network, bitsRaw] = pattern.split("/");
    const bits = Number(bitsRaw);
    const networkLong = ipToLong(network.trim());

    if (target === null || networkLong === null || Number.isNaN(target)) {
      return false;
    }

    if (!Number.isInteger(bits) || bits < 0 || bits > 32) {
      return false;
    }

    const mask = bits === 0 ? 0 : (-1 << (32 - bits)) >>> 0;

    return (target & mask) === (networkLong & mask);
  });
};

export const isBotUserAgent = (ua: string | undefined): boolean =>
  !!ua && BOT_UA_PATTERN.test(ua);
```

- [ ] **Step 6: Run the verification script and confirm every assertion passes**

```bash
cd /e/itdaily/it-daily-backend && npm run verify:meta-pixel
```

Expected: `all meta pixel identity assertions passed`.

If the email hash assertion fails, the expected value in the script is the SHA-256 of the exact string `test@example.com` — check normalization, not the constant.

- [ ] **Step 7: Commit**

```bash
cd /e/itdaily/it-daily-backend && git add src/app/modules/metaPixel src/scripts/verifyMetaPixelIdentity.ts src/app/config/index.ts package.json && git commit -m "feat(metaPixel): add token encryption and identity hashing utilities"
```

---

## Task 3: Trigger registry, config model, and config endpoints

**Repo:** BE

**Files:**

- Create: `src/app/modules/metaPixel/metaPixel.constants.ts`
- Create: `src/app/modules/metaPixel/metaPixel.interface.ts`
- Create: `src/app/modules/metaPixel/metaPixel.model.ts`
- Create: `src/app/modules/metaPixel/metaPixel.validation.ts`
- Create: `src/app/modules/metaPixel/metaPixel.service.ts`
- Create: `src/app/modules/metaPixel/metaPixel.controller.ts`
- Create: `src/app/modules/metaPixel/metaPixel.route.ts`
- Modify: `src/app/routes/index.ts`

**Interfaces:**

- Consumes: `encryptToken`, `decryptToken`, `maskToken` (Task 2); `EAppModules.marketing` and its keys (Task 1).
- Produces:
  - `GRAPH_API_VERSION = "v21.0"`
  - `TRIGGER_REGISTRY: readonly IMetaPixelTriggerDef[]` with `key`, `label`, `description`, `backendVisible`, `defaultEventName`, `defaultEnabled`
  - `META_STANDARD_EVENTS: readonly string[]`
  - `TMetaTriggerKey` — union of registry keys
  - `MetaPixelConfig` model
  - `MetaPixelService.getConfig()` → decrypted config for internal use; `MetaPixelService.getAdminConfig()` → masked; `MetaPixelService.getPublicConfig(ip)` → storefront shape; `MetaPixelService.updateConfig(userId, payload)`
  - Routes `GET /meta-pixel/public-config`, `GET /meta-pixel/config`, `PUT /meta-pixel/config`

- [ ] **Step 1: Write the constants**

Create `src/app/modules/metaPixel/metaPixel.constants.ts`:

```ts
export const GRAPH_API_VERSION = "v21.0";

export const META_STANDARD_EVENTS = [
  "AddPaymentInfo",
  "AddToCart",
  "AddToWishlist",
  "CompleteRegistration",
  "Contact",
  "CustomizeProduct",
  "Donate",
  "FindLocation",
  "InitiateCheckout",
  "Lead",
  "PageView",
  "Purchase",
  "Schedule",
  "Search",
  "StartTrial",
  "SubmitApplication",
  "Subscribe",
  "ViewContent",
] as const;

export type IMetaPixelTriggerDef = {
  key: string;
  label: string;
  description: string;
  backendVisible: boolean;
  defaultEventName: string;
  defaultEnabled: boolean;
};

export const TRIGGER_REGISTRY = [
  {
    key: "page_view",
    label: "Any page view",
    description: "Fires on every storefront route change.",
    backendVisible: false,
    defaultEventName: "PageView",
    defaultEnabled: true,
  },
  {
    key: "product_view",
    label: "Product detail page",
    description: "A customer opens a single product page.",
    backendVisible: false,
    defaultEventName: "ViewContent",
    defaultEnabled: true,
  },
  {
    key: "category_view",
    label: "Category listing page",
    description: "A customer opens a category or brand listing.",
    backendVisible: false,
    defaultEventName: "ViewContent",
    defaultEnabled: true,
  },
  {
    key: "search",
    label: "Search performed",
    description: "A customer submits a search query.",
    backendVisible: false,
    defaultEventName: "Search",
    defaultEnabled: true,
  },
  {
    key: "add_to_cart",
    label: "Add to cart",
    description: "A product is added to the cart.",
    backendVisible: true,
    defaultEventName: "AddToCart",
    defaultEnabled: true,
  },
  {
    key: "cart_view",
    label: "Cart page",
    description: "A customer opens the cart page.",
    backendVisible: false,
    defaultEventName: "",
    defaultEnabled: false,
  },
  {
    key: "wishlist_add",
    label: "Add to wishlist",
    description: "A product is saved to the wishlist.",
    backendVisible: false,
    defaultEventName: "AddToWishlist",
    defaultEnabled: true,
  },
  {
    key: "compare_add",
    label: "Add to compare",
    description: "A product is added to the compare list.",
    backendVisible: false,
    defaultEventName: "",
    defaultEnabled: false,
  },
  {
    key: "checkout_start",
    label: "Checkout started",
    description: "A customer reaches the checkout page.",
    backendVisible: true,
    defaultEventName: "InitiateCheckout",
    defaultEnabled: true,
  },
  {
    key: "checkout_success",
    label: "Order placed",
    description:
      "An order is created successfully. Off by default because Purchase is sent when an order reaches its configured status instead.",
    backendVisible: true,
    defaultEventName: "",
    defaultEnabled: false,
  },
  {
    key: "signup",
    label: "Account created",
    description: "A customer completes registration.",
    backendVisible: true,
    defaultEventName: "CompleteRegistration",
    defaultEnabled: true,
  },
  {
    key: "login",
    label: "Login",
    description: "A customer signs in.",
    backendVisible: true,
    defaultEventName: "",
    defaultEnabled: false,
  },
  {
    key: "pc_builder_save",
    label: "PC build saved",
    description: "A customer saves a PC build.",
    backendVisible: true,
    defaultEventName: "CustomizeProduct",
    defaultEnabled: true,
  },
  {
    key: "contact_submit",
    label: "Contact form submitted",
    description: "A customer submits a contact or enquiry form.",
    backendVisible: true,
    defaultEventName: "Contact",
    defaultEnabled: true,
  },
] as const satisfies readonly IMetaPixelTriggerDef[];

export type TMetaTriggerKey = (typeof TRIGGER_REGISTRY)[number]["key"];

export const TRIGGER_KEYS = TRIGGER_REGISTRY.map((t) => t.key) as string[];

export const BACKEND_VISIBLE_KEYS = TRIGGER_REGISTRY.filter(
  (t) => t.backendVisible,
).map((t) => t.key) as string[];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
] as const;
```

- [ ] **Step 2: Write the interfaces**

Create `src/app/modules/metaPixel/metaPixel.interface.ts`:

```ts
import { Types } from "mongoose";

export type TContentIdSource = "sku" | "_id" | "slug";

export type TSentEventStatus = "queued" | "sent" | "failed" | "dead";

export type TEventSource =
  | "browser_backup"
  | "status_rule"
  | "manual"
  | "test_connection";

export interface IMetaPixelTrigger {
  key: string;
  eventName: string;
  isCustomEvent: boolean;
  enabled: boolean;
  sendViaBrowser: boolean;
  sendViaCapi: boolean;
}

export interface IMetaPixelStatusRule {
  _id?: Types.ObjectId;
  status: string;
  eventName: string;
  isCustomEvent: boolean;
  enabled: boolean;
}

export interface IMetaPixelConfig {
  pixelId?: string;
  datasetId?: string;
  accessToken?: string;
  testEventCode?: string;
  tokenVerifiedAt?: Date;
  tokenExpiresAt?: Date;
  enabled: boolean;
  capiEnabled: boolean;
  currency: string;
  contentIdSource: TContentIdSource;
  contentType: string;
  excludedIps: string[];
  blockBots: boolean;
  triggers: IMetaPixelTrigger[];
  statusRules: IMetaPixelStatusRule[];
  lastUpdatedBy?: Types.ObjectId;
}

export interface IMetaPixelEventLog {
  eventName: string;
  eventId: string;
  source: TEventSource;
  orderId?: Types.ObjectId;
  triggerKey?: string;
  payload: Record<string, unknown>;
  status: TSentEventStatus;
  attempts: number;
  httpStatus?: number;
  metaResponse?: Record<string, unknown>;
  fbtraceId?: string;
  errorMessage?: string;
}

export interface IOrderSentEvent {
  eventName: string;
  eventId: string;
  status: TSentEventStatus;
  attempts: number;
  sentAt?: Date;
  fbtraceId?: string;
  errorMessage?: string;
}

export interface IOrderTrackingData {
  fbp?: string;
  fbc?: string;
  clientIp?: string;
  userAgent?: string;
  eventSourceUrl?: string;
  hashed?: {
    em?: string;
    ph?: string;
    fn?: string;
    ln?: string;
    ct?: string;
    st?: string;
    zp?: string;
    country?: string;
    external_id?: string;
  };
  sentEvents: IOrderSentEvent[];
}
```

- [ ] **Step 3: Write the model with a seeded default**

Create `src/app/modules/metaPixel/metaPixel.model.ts`:

```ts
import { model, Schema } from "mongoose";
import { IMetaPixelConfig } from "./metaPixel.interface";
import { ORDER_STATUSES } from "./metaPixel.constants";

const triggerSchema = new Schema(
  {
    key: { type: String, required: true },
    eventName: { type: String, default: "" },
    isCustomEvent: { type: Boolean, default: false },
    enabled: { type: Boolean, default: false },
    sendViaBrowser: { type: Boolean, default: true },
    sendViaCapi: { type: Boolean, default: false },
  },
  { _id: false },
);

const statusRuleSchema = new Schema({
  status: { type: String, enum: ORDER_STATUSES, required: true },
  eventName: { type: String, required: true },
  isCustomEvent: { type: Boolean, default: false },
  enabled: { type: Boolean, default: true },
});

const metaPixelConfigSchema = new Schema<IMetaPixelConfig>(
  {
    pixelId: { type: String, trim: true },
    datasetId: { type: String, trim: true },
    accessToken: { type: String },
    testEventCode: { type: String, trim: true },
    tokenVerifiedAt: { type: Date },
    tokenExpiresAt: { type: Date },
    enabled: { type: Boolean, default: false },
    capiEnabled: { type: Boolean, default: false },
    currency: { type: String, default: "BDT" },
    contentIdSource: {
      type: String,
      enum: ["sku", "_id", "slug"],
      default: "sku",
    },
    contentType: { type: String, default: "product" },
    excludedIps: { type: [String], default: [] },
    blockBots: { type: Boolean, default: true },
    triggers: { type: [triggerSchema], default: [] },
    statusRules: { type: [statusRuleSchema], default: [] },
    lastUpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

const MetaPixelConfig = model<IMetaPixelConfig>(
  "MetaPixelConfig",
  metaPixelConfigSchema,
);

export default MetaPixelConfig;
```

- [ ] **Step 4: Write the zod schemas**

Create `src/app/modules/metaPixel/metaPixel.validation.ts`:

```ts
import { z } from "zod";
import {
  META_STANDARD_EVENTS,
  ORDER_STATUSES,
  TRIGGER_KEYS,
} from "./metaPixel.constants";

// A custom event name must be a valid Meta event name: letters, digits,
// underscores and spaces only, so a typo cannot produce an unsendable event.
const eventNameSchema = z
  .string()
  .trim()
  .max(50)
  .regex(
    /^[A-Za-z0-9_ ]*$/,
    "Event name may only contain letters, digits, underscores and spaces",
  );

const triggerSchema = z
  .object({
    key: z.enum(TRIGGER_KEYS as [string, ...string[]]),
    eventName: eventNameSchema,
    isCustomEvent: z.boolean(),
    enabled: z.boolean(),
    sendViaBrowser: z.boolean(),
    sendViaCapi: z.boolean(),
  })
  .refine((t) => !t.enabled || t.eventName.length > 0, {
    message: "An enabled trigger must have an event name",
    path: ["eventName"],
  })
  .refine(
    (t) =>
      t.isCustomEvent ||
      !t.eventName ||
      META_STANDARD_EVENTS.includes(t.eventName as never),
    {
      message:
        "Unknown standard event. Mark it as a custom event to use this name.",
      path: ["eventName"],
    },
  );

const statusRuleSchema = z.object({
  _id: z.string().optional(),
  status: z.enum(ORDER_STATUSES as unknown as [string, ...string[]]),
  eventName: eventNameSchema.min(1, "Event name is required"),
  isCustomEvent: z.boolean(),
  enabled: z.boolean(),
});

const ipPatternSchema = z
  .string()
  .trim()
  .regex(
    /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/,
    "Use an IPv4 address or CIDR range, for example 203.0.113.7 or 203.0.113.0/24",
  );

const UpdateConfigSchema = z.object({
  pixelId: z.string().trim().max(50).optional(),
  datasetId: z.string().trim().max(50).optional(),
  // Absent means "keep the stored token"; an empty string means "clear it".
  accessToken: z.string().trim().optional(),
  testEventCode: z.string().trim().max(50).optional(),
  enabled: z.boolean().optional(),
  capiEnabled: z.boolean().optional(),
  currency: z.string().trim().length(3).optional(),
  contentIdSource: z.enum(["sku", "_id", "slug"]).optional(),
  excludedIps: z.array(ipPatternSchema).max(50).optional(),
  blockBots: z.boolean().optional(),
  triggers: z.array(triggerSchema).optional(),
  statusRules: z.array(statusRuleSchema).optional(),
});

export const MetaPixelValidation = { UpdateConfigSchema };
```

- [ ] **Step 5: Write the service**

Create `src/app/modules/metaPixel/metaPixel.service.ts`:

```ts
import httpStatus from "http-status";
import { Types } from "mongoose";
import AppError from "../../errors/AppError";
import { decryptToken, encryptToken, maskToken } from "./metaPixel.crypto";
import { isIpExcluded } from "./metaPixel.identity";
import { BACKEND_VISIBLE_KEYS, TRIGGER_REGISTRY } from "./metaPixel.constants";
import { IMetaPixelConfig } from "./metaPixel.interface";
import MetaPixelConfig from "./metaPixel.model";

const defaultTriggers = () =>
  TRIGGER_REGISTRY.map((def) => ({
    key: def.key,
    eventName: def.defaultEventName,
    isCustomEvent: false,
    enabled: def.defaultEnabled,
    sendViaBrowser: true,
    sendViaCapi: false,
  }));

const getConfigDocument = async () => {
  let doc = await MetaPixelConfig.findOne();

  if (!doc) {
    doc = await MetaPixelConfig.create({
      triggers: defaultTriggers(),
      statusRules: [
        {
          status: "delivered",
          eventName: "Purchase",
          isCustomEvent: false,
          enabled: true,
        },
      ],
    });
  }

  // A trigger key added to the registry after this document was created would
  // otherwise be missing from the admin UI forever.
  const missing = TRIGGER_REGISTRY.filter(
    (def) => !doc?.triggers.some((t) => t.key === def.key),
  );

  if (missing.length) {
    doc.triggers.push(
      ...missing.map((def) => ({
        key: def.key,
        eventName: def.defaultEventName,
        isCustomEvent: false,
        enabled: def.defaultEnabled,
        sendViaBrowser: true,
        sendViaCapi: false,
      })),
    );
    await doc.save();
  }

  return doc;
};

const getConfig = async () => {
  const doc = await getConfigDocument();
  const plain = doc.toObject();

  return {
    ...plain,
    accessToken: doc.accessToken ? decryptToken(doc.accessToken) : undefined,
  };
};

const getAdminConfig = async () => {
  const doc = await getConfigDocument();
  const plain = doc.toObject();

  delete plain.accessToken;

  return {
    ...plain,
    hasToken: !!doc.accessToken,
    tokenLast4: doc.accessToken
      ? maskToken(decryptToken(doc.accessToken))
      : undefined,
  };
};

const getPublicConfig = async (clientIp?: string) => {
  const doc = await getConfigDocument();

  const suppressed =
    !doc.enabled || !doc.pixelId || isIpExcluded(clientIp, doc.excludedIps);

  return {
    enabled: !suppressed,
    pixelId: suppressed ? undefined : doc.pixelId,
    testEventCode: suppressed ? undefined : doc.testEventCode,
    currency: doc.currency,
    triggers: doc.triggers
      .filter((t) => t.enabled && t.sendViaBrowser && t.eventName)
      .map((t) => ({
        key: t.key,
        eventName: t.eventName,
        sendViaCapi: t.sendViaCapi,
      })),
  };
};

const updateConfig = async (
  userId: Types.ObjectId,
  payload: Partial<IMetaPixelConfig>,
) => {
  const doc = await getConfigDocument();

  if (payload.accessToken !== undefined) {
    if (payload.accessToken === "") {
      doc.accessToken = undefined;
      doc.tokenVerifiedAt = undefined;
      // Clearing the credential must also disable everything that depends on it.
      doc.capiEnabled = false;
    } else {
      doc.accessToken = encryptToken(payload.accessToken);
      doc.tokenVerifiedAt = undefined;
    }
  }

  if (payload.capiEnabled === true && !doc.tokenVerifiedAt) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Run Test connection successfully before enabling the Conversions API",
    );
  }

  const assignable: (keyof IMetaPixelConfig)[] = [
    "pixelId",
    "datasetId",
    "testEventCode",
    "enabled",
    "capiEnabled",
    "currency",
    "contentIdSource",
    "excludedIps",
    "blockBots",
    "statusRules",
  ];

  assignable.forEach((key) => {
    if (payload[key] !== undefined) {
      (doc as never as Record<string, unknown>)[key] = payload[key];
    }
  });

  if (payload.triggers) {
    payload.triggers.forEach((incoming) => {
      const existing = doc.triggers.find((t) => t.key === incoming.key);

      if (!existing) {
        return;
      }

      existing.eventName = incoming.eventName;
      existing.isCustomEvent = incoming.isCustomEvent;
      existing.enabled = incoming.enabled;
      existing.sendViaBrowser = incoming.sendViaBrowser;
      existing.sendViaCapi =
        incoming.sendViaCapi &&
        BACKEND_VISIBLE_KEYS.includes(incoming.key) &&
        doc.capiEnabled;
    });
  }

  // Turning CAPI off must not leave triggers claiming they still send server-side.
  if (!doc.capiEnabled) {
    doc.triggers.forEach((t) => {
      t.sendViaCapi = false;
    });
  }

  doc.lastUpdatedBy = userId;
  await doc.save();

  return getAdminConfig();
};

export const MetaPixelService = {
  getConfig,
  getAdminConfig,
  getPublicConfig,
  updateConfig,
};
```

- [ ] **Step 6: Write the controller and routes**

Create `src/app/modules/metaPixel/metaPixel.controller.ts`:

```ts
import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { MetaPixelService } from "./metaPixel.service";

const getPublicConfig = catchAsync(async (req: Request, res: Response) => {
  const result = await MetaPixelService.getPublicConfig(req.ip);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Meta pixel public config retrived successfully",
    data: result,
  });
});

const getConfig = catchAsync(async (req: Request, res: Response) => {
  const result = await MetaPixelService.getAdminConfig();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Meta pixel config retrived successfully",
    data: result,
  });
});

const updateConfig = catchAsync(async (req: Request, res: Response) => {
  const result = await MetaPixelService.updateConfig(req.user.id, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Meta pixel config updated successfully",
    data: result,
  });
});

export const MetaPixelController = {
  getPublicConfig,
  getConfig,
  updateConfig,
};
```

Create `src/app/modules/metaPixel/metaPixel.route.ts`:

```ts
import { Router } from "express";
import checkPermission from "../../middleware/checkPermission";
import { validateRequest } from "../../middleware/validateRequest";
import { EAppModules } from "../roles/roles.interface";
import { MetaPixelController } from "./metaPixel.controller";
import { MetaPixelValidation } from "./metaPixel.validation";
import validateAuth from "../../middleware/auth";

const router = Router();

// Unauthenticated: the storefront needs this before any customer signs in.
router.get("/public-config", MetaPixelController.getPublicConfig);

router.get(
  "/config",
  validateAuth(),
  checkPermission(EAppModules.marketing, "can_read_marketing"),
  MetaPixelController.getConfig,
);

router.put(
  "/config",
  validateAuth(),
  checkPermission(EAppModules.marketing, "can_update_marketing"),
  validateRequest(MetaPixelValidation.UpdateConfigSchema),
  MetaPixelController.updateConfig,
);

const MetaPixelRoutes = router;

export default MetaPixelRoutes;
```

- [ ] **Step 7: Register the route as an unauthenticated-prefix module**

In `src/app/routes/index.ts`, import the routes and add to `moduleRoutes`:

```ts
import MetaPixelRoutes from "../modules/metaPixel/metaPixel.route";
```

```ts
  { path: "/meta-pixel", route: MetaPixelRoutes },
```

Then extend the mount condition so the module applies `validateAuth()` per route rather than at the prefix — `/meta-pixel/public-config` must stay public:

```ts
moduleRoutes.forEach((route) => {
  if (
    route.path === "/auth" ||
    route.path === "/customer" ||
    route.path === "/banner" ||
    route.path === "/meta-pixel"
  ) {
    router.use(route.path, route.route);
  } else {
    router.use(route.path, validateAuth(), route.route);
  }
});
```

- [ ] **Step 8: Verify the endpoints against a running server**

```bash
cd /e/itdaily/it-daily-backend && npx tsc --noEmit && npm run dev
```

In a second shell:

```bash
curl -s localhost:5000/api/v1/meta-pixel/public-config
curl -s localhost:5000/api/v1/meta-pixel/config
```

Expected: the first returns `"enabled": false` with `triggers: []` (nothing is configured yet) and no `pixelId`. The second returns 401 — it is permission-gated. Confirm the seeded document exists with the default rule:

```bash
curl -s -H "Authorization: <MASTER_ADMIN_TOKEN>" localhost:5000/api/v1/meta-pixel/config
```

Expected: `hasToken: false`, `capiEnabled: false`, 14 triggers, and one `statusRules` entry `{ status: "delivered", eventName: "Purchase", enabled: true }`.

Confirm the port and API prefix from `src/app.ts` if the curl 404s.

- [ ] **Step 9: Confirm CAPI cannot be enabled without a verified token**

```bash
curl -s -X PUT -H "Authorization: <MASTER_ADMIN_TOKEN>" -H "Content-Type: application/json" \
  -d '{"capiEnabled":true}' localhost:5000/api/v1/meta-pixel/config
```

Expected: 400 with `Run Test connection successfully before enabling the Conversions API`.

- [ ] **Step 10: Commit**

```bash
cd /e/itdaily/it-daily-backend && git add src/app/modules/metaPixel src/app/routes/index.ts && git commit -m "feat(metaPixel): add config model, trigger registry and config endpoints"
```

---

## Task 4: Event log model, payload builder, and preview endpoint

**Repo:** BE

**Files:**

- Create: `src/app/modules/metaPixel/metaPixelEventLog.model.ts`
- Create: `src/app/modules/metaPixel/metaPixel.payload.ts`
- Modify: `src/app/modules/metaPixel/metaPixel.service.ts`
- Modify: `src/app/modules/metaPixel/metaPixel.controller.ts`
- Modify: `src/app/modules/metaPixel/metaPixel.route.ts`
- Modify: `src/app/modules/metaPixel/metaPixel.validation.ts`

**Interfaces:**

- Consumes: `getConfig()` (Task 3), `hashIdentity` (Task 2), `IOrderTrackingData` (Task 3).
- Produces:
  - `MetaPixelEventLog` model
  - `buildOrderEventPayload(args: { order, config, eventName, eventId, eventTime })` → `TCapiPayload`
  - `buildTriggerEventPayload(args: { config, eventName, eventId, eventTime, custom, userData })` → `TCapiPayload`
  - `type TCapiPayload = { data: TCapiEvent[]; test_event_code?: string }`
  - `MetaPixelService.previewPayload(input)`
  - Route `POST /meta-pixel/preview-payload`

- [ ] **Step 1: Create the event log model**

Create `src/app/modules/metaPixel/metaPixelEventLog.model.ts`:

```ts
import { model, Schema } from "mongoose";
import { IMetaPixelEventLog } from "./metaPixel.interface";

const metaPixelEventLogSchema = new Schema<IMetaPixelEventLog>(
  {
    eventName: { type: String, required: true, index: true },
    eventId: { type: String, required: true, index: true },
    source: {
      type: String,
      enum: ["browser_backup", "status_rule", "manual", "test_connection"],
      required: true,
    },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
    triggerKey: { type: String },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: {
      type: String,
      enum: ["queued", "sent", "failed", "dead"],
      default: "queued",
      index: true,
    },
    attempts: { type: Number, default: 0 },
    httpStatus: { type: Number },
    metaResponse: { type: Schema.Types.Mixed },
    fbtraceId: { type: String },
    errorMessage: { type: String },
  },
  { timestamps: true },
);

// Logs are diagnostic, not a record of truth — the per-order ledger is.
metaPixelEventLogSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 * 90 },
);

const MetaPixelEventLog = model<IMetaPixelEventLog>(
  "MetaPixelEventLog",
  metaPixelEventLogSchema,
);

export default MetaPixelEventLog;
```

- [ ] **Step 2: Write the payload builder**

Create `src/app/modules/metaPixel/metaPixel.payload.ts`:

```ts
import { IOrder } from "../order/order.interface";
import { IMetaPixelConfig, TContentIdSource } from "./metaPixel.interface";

export type TCapiUserData = Record<string, string | string[] | undefined>;

export type TCapiEvent = {
  event_name: string;
  event_time: number;
  event_id: string;
  action_source: "website";
  event_source_url?: string;
  user_data: TCapiUserData;
  custom_data?: Record<string, unknown>;
};

export type TCapiPayload = {
  data: TCapiEvent[];
  test_event_code?: string;
};

type TPopulatedItem = IOrder["items"][number] & {
  productId?: { _id?: unknown; sku?: string; slug?: string };
};

const resolveContentId = (
  item: TPopulatedItem,
  source: TContentIdSource,
): string => {
  const product = item.productId;

  if (!product) {
    return "";
  }

  if (source === "sku") {
    return product.sku ?? "";
  }

  if (source === "slug") {
    return product.slug ?? "";
  }

  return String(product._id ?? product);
};

// Goods only, after discount: shipping and tax are deliberately excluded so
// reported ROAS reflects product revenue.
export const calculateOrderValue = (order: IOrder): number => {
  const itemsTotal = order.items.reduce(
    (sum, item) => sum + item.finalPrice * item.quantity,
    0,
  );

  return Math.max(itemsTotal - (order.couponDiscount?.discountValue ?? 0), 0);
};

const buildUserDataFromOrder = (order: IOrder): TCapiUserData => {
  const tracking = (
    order as never as {
      trackingData?: {
        hashed?: Record<string, string>;
        fbp?: string;
        fbc?: string;
        clientIp?: string;
        userAgent?: string;
      };
    }
  ).trackingData;

  const userData: TCapiUserData = {};
  const hashed = tracking?.hashed ?? {};

  Object.entries(hashed).forEach(([key, value]) => {
    if (value) {
      userData[key] = [value];
    }
  });

  if (tracking?.fbp) userData.fbp = tracking.fbp;
  if (tracking?.fbc) userData.fbc = tracking.fbc;
  if (tracking?.clientIp) userData.client_ip_address = tracking.clientIp;
  if (tracking?.userAgent) userData.client_user_agent = tracking.userAgent;

  return userData;
};

export const hasUsableIdentity = (userData: TCapiUserData): boolean =>
  Object.keys(userData).length > 0;

export const buildOrderEventPayload = (args: {
  order: IOrder;
  config: IMetaPixelConfig;
  eventName: string;
  eventId: string;
  eventTime: Date;
}): TCapiPayload => {
  const { order, config, eventName, eventId, eventTime } = args;

  const items = order.items as TPopulatedItem[];

  const event: TCapiEvent = {
    event_name: eventName,
    event_time: Math.floor(eventTime.getTime() / 1000),
    event_id: eventId,
    action_source: "website",
    event_source_url: (
      order as never as { trackingData?: { eventSourceUrl?: string } }
    ).trackingData?.eventSourceUrl,
    user_data: buildUserDataFromOrder(order),
    custom_data: {
      currency: config.currency,
      value: calculateOrderValue(order),
      order_id: order.orderNumber,
      content_type: config.contentType,
      contents: items.map((item) => ({
        id: resolveContentId(item, config.contentIdSource),
        quantity: item.quantity,
        item_price: item.finalPrice,
      })),
      content_ids: items.map((item) =>
        resolveContentId(item, config.contentIdSource),
      ),
      num_items: items.reduce((sum, item) => sum + item.quantity, 0),
    },
  };

  return {
    data: [event],
    test_event_code: config.testEventCode || undefined,
  };
};

export const buildTriggerEventPayload = (args: {
  config: IMetaPixelConfig;
  eventName: string;
  eventId: string;
  eventTime: Date;
  userData: TCapiUserData;
  custom?: Record<string, unknown>;
  eventSourceUrl?: string;
}): TCapiPayload => {
  const {
    config,
    eventName,
    eventId,
    eventTime,
    userData,
    custom,
    eventSourceUrl,
  } = args;

  return {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(eventTime.getTime() / 1000),
        event_id: eventId,
        action_source: "website",
        event_source_url: eventSourceUrl,
        user_data: userData,
        custom_data: { currency: config.currency, ...custom },
      },
    ],
    test_event_code: config.testEventCode || undefined,
  };
};
```

- [ ] **Step 3: Add the preview service function**

Append to `metaPixel.service.ts` (and add it to the exported object):

```ts
const previewPayload = async (input: {
  triggerKey?: string;
  statusRuleId?: string;
  sampleOrderId?: string;
}) => {
  const config = await getConfig();

  const order = input.sampleOrderId
    ? await Order.findById(input.sampleOrderId).populate("items.productId")
    : await Order.findOne().sort({ createdAt: -1 }).populate("items.productId");

  if (input.statusRuleId) {
    const rule = config.statusRules.find(
      (r) => String(r._id) === input.statusRuleId,
    );

    if (!rule) {
      throw new AppError(httpStatus.NOT_FOUND, "Status rule not found");
    }

    if (!order) {
      throw new AppError(
        httpStatus.NOT_FOUND,
        "No order exists yet to preview this rule against",
      );
    }

    return buildOrderEventPayload({
      order: order.toObject() as never,
      config,
      eventName: rule.eventName,
      eventId: `${order._id}:${rule.eventName}`,
      eventTime: new Date(),
    });
  }

  const trigger = config.triggers.find((t) => t.key === input.triggerKey);

  if (!trigger) {
    throw new AppError(httpStatus.NOT_FOUND, "Trigger not found");
  }

  if (trigger.key === "checkout_success" && order) {
    return buildOrderEventPayload({
      order: order.toObject() as never,
      config,
      eventName: trigger.eventName,
      eventId: `${order._id}:${trigger.eventName}`,
      eventTime: new Date(),
    });
  }

  return buildTriggerEventPayload({
    config,
    eventName: trigger.eventName,
    eventId: "sample-event-id",
    eventTime: new Date(),
    userData: {
      client_ip_address: "203.0.113.7",
      client_user_agent: "Mozilla/5.0 (sample)",
      fbp: "fb.1.1757370000000.1234567890",
    },
    custom: { content_type: config.contentType },
    eventSourceUrl: "https://example.com/sample",
  });
};
```

Add the imports at the top of the service:

```ts
import Order from "../order/order.model";
import {
  buildOrderEventPayload,
  buildTriggerEventPayload,
} from "./metaPixel.payload";
```

Check the actual export style of the order model before writing the import — if it is a named export, adjust.

- [ ] **Step 4: Add the validation schema, controller and route**

In `metaPixel.validation.ts`:

```ts
const PreviewPayloadSchema = z
  .object({
    triggerKey: z.enum(TRIGGER_KEYS as [string, ...string[]]).optional(),
    statusRuleId: z.string().trim().optional(),
    sampleOrderId: z.string().trim().optional(),
  })
  .refine((v) => !!v.triggerKey !== !!v.statusRuleId, {
    message: "Provide exactly one of triggerKey or statusRuleId",
  });
```

Export it alongside `UpdateConfigSchema`. Add the controller:

```ts
const previewPayload = catchAsync(async (req: Request, res: Response) => {
  const result = await MetaPixelService.previewPayload(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payload preview generated successfully",
    data: result,
  });
});
```

Add the route:

```ts
router.post(
  "/preview-payload",
  validateAuth(),
  checkPermission(EAppModules.marketing, "can_read_marketing"),
  validateRequest(MetaPixelValidation.PreviewPayloadSchema),
  MetaPixelController.previewPayload,
);
```

- [ ] **Step 5: Verify the preview endpoint returns a correctly shaped payload**

```bash
cd /e/itdaily/it-daily-backend && npx tsc --noEmit && npm run dev
```

```bash
curl -s -X POST -H "Authorization: <MASTER_ADMIN_TOKEN>" -H "Content-Type: application/json" \
  -d '{"triggerKey":"product_view"}' localhost:5000/api/v1/meta-pixel/preview-payload
```

Expected: JSON containing `data[0].event_name` `"ViewContent"`, `action_source: "website"`, `custom_data.currency: "BDT"`, and an integer `event_time` in seconds (10 digits, not 13).

```bash
curl -s -X POST -H "Authorization: <MASTER_ADMIN_TOKEN>" -H "Content-Type: application/json" \
  -d '{"triggerKey":"product_view","statusRuleId":"abc"}' localhost:5000/api/v1/meta-pixel/preview-payload
```

Expected: 400 `Provide exactly one of triggerKey or statusRuleId`.

- [ ] **Step 6: Commit**

```bash
cd /e/itdaily/it-daily-backend && git add src/app/modules/metaPixel && git commit -m "feat(metaPixel): add event log model, payload builder and preview endpoint"
```

---

## Task 5: Sender, queue, and test connection

**Repo:** BE

**Files:**

- Create: `src/app/modules/metaPixel/metaPixel.sender.ts`
- Create: `src/app/modules/metaPixel/metaPixel.queue.ts`
- Modify: `src/app/interface/common.ts`
- Modify: `src/app/modules/metaPixel/metaPixel.service.ts`
- Modify: `src/app/modules/metaPixel/metaPixel.controller.ts`
- Modify: `src/app/modules/metaPixel/metaPixel.route.ts`
- Modify: `src/server.ts`

**Interfaces:**

- Consumes: `GRAPH_API_VERSION`, `getConfig()`, `TCapiPayload`, `MetaPixelEventLog`.
- Produces:
  - `sendToMeta(args: { pixelId, accessToken, payload }): Promise<TSendResult>` where `TSendResult = { ok: boolean; httpStatus?: number; body?: Record<string, unknown>; fbtraceId?: string; retryable: boolean; errorMessage?: string }`
  - `metaPixelQueue` and `enqueueMetaEvent(job: TMetaEventJob)` where `TMetaEventJob = { logId: string; orderId?: string; eventName: string; eventId: string }`
  - `MetaPixelService.testConnection()`
  - Route `POST /meta-pixel/test-connection`
  - `RedisKeys.metaPixelEvents`

- [ ] **Step 1: Add the Redis key**

In `src/app/interface/common.ts`, add to `RedisKeys`:

```ts
  metaPixelEvents = "metaPixelEvents",
```

- [ ] **Step 2: Write the sender**

Create `src/app/modules/metaPixel/metaPixel.sender.ts`:

```ts
import axios from "axios";
import { GRAPH_API_VERSION } from "./metaPixel.constants";
import { TCapiPayload } from "./metaPixel.payload";

export type TSendResult = {
  ok: boolean;
  httpStatus?: number;
  body?: Record<string, unknown>;
  fbtraceId?: string;
  retryable: boolean;
  errorMessage?: string;
};

export const sendToMeta = async (args: {
  pixelId: string;
  accessToken: string;
  payload: TCapiPayload;
}): Promise<TSendResult> => {
  const { pixelId, accessToken, payload } = args;

  try {
    const res = await axios.post(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`,
      { ...payload, access_token: accessToken },
      { timeout: 15000 },
    );

    return {
      ok: true,
      httpStatus: res.status,
      body: res.data,
      fbtraceId: res.data?.fbtrace_id,
      retryable: false,
    };
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status;
      const body = err.response?.data;

      // 4xx other than 429 means the request itself is wrong — a retry sends
      // the identical bad request, so treat it as terminal.
      const retryable = !status || status === 429 || status >= 500;

      return {
        ok: false,
        httpStatus: status,
        body,
        fbtraceId: body?.error?.fbtrace_id,
        retryable,
        errorMessage: body?.error?.message ?? err.message,
      };
    }

    return {
      ok: false,
      retryable: true,
      errorMessage: err instanceof Error ? err.message : "Unknown send error",
    };
  }
};
```

- [ ] **Step 3: Write the queue and worker**

Create `src/app/modules/metaPixel/metaPixel.queue.ts`:

```ts
import { Queue, UnrecoverableError, Worker } from "bullmq";
import { Types } from "mongoose";
import { RedisKeys } from "../../interface/common";
import Order from "../order/order.model";
import MetaPixelEventLog from "./metaPixelEventLog.model";
import { MetaPixelService } from "./metaPixel.service";
import { sendToMeta } from "./metaPixel.sender";
import { TSentEventStatus } from "./metaPixel.interface";

const redisConnection = {
  connection: {
    url: process.env.REDIS_URL,
  },
};

export type TMetaEventJob = {
  logId: string;
  orderId?: string;
  eventName: string;
  eventId: string;
};

export const metaPixelQueue = new Queue(
  RedisKeys.metaPixelEvents,
  redisConnection,
);

const updateLedger = async (
  orderId: string | undefined,
  eventName: string,
  patch: Partial<{
    status: TSentEventStatus;
    attempts: number;
    sentAt: Date;
    fbtraceId: string;
    errorMessage: string;
  }>,
) => {
  if (!orderId) {
    return;
  }

  const set = Object.entries(patch).reduce(
    (acc, [key, value]) => ({
      ...acc,
      [`trackingData.sentEvents.$[entry].${key}`]: value,
    }),
    {},
  );

  await Order.updateOne(
    { _id: new Types.ObjectId(orderId) },
    { $set: set },
    { arrayFilters: [{ "entry.eventName": eventName }] },
  );
};

export const enqueueMetaEvent = async (job: TMetaEventJob) => {
  try {
    await metaPixelQueue.add(RedisKeys.metaPixelEvents, job, {
      attempts: 5,
      backoff: { type: "exponential", delay: 60000 },
      removeOnComplete: 1000,
      removeOnFail: 1000,
    });
  } catch (err) {
    // Redis being unreachable must never bubble into an admin's status update.
    await MetaPixelEventLog.findByIdAndUpdate(job.logId, {
      status: "dead",
      errorMessage: `Failed to enqueue: ${
        err instanceof Error ? err.message : "unknown"
      }`,
    });
    await updateLedger(job.orderId, job.eventName, {
      status: "dead",
      errorMessage: "Failed to enqueue",
    });
  }
};

const metaPixelWorker = new Worker(
  RedisKeys.metaPixelEvents,
  async (job) => {
    const { logId, orderId, eventName } = job.data as TMetaEventJob;

    const log = await MetaPixelEventLog.findById(logId);

    if (!log) {
      throw new UnrecoverableError(`Event log ${logId} no longer exists`);
    }

    const config = await MetaPixelService.getConfig();

    if (!config.pixelId || !config.accessToken) {
      throw new UnrecoverableError("Meta pixel credentials are not configured");
    }

    const attempts = (job.attemptsMade ?? 0) + 1;

    const result = await sendToMeta({
      pixelId: config.pixelId,
      accessToken: config.accessToken,
      payload: log.payload as never,
    });

    await MetaPixelEventLog.findByIdAndUpdate(logId, {
      status: result.ok ? "sent" : result.retryable ? "failed" : "dead",
      attempts,
      httpStatus: result.httpStatus,
      metaResponse: result.body,
      fbtraceId: result.fbtraceId,
      errorMessage: result.errorMessage,
    });

    await updateLedger(orderId, eventName, {
      status: result.ok ? "sent" : result.retryable ? "failed" : "dead",
      attempts,
      ...(result.ok ? { sentAt: new Date() } : {}),
      ...(result.fbtraceId ? { fbtraceId: result.fbtraceId } : {}),
      ...(result.errorMessage ? { errorMessage: result.errorMessage } : {}),
    });

    if (!result.ok) {
      if (!result.retryable) {
        throw new UnrecoverableError(
          result.errorMessage ?? "Meta rejected the event",
        );
      }

      throw new Error(result.errorMessage ?? "Meta send failed");
    }
  },
  redisConnection,
);

metaPixelWorker.on("failed", async (job, err) => {
  if (!job) {
    return;
  }

  const isFinalAttempt =
    err instanceof UnrecoverableError ||
    (job.attemptsMade ?? 0) >= (job.opts.attempts ?? 1);

  if (!isFinalAttempt) {
    return;
  }

  const { logId, orderId, eventName } = job.data as TMetaEventJob;

  await MetaPixelEventLog.findByIdAndUpdate(logId, {
    status: "dead",
    errorMessage: err.message,
  });
  await updateLedger(orderId, eventName, {
    status: "dead",
    errorMessage: err.message,
  });
});
```

- [ ] **Step 4: Import the queue at boot**

In `src/server.ts`, add alongside the existing queue imports:

```ts
import "./app/modules/metaPixel/metaPixel.queue";
```

The product and deal queues are imported for their `.add()` calls; this one only needs its worker registered, so a side-effect import is correct.

- [ ] **Step 5: Add the test connection service function**

Append to `metaPixel.service.ts`:

```ts
const testConnection = async () => {
  const doc = await getConfigDocument();

  if (!doc.pixelId || !doc.accessToken) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Save a pixel ID and access token before testing the connection",
    );
  }

  const config = await getConfig();
  const eventId = `test-connection:${Date.now()}`;

  const payload = buildTriggerEventPayload({
    config,
    eventName: "PageView",
    eventId,
    eventTime: new Date(),
    userData: {
      client_ip_address: "203.0.113.7",
      client_user_agent: "DailyIt-Admin-TestConnection/1.0",
    },
  });

  const log = await MetaPixelEventLog.create({
    eventName: "PageView",
    eventId,
    source: "test_connection",
    payload,
    status: "queued",
  });

  // Sent inline, not queued: the admin is waiting for this answer.
  const result = await sendToMeta({
    pixelId: config.pixelId as string,
    accessToken: config.accessToken as string,
    payload,
  });

  await MetaPixelEventLog.findByIdAndUpdate(log._id, {
    status: result.ok ? "sent" : "dead",
    attempts: 1,
    httpStatus: result.httpStatus,
    metaResponse: result.body,
    fbtraceId: result.fbtraceId,
    errorMessage: result.errorMessage,
  });

  if (result.ok) {
    doc.tokenVerifiedAt = new Date();
    await doc.save();
  }

  return {
    ok: result.ok,
    httpStatus: result.httpStatus,
    fbtraceId: result.fbtraceId,
    errorMessage: result.errorMessage,
    response: result.body,
    testEventCode: config.testEventCode || null,
    tokenVerifiedAt: doc.tokenVerifiedAt,
  };
};
```

Add the required imports (`MetaPixelEventLog`, `sendToMeta`) and export `testConnection` and `getConfig` from the service object.

- [ ] **Step 6: Add the controller and route**

Controller:

```ts
const testConnection = catchAsync(async (req: Request, res: Response) => {
  const result = await MetaPixelService.testConnection();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: result.ok
      ? "Test event accepted by Meta"
      : "Meta rejected the test event",
    data: result,
  });
});
```

Route:

```ts
router.post(
  "/test-connection",
  validateAuth(),
  checkPermission(EAppModules.marketing, "can_update_marketing"),
  MetaPixelController.testConnection,
);
```

- [ ] **Step 7: Verify the failure path with a deliberately wrong token**

```bash
cd /e/itdaily/it-daily-backend && npx tsc --noEmit && npm run dev
```

Save an obviously invalid token, then test:

```bash
curl -s -X PUT -H "Authorization: <MASTER_ADMIN_TOKEN>" -H "Content-Type: application/json" \
  -d '{"pixelId":"000000000000000","accessToken":"not-a-real-token"}' localhost:5000/api/v1/meta-pixel/config
curl -s -X POST -H "Authorization: <MASTER_ADMIN_TOKEN>" localhost:5000/api/v1/meta-pixel/test-connection
```

Expected: `ok: false`, an `errorMessage` from Meta about an invalid OAuth access token, and `tokenVerifiedAt` still absent. Then confirm CAPI is still refused:

```bash
curl -s -X PUT -H "Authorization: <MASTER_ADMIN_TOKEN>" -H "Content-Type: application/json" \
  -d '{"capiEnabled":true}' localhost:5000/api/v1/meta-pixel/config
```

Expected: 400.

- [ ] **Step 8: Verify the success path with real credentials**

Enter the real pixel ID, dataset ID, access token and a `test_event_code` copied from Events Manager → Test Events. Run test-connection again.

Expected: `ok: true` with `events_received: 1` in `response`, `tokenVerifiedAt` set, and the event visible in Events Manager Test Events within about 30 seconds. Then `capiEnabled: true` succeeds.

If real credentials are not available yet, stop here and record that Step 8 is unverified — do not mark the task complete.

- [ ] **Step 9: Commit**

```bash
cd /e/itdaily/it-daily-backend && git add src/app/modules/metaPixel src/app/interface/common.ts src/server.ts && git commit -m "feat(metaPixel): add CAPI sender, BullMQ queue and test connection"
```

---

## Task 6: Order identity snapshot at creation

**Repo:** BE, then FE

**Files:**

- Modify: `BE/src/app/modules/order/order.interface.ts`
- Modify: `BE/src/app/modules/order/order.model.ts`
- Modify: `BE/src/app/modules/order/order.service.ts`
- Modify: `BE/src/app/modules/order/order.validation.ts`
- Modify: `FE/src/actions/checkout.ts`

**Interfaces:**

- Consumes: `hashIdentity`, `buildFbc` (Task 2); `IOrderTrackingData` (Task 3).
- Produces: `order.trackingData` populated on every new order; `AddOrderPayload.tracking` accepted from the storefront.

The snapshot is written once at creation and never updated. It is what makes a Purchase fired days later matchable.

- [ ] **Step 1: Extend the order interface**

In `order.interface.ts`, import and add the field to `IOrder`:

```ts
import { IOrderTrackingData } from "../metaPixel/metaPixel.interface";
```

```ts
  trackingData?: IOrderTrackingData;
```

and add to `AddOrderPayload`:

```ts
  tracking?: {
    fbp?: string;
    fbclid?: string;
    eventSourceUrl?: string;
    eventId?: string;
  };
```

- [ ] **Step 2: Add the schema**

In `order.model.ts`, define and attach:

```ts
const sentEventSchema = new Schema(
  {
    eventName: { type: String, required: true },
    eventId: { type: String, required: true },
    status: {
      type: String,
      enum: ["queued", "sent", "failed", "dead"],
      default: "queued",
    },
    attempts: { type: Number, default: 0 },
    sentAt: { type: Date },
    fbtraceId: { type: String },
    errorMessage: { type: String },
  },
  { _id: false },
);

const trackingDataSchema = new Schema(
  {
    fbp: { type: String },
    fbc: { type: String },
    clientIp: { type: String },
    userAgent: { type: String },
    eventSourceUrl: { type: String },
    hashed: {
      em: { type: String },
      ph: { type: String },
      fn: { type: String },
      ln: { type: String },
      ct: { type: String },
      st: { type: String },
      zp: { type: String },
      country: { type: String },
      external_id: { type: String },
    },
    sentEvents: { type: [sentEventSchema], default: [] },
  },
  { _id: false },
);
```

Add `trackingData: { type: trackingDataSchema }` to the order schema.

- [ ] **Step 3: Allow the tracking block through validation**

In `order.validation.ts`, add to the create-order schema:

```ts
  tracking: z
    .object({
      fbp: z.string().trim().max(100).optional(),
      fbclid: z.string().trim().max(255).optional(),
      eventSourceUrl: z.string().trim().max(500).optional(),
      eventId: z.string().trim().max(100).optional(),
    })
    .optional(),
```

- [ ] **Step 4: Build the snapshot when the order is created**

In `order.service.ts`, inside the create-order flow (around the existing `currentStatus: "pending"` construction near line 129), build and attach the snapshot. The customer, shipping address and request are all already in scope there — confirm the exact variable names before writing this:

```ts
const buildTrackingSnapshot = (args: {
  tracking?: AddOrderPayload["tracking"];
  clientIp?: string;
  userAgent?: string;
  user: {
    _id: Types.ObjectId;
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
  };
  shippingAddress: IAddress;
}): IOrderTrackingData => {
  const { tracking, clientIp, userAgent, user, shippingAddress } = args;

  return {
    fbp: tracking?.fbp,
    fbc: tracking?.fbclid ? buildFbc(tracking.fbclid, Date.now()) : undefined,
    clientIp,
    userAgent,
    eventSourceUrl: tracking?.eventSourceUrl,
    hashed: {
      em: hashIdentity(user.email, "em"),
      ph: hashIdentity(user.phone ?? shippingAddress?.phone, "ph"),
      fn: hashIdentity(user.firstName ?? shippingAddress?.name, "fn"),
      ln: hashIdentity(user.lastName, "ln"),
      ct: hashIdentity(shippingAddress?.city, "ct"),
      st: hashIdentity(shippingAddress?.state, "st"),
      zp: hashIdentity(shippingAddress?.postalCode, "zp"),
      country: hashIdentity(shippingAddress?.country ?? "BD", "country"),
      external_id: hashIdentity(String(user._id), "external_id"),
    },
    sentEvents: [],
  };
};
```

Read `IAddress` in `address.interface.ts` first and use its real field names — `postalCode`, `state` and `name` are assumptions to be confirmed, and a wrong field name silently produces an unhashed value rather than an error.

Attach `trackingData: buildTrackingSnapshot({...})` to the created order document, passing `req.ip` and `req.headers["user-agent"]` down from the controller.

- [ ] **Step 5: Send the identifiers from the storefront**

In `FE/src/actions/checkout.ts`, read the Meta cookies server-side and attach them. `_fbp` and `_fbc` are first-party cookies set by the pixel:

```ts
"use server";

import { cookies, headers } from "next/headers";
import { instance } from "@/lib/axios";
import { AddOrderPayload } from "@/types/ordre.interface";

export const addOrder = async (data: AddOrderPayload) => {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();

    const res = await instance.post("/order/create", {
      ...data,
      tracking: {
        fbp: cookieStore.get("_fbp")?.value,
        fbclid: cookieStore.get("_fbc")?.value?.split(".").pop(),
        eventSourceUrl: headerStore.get("referer") ?? undefined,
        ...data.tracking,
      },
    });
    return res.data;
  } catch (err: any) {
    console.log(err);
    return {
      error: true,
      data: err.response?.data,
      message: err?.response?.data?.message,
    };
  }
};
```

The backend must read the real client IP rather than the proxy's. Confirm whether `app.set("trust proxy", 1)` is already set in `BE/src/app.ts`; if not, add it, or `req.ip` will record the load balancer on Railway and every event will carry the same useless address.

- [ ] **Step 6: Verify a new order carries a full snapshot**

Start BE and FE, place a test order through the storefront while logged in, then inspect it:

```bash
cd /e/itdaily/it-daily-backend && npx ts-node -e "
import mongoose from 'mongoose';
import config from './src/app/config';
import Order from './src/app/modules/order/order.model';
(async () => {
  await mongoose.connect(config.database_url as string);
  const order = await Order.findOne().sort({ createdAt: -1 }).lean();
  console.log(JSON.stringify((order as any)?.trackingData, null, 2));
  await mongoose.disconnect();
})();
"
```

Expected: `hashed.em`, `hashed.ph` and `hashed.external_id` are 64-character hex strings; `clientIp` and `userAgent` are populated; `sentEvents` is `[]`. `fbp` will be present only if the pixel has run in that browser — Task 10 enables that, so an empty `fbp` here is expected and not a failure.

Confirm no raw email or phone appears anywhere in `trackingData`.

- [ ] **Step 7: Commit both repos**

```bash
cd /e/itdaily/it-daily-backend && git add src/app/modules/order src/app.ts && git commit -m "feat(order): snapshot hashed identity and Meta identifiers at order creation"
cd /e/itdaily/it-daily-homepage && git checkout -b meta-pixel-capi-module && git add src/actions/checkout.ts && git commit -m "feat(checkout): forward Meta identifiers with order creation"
```

---

## Task 7: Status rule engine

**Repo:** BE

**Files:**

- Modify: `src/app/modules/metaPixel/metaPixel.service.ts`
- Modify: `src/app/modules/order/order.service.ts`

**Interfaces:**

- Consumes: `getConfig()`, `buildOrderEventPayload`, `hasUsableIdentity`, `MetaPixelEventLog`, `enqueueMetaEvent`.
- Produces: `MetaPixelService.onOrderStatusChanged(orderId: Types.ObjectId, newStatus: string): Promise<void>` — never throws, always safe to call detached.

- [ ] **Step 1: Write the engine**

Append to `metaPixel.service.ts`:

```ts
const onOrderStatusChanged = async (
  orderId: Types.ObjectId,
  newStatus: string,
): Promise<void> => {
  try {
    const config = await getConfig();

    if (!config.enabled || !config.capiEnabled) {
      return;
    }

    const rules = config.statusRules.filter(
      (rule) => rule.enabled && rule.status === newStatus,
    );

    if (!rules.length) {
      return;
    }

    const order = await Order.findById(orderId).populate("items.productId");

    if (!order) {
      return;
    }

    for (const rule of rules) {
      const already = order.trackingData?.sentEvents?.find(
        (entry) =>
          entry.eventName === rule.eventName && entry.status !== "dead",
      );

      // A status flipped away and back must not fire a second time.
      if (already) {
        continue;
      }

      const eventId = `${order._id}:${rule.eventName}`;
      const payload = buildOrderEventPayload({
        order: order.toObject() as never,
        config,
        eventName: rule.eventName,
        eventId,
        eventTime: new Date(),
      });

      const log = await MetaPixelEventLog.create({
        eventName: rule.eventName,
        eventId,
        source: "status_rule",
        orderId: order._id,
        payload,
        status: "queued",
      });

      // An order created before this feature existed has no identity data, so
      // Meta could never match the event. Record it instead of sending noise.
      if (!hasUsableIdentity(payload.data[0].user_data)) {
        await MetaPixelEventLog.findByIdAndUpdate(log._id, {
          status: "dead",
          errorMessage: "Order has no tracking data to match against",
        });
        continue;
      }

      await Order.updateOne(
        { _id: order._id },
        {
          $push: {
            "trackingData.sentEvents": {
              eventName: rule.eventName,
              eventId,
              status: "queued",
              attempts: 0,
            },
          },
        },
      );

      await enqueueMetaEvent({
        logId: String(log._id),
        orderId: String(order._id),
        eventName: rule.eventName,
        eventId,
      });
    }
  } catch (err) {
    // Tracking must never break an order status update.
    console.log("meta pixel status rule error", err);
  }
};
```

Note the import cycle: `metaPixel.queue.ts` imports the service, so the service must import `enqueueMetaEvent` lazily inside the function body to avoid a circular require:

```ts
const { enqueueMetaEvent } = await import("./metaPixel.queue");
```

Use that form rather than a top-level import.

- [ ] **Step 2: Call it from the order status update**

In `order.service.ts`, inside the block that already detects `statusChanged` (around lines 513-546), after the order is saved and the response object is built:

```ts
if (statusChanged && updateData.currentStatus) {
  void MetaPixelService.onOrderStatusChanged(
    order._id,
    String(updateData.currentStatus),
  );
}
```

`void` is deliberate — the caller must not await Meta.

- [ ] **Step 3: Verify exactly-once behaviour end to end**

With real credentials configured, `enabled: true`, `capiEnabled: true`, and the default `delivered → Purchase` rule:

```bash
curl -s -X PATCH -H "Authorization: <MASTER_ADMIN_TOKEN>" -H "Content-Type: application/json" \
  -d '{"currentStatus":"delivered"}' localhost:5000/api/v1/order/<ORDER_ID>
```

Confirm the exact order update route and method from `order.route.ts` first.

Expected: the response returns immediately; within a few seconds the event log has one `status: "sent"` row for `Purchase` with a `fbtraceId`, the order's `trackingData.sentEvents` has one entry, and Events Manager shows one Purchase.

- [ ] **Step 4: Verify a status flip does not double-send**

```bash
curl -s -X PATCH ... -d '{"currentStatus":"processing"}' localhost:5000/api/v1/order/<ORDER_ID>
curl -s -X PATCH ... -d '{"currentStatus":"delivered"}' localhost:5000/api/v1/order/<ORDER_ID>
```

Expected: still exactly one `Purchase` row in the log and one ledger entry. If a second appears, the ledger check is not matching — inspect `trackingData.sentEvents`.

- [ ] **Step 5: Verify an order with no tracking data is skipped, not sent**

Pick an order created before Task 6 (or unset `trackingData` on a test order), then mark it delivered.

Expected: one log row with `status: "dead"` and `errorMessage: "Order has no tracking data to match against"`, and nothing in Events Manager.

- [ ] **Step 6: Commit**

```bash
cd /e/itdaily/it-daily-backend && git add src/app/modules/metaPixel src/app/modules/order && git commit -m "feat(metaPixel): send CAPI events on order status changes"
```

---

## Task 8: Storefront ingress, log listing, and manual retry

**Repo:** BE

**Files:**

- Modify: `src/app/modules/metaPixel/metaPixel.service.ts`
- Modify: `src/app/modules/metaPixel/metaPixel.controller.ts`
- Modify: `src/app/modules/metaPixel/metaPixel.route.ts`
- Modify: `src/app/modules/metaPixel/metaPixel.validation.ts`

**Interfaces:**

- Consumes: everything from Tasks 3-7.
- Produces:
  - `MetaPixelService.ingestBrowserEvent(input, meta)` behind `POST /meta-pixel/events`
  - `MetaPixelService.getLogs(query)` behind `GET /meta-pixel/logs`
  - `MetaPixelService.retryLog(logId)` behind `POST /meta-pixel/logs/:id/retry`

- [ ] **Step 1: Add rate limiting for the public ingress**

Check whether `express-rate-limit` is already a dependency:

```bash
cd /e/itdaily/it-daily-backend && node -e "console.log(!!require('./package.json').dependencies['express-rate-limit'])"
```

If `false`, install it:

```bash
npm install express-rate-limit
```

- [ ] **Step 2: Write the ingress service function**

Append to `metaPixel.service.ts`:

```ts
const ingestBrowserEvent = async (
  input: {
    triggerKey: string;
    eventId: string;
    orderId?: string;
    custom?: Record<string, unknown>;
    eventSourceUrl?: string;
  },
  meta: { clientIp?: string; userAgent?: string },
) => {
  const config = await getConfig();

  if (!config.enabled || !config.capiEnabled) {
    return { accepted: false, reason: "tracking disabled" };
  }

  const trigger = config.triggers.find((t) => t.key === input.triggerKey);

  // Only a trigger the admin explicitly opted into may be sent server-side.
  if (!trigger?.enabled || !trigger.sendViaCapi || !trigger.eventName) {
    return { accepted: false, reason: "trigger not enabled for CAPI" };
  }

  if (isIpExcluded(meta.clientIp, config.excludedIps)) {
    return { accepted: false, reason: "excluded ip" };
  }

  if (config.blockBots && isBotUserAgent(meta.userAgent)) {
    return { accepted: false, reason: "bot user agent" };
  }

  const order = input.orderId
    ? await Order.findById(input.orderId).populate("items.productId")
    : null;

  if (input.orderId && !order) {
    return { accepted: false, reason: "unknown order" };
  }

  const payload = order
    ? buildOrderEventPayload({
        order: order.toObject() as never,
        config,
        eventName: trigger.eventName,
        eventId: input.eventId,
        eventTime: new Date(),
      })
    : buildTriggerEventPayload({
        config,
        eventName: trigger.eventName,
        eventId: input.eventId,
        eventTime: new Date(),
        userData: {
          client_ip_address: meta.clientIp,
          client_user_agent: meta.userAgent,
        },
        custom: input.custom,
        eventSourceUrl: input.eventSourceUrl,
      });

  const log = await MetaPixelEventLog.create({
    eventName: trigger.eventName,
    eventId: input.eventId,
    source: "browser_backup",
    orderId: order?._id,
    triggerKey: trigger.key,
    payload,
    status: "queued",
  });

  const { enqueueMetaEvent } = await import("./metaPixel.queue");

  await enqueueMetaEvent({
    logId: String(log._id),
    orderId: order ? String(order._id) : undefined,
    eventName: trigger.eventName,
    eventId: input.eventId,
  });

  return { accepted: true };
};
```

- [ ] **Step 3: Write the log listing and retry functions**

```ts
const getLogs = async (query: {
  page?: string;
  limit?: string;
  status?: string;
  eventName?: string;
  source?: string;
  from?: string;
  to?: string;
}) => {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 20), 1), 100);

  const filter: Record<string, unknown> = {};

  if (query.status) filter.status = query.status;
  if (query.eventName) filter.eventName = query.eventName;
  if (query.source) filter.source = query.source;

  if (query.from || query.to) {
    filter.createdAt = {
      ...(query.from ? { $gte: new Date(query.from) } : {}),
      ...(query.to ? { $lte: new Date(query.to) } : {}),
    };
  }

  const [data, total] = await Promise.all([
    MetaPixelEventLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("orderId", "orderNumber")
      .lean(),
    MetaPixelEventLog.countDocuments(filter),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPage: Math.ceil(total / limit) },
  };
};

const retryLog = async (logId: string) => {
  const log = await MetaPixelEventLog.findById(logId);

  if (!log) {
    throw new AppError(httpStatus.NOT_FOUND, "Event log not found");
  }

  if (log.status === "sent") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This event was already accepted by Meta",
    );
  }

  await MetaPixelEventLog.findByIdAndUpdate(logId, {
    status: "queued",
    errorMessage: undefined,
  });

  if (log.orderId) {
    await Order.updateOne(
      { _id: log.orderId },
      { $set: { "trackingData.sentEvents.$[entry].status": "queued" } },
      { arrayFilters: [{ "entry.eventName": log.eventName }] },
    );
  }

  const { enqueueMetaEvent } = await import("./metaPixel.queue");

  await enqueueMetaEvent({
    logId: String(log._id),
    orderId: log.orderId ? String(log.orderId) : undefined,
    eventName: log.eventName,
    eventId: log.eventId,
  });

  return { queued: true };
};
```

- [ ] **Step 4: Add validation, controllers and routes**

Validation:

```ts
const IngestEventSchema = z.object({
  triggerKey: z.enum(TRIGGER_KEYS as [string, ...string[]]),
  eventId: z.string().trim().min(1).max(100),
  orderId: z.string().trim().optional(),
  eventSourceUrl: z.string().trim().max(500).optional(),
  custom: z.record(z.unknown()).optional(),
});
```

Route, with the limiter applied only to the public endpoint:

```ts
import rateLimit from "express-rate-limit";

const ingressLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

router.post(
  "/events",
  ingressLimiter,
  validateRequest(MetaPixelValidation.IngestEventSchema),
  MetaPixelController.ingestEvent,
);

router.get(
  "/logs",
  validateAuth(),
  checkPermission(EAppModules.marketing, "can_read_meta_pixel_logs"),
  MetaPixelController.getLogs,
);

router.post(
  "/logs/:id/retry",
  validateAuth(),
  checkPermission(EAppModules.marketing, "can_retry_meta_pixel_event"),
  MetaPixelController.retryLog,
);
```

The `getLogs` controller must pass the pagination through `sendResponse`'s `pagination` field.

- [ ] **Step 5: Verify the ingress rejects what it should**

```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"triggerKey":"cart_view","eventId":"e1"}' localhost:5000/api/v1/meta-pixel/events
```

Expected: `accepted: false`, reason `trigger not enabled for CAPI` — `cart_view` ships disabled.

```bash
curl -s -X POST -H "Content-Type: application/json" \
  -d '{"triggerKey":"not_a_key","eventId":"e1"}' localhost:5000/api/v1/meta-pixel/events
```

Expected: 400 from zod.

```bash
for i in $(seq 1 70); do curl -s -o /dev/null -w "%{http_code} " -X POST -H "Content-Type: application/json" -d '{"triggerKey":"add_to_cart","eventId":"e'"$i"'"}' localhost:5000/api/v1/meta-pixel/events; done; echo
```

Expected: 200s followed by 429s once the 60-per-minute limit is crossed.

- [ ] **Step 6: Verify listing and retry**

```bash
curl -s -H "Authorization: <MASTER_ADMIN_TOKEN>" "localhost:5000/api/v1/meta-pixel/logs?limit=5&status=dead"
curl -s -X POST -H "Authorization: <MASTER_ADMIN_TOKEN>" localhost:5000/api/v1/meta-pixel/logs/<DEAD_LOG_ID>/retry
```

Expected: the list returns only `dead` rows with pagination; the retry returns `queued: true`, and the row moves to `sent` or back to `dead` within a minute. Retrying a `sent` row returns 400.

- [ ] **Step 7: Commit**

```bash
cd /e/itdaily/it-daily-backend && git add src/app/modules/metaPixel package.json package-lock.json && git commit -m "feat(metaPixel): add browser ingress, event log listing and manual retry"
```

---

## Task 9: Admin API slice, sidebar entry, and page shell

**Repo:** AD

**Files:**

- Create: `src/interface/metaPixel.interface.ts`
- Create: `src/redux/api/metaPixelApi.ts`
- Create: `src/app/(mainLayout)/marketing/meta-pixel/page.tsx`
- Modify: `src/redux/api/tagTypes.ts`
- Modify: `src/components/shared/sidebarMenus.ts`

**Interfaces:**

- Consumes: the BE endpoints from Tasks 3-8; `useCan` from `src/lib/permissions`.
- Produces:
  - `TMetaPixelConfig`, `TMetaPixelTrigger`, `TMetaPixelStatusRule`, `TMetaPixelLog`, `TRIGGER_LABELS`
  - `useGetMetaPixelConfigQuery`, `useUpdateMetaPixelConfigMutation`, `useTestMetaPixelConnectionMutation`, `usePreviewMetaPixelPayloadMutation`, `useGetMetaPixelLogsQuery`, `useRetryMetaPixelEventMutation`
  - The `/marketing/meta-pixel` route with four tabs, each rendered by a component from Tasks 10-12

- [ ] **Step 1: Add the cache tags**

In `src/redux/api/tagTypes.ts`, add to both the enum and `tagTypesList`:

```ts
  metaPixel = "metaPixel",
  metaPixelLogs = "metaPixelLogs",
```

- [ ] **Step 2: Write the interface file**

Create `src/interface/metaPixel.interface.ts`:

```ts
export type TContentIdSource = "sku" | "_id" | "slug";

export type TSentEventStatus = "queued" | "sent" | "failed" | "dead";

export type TMetaPixelTrigger = {
  key: string;
  eventName: string;
  isCustomEvent: boolean;
  enabled: boolean;
  sendViaBrowser: boolean;
  sendViaCapi: boolean;
};

export type TMetaPixelStatusRule = {
  _id?: string;
  status: string;
  eventName: string;
  isCustomEvent: boolean;
  enabled: boolean;
};

export type TMetaPixelConfig = {
  _id: string;
  pixelId?: string;
  datasetId?: string;
  testEventCode?: string;
  hasToken: boolean;
  tokenLast4?: string;
  tokenVerifiedAt?: string;
  enabled: boolean;
  capiEnabled: boolean;
  currency: string;
  contentIdSource: TContentIdSource;
  contentType: string;
  excludedIps: string[];
  blockBots: boolean;
  triggers: TMetaPixelTrigger[];
  statusRules: TMetaPixelStatusRule[];
  updatedAt: string;
};

export type TMetaPixelLog = {
  _id: string;
  eventName: string;
  eventId: string;
  source: "browser_backup" | "status_rule" | "manual" | "test_connection";
  orderId?: { _id: string; orderNumber: string };
  triggerKey?: string;
  payload: Record<string, unknown>;
  status: TSentEventStatus;
  attempts: number;
  httpStatus?: number;
  metaResponse?: Record<string, unknown>;
  fbtraceId?: string;
  errorMessage?: string;
  createdAt: string;
};

export type TTestConnectionResult = {
  ok: boolean;
  httpStatus?: number;
  fbtraceId?: string;
  errorMessage?: string;
  response?: Record<string, unknown>;
  testEventCode: string | null;
  tokenVerifiedAt?: string;
};

// Mirrors BE metaPixel.constants.ts. Labels live here so the admin table reads
// well without a round trip; the keys must match the backend registry exactly.
export const TRIGGER_LABELS: Record<
  string,
  { label: string; description: string; backendVisible: boolean }
> = {
  page_view: {
    label: "Any page view",
    description: "Fires on every storefront route change.",
    backendVisible: false,
  },
  product_view: {
    label: "Product detail page",
    description: "A customer opens a single product page.",
    backendVisible: false,
  },
  category_view: {
    label: "Category listing page",
    description: "A customer opens a category or brand listing.",
    backendVisible: false,
  },
  search: {
    label: "Search performed",
    description: "A customer submits a search query.",
    backendVisible: false,
  },
  add_to_cart: {
    label: "Add to cart",
    description: "A product is added to the cart.",
    backendVisible: true,
  },
  cart_view: {
    label: "Cart page",
    description: "A customer opens the cart page.",
    backendVisible: false,
  },
  wishlist_add: {
    label: "Add to wishlist",
    description: "A product is saved to the wishlist.",
    backendVisible: false,
  },
  compare_add: {
    label: "Add to compare",
    description: "A product is added to the compare list.",
    backendVisible: false,
  },
  checkout_start: {
    label: "Checkout started",
    description: "A customer reaches the checkout page.",
    backendVisible: true,
  },
  checkout_success: {
    label: "Order placed",
    description: "An order is created successfully.",
    backendVisible: true,
  },
  signup: {
    label: "Account created",
    description: "A customer completes registration.",
    backendVisible: true,
  },
  login: {
    label: "Login",
    description: "A customer signs in.",
    backendVisible: true,
  },
  pc_builder_save: {
    label: "PC build saved",
    description: "A customer saves a PC build.",
    backendVisible: true,
  },
  contact_submit: {
    label: "Contact form submitted",
    description: "A customer submits a contact or enquiry form.",
    backendVisible: true,
  },
};

export const META_STANDARD_EVENTS = [
  "AddPaymentInfo",
  "AddToCart",
  "AddToWishlist",
  "CompleteRegistration",
  "Contact",
  "CustomizeProduct",
  "Donate",
  "FindLocation",
  "InitiateCheckout",
  "Lead",
  "PageView",
  "Purchase",
  "Schedule",
  "Search",
  "StartTrial",
  "SubmitApplication",
  "Subscribe",
  "ViewContent",
];

export const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
];
```

- [ ] **Step 3: Write the API slice**

Create `src/redux/api/metaPixelApi.ts`:

```ts
import {
  TMetaPixelConfig,
  TMetaPixelLog,
  TTestConnectionResult,
} from "@/interface/metaPixel.interface";
import { baseApi } from "./baseApi";
import { tagTypes } from "./tagTypes";

const metaPixelApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getMetaPixelConfig: build.query<{ data: TMetaPixelConfig }, undefined>({
      query: () => ({ url: "/meta-pixel/config", method: "GET" }),
      providesTags: [tagTypes.metaPixel],
    }),
    updateMetaPixelConfig: build.mutation<
      { data: TMetaPixelConfig; message: string },
      Record<string, unknown>
    >({
      query: (data) => ({ url: "/meta-pixel/config", method: "PUT", data }),
      invalidatesTags: (result) => (result ? [tagTypes.metaPixel] : []),
    }),
    testMetaPixelConnection: build.mutation<
      { data: TTestConnectionResult; message: string },
      void
    >({
      query: () => ({ url: "/meta-pixel/test-connection", method: "POST" }),
      invalidatesTags: (result) =>
        result ? [tagTypes.metaPixel, tagTypes.metaPixelLogs] : [],
    }),
    previewMetaPixelPayload: build.mutation<
      { data: Record<string, unknown> },
      { triggerKey?: string; statusRuleId?: string; sampleOrderId?: string }
    >({
      query: (data) => ({
        url: "/meta-pixel/preview-payload",
        method: "POST",
        data,
      }),
    }),
    getMetaPixelLogs: build.query<
      {
        data: TMetaPixelLog[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPage: number;
        };
      },
      Record<string, string | number | undefined>
    >({
      query: (params) => ({
        url: "/meta-pixel/logs",
        method: "GET",
        params,
      }),
      providesTags: [tagTypes.metaPixelLogs],
    }),
    retryMetaPixelEvent: build.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/meta-pixel/logs/${id}/retry`,
        method: "POST",
      }),
      invalidatesTags: (result) => (result ? [tagTypes.metaPixelLogs] : []),
    }),
  }),
});

export const {
  useGetMetaPixelConfigQuery,
  useUpdateMetaPixelConfigMutation,
  useTestMetaPixelConnectionMutation,
  usePreviewMetaPixelPayloadMutation,
  useGetMetaPixelLogsQuery,
  useRetryMetaPixelEventMutation,
} = metaPixelApi;
```

Confirm `axiosBaseQuery` forwards a `params` key. If it does not, add it there — `getMetaPixelLogs` depends on query params reaching axios.

- [ ] **Step 4: Add the sidebar group**

In `src/components/shared/sidebarMenus.ts`, import an icon and append a group after `Storefront`:

```ts
  {
    label: "Marketing",
    items: [
      {
        title: "Meta Pixel",
        link: "/marketing/meta-pixel",
        icon: Radar,
        permission: "can_see_meta_pixel_page",
      },
    ],
  },
```

Add `Radar` to the `lucide-react` import list.

- [ ] **Step 5: Write the page shell with placeholder tab bodies**

Create `src/app/(mainLayout)/marketing/meta-pixel/page.tsx`:

```tsx
"use client";

import PageHeader from "@/components/common/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetMetaPixelConfigQuery } from "@/redux/api/metaPixelApi";
import { globalError } from "@/lib/utils";
import Link from "next/link";
import { ScrollText } from "lucide-react";

const MetaPixelPage = () => {
  const { data, isLoading, error } = useGetMetaPixelConfigQuery(undefined);

  if (!isLoading && error) globalError(error);

  const config = data?.data;

  return (
    <div>
      <PageHeader
        title="Meta Pixel"
        subtitle="Configure the Meta Pixel and Conversions API for the storefront"
        buttons={
          <>
            <Badge variant={config?.enabled ? "default" : "secondary"}>
              {config?.enabled ? "Tracking on" : "Tracking off"}
            </Badge>
            <Badge variant={config?.capiEnabled ? "default" : "secondary"}>
              {config?.capiEnabled ? "CAPI verified" : "CAPI not set up"}
            </Badge>
            <Button variant="outline" asChild>
              <Link href="/marketing/meta-pixel/logs">
                <ScrollText size={16} />
                Event log
              </Link>
            </Button>
          </>
        }
      />

      <Tabs defaultValue="setup">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="rules">Order status rules</TabsTrigger>
          <TabsTrigger value="hygiene">Hygiene</TabsTrigger>
        </TabsList>

        <TabsContent value="setup">Setup tab</TabsContent>
        <TabsContent value="events">Events tab</TabsContent>
        <TabsContent value="rules">Order status rules tab</TabsContent>
        <TabsContent value="hygiene">Hygiene tab</TabsContent>
      </Tabs>
    </div>
  );
};

export default MetaPixelPage;
```

Confirm `src/components/ui/tabs.tsx` and `badge.tsx` exist; add them with `npx shadcn@latest add tabs badge` if not.

- [ ] **Step 6: Verify the page renders and the sidebar gates correctly**

```bash
cd /e/itdaily/id-daily-admin && npx tsc --noEmit && npm run dev
```

Open `http://localhost:7000/marketing/meta-pixel` as the master admin.

Expected: the page loads, both badges read the "off"/"not set up" state, four tabs switch, and the sidebar shows Marketing → Meta Pixel. Sign in as a role without `can_see_meta_pixel_page` and confirm the sidebar item is hidden.

- [ ] **Step 7: Commit**

```bash
cd /e/itdaily/id-daily-admin && git add src/interface/metaPixel.interface.ts src/redux/api src/app/\(mainLayout\)/marketing src/components/shared/sidebarMenus.ts && git commit -m "feat(marketing): add Meta pixel api slice, sidebar entry and page shell"
```

---

## Task 10: Setup and Hygiene tabs

**Repo:** AD

**Files:**

- Create: `src/components/marketing/MetaPixelSetupTab.tsx`
- Create: `src/components/marketing/MetaPixelHygieneTab.tsx`
- Modify: `src/app/(mainLayout)/marketing/meta-pixel/page.tsx`

**Interfaces:**

- Consumes: `useGetMetaPixelConfigQuery`, `useUpdateMetaPixelConfigMutation`, `useTestMetaPixelConnectionMutation`, `useCan`.
- Produces: `<MetaPixelSetupTab config={config} />` and `<MetaPixelHygieneTab config={config} />`, both taking `config: TMetaPixelConfig`.

- [ ] **Step 1: Write the Setup tab**

Create `src/components/marketing/MetaPixelSetupTab.tsx`. Requirements, all of which the verification step checks:

- react-hook-form + zod for `pixelId`, `datasetId`, `accessToken`, `testEventCode`, `currency`, `contentIdSource`.
- The token input is `type="password"`, `placeholder` shows `••••••${config.tokenLast4}` when `config.hasToken`, and it submits **only when non-empty** — an untouched field must be omitted from the payload so the stored token survives a save. A "Remove token" button submits `accessToken: ""`.
- A **Test connection** button calling `testMetaPixelConnection()`, rendering the returned `ok`, `fbtraceId` and `errorMessage` inline in a bordered result box that persists until the next test.
- A `capiEnabled` switch, `disabled` unless `config.tokenVerifiedAt` is set, with a tooltip explaining why.
- A one-line callout under `contentIdSource`: "This must match the item IDs in your Meta product catalog feed, or dynamic and retargeting ads will not match."
- Everything read-only when `!can("can_update_marketing")`.
- `globalError(err)` in every catch, `toast.success(res.message)` on success.

```tsx
const schema = z.object({
  pixelId: z.string().trim().max(50),
  datasetId: z.string().trim().max(50),
  accessToken: z.string().trim(),
  testEventCode: z.string().trim().max(50),
  currency: z.string().trim().length(3),
  contentIdSource: z.enum(["sku", "_id", "slug"]),
});

const onSubmit = async (values: z.infer<typeof schema>) => {
  try {
    const payload: Record<string, unknown> = { ...values };

    // An empty field means "leave the stored token alone", not "clear it".
    if (!values.accessToken) delete payload.accessToken;

    const res = await updateConfig(payload).unwrap();
    toast.success(res.message);
  } catch (err) {
    globalError(err);
  }
};
```

- [ ] **Step 2: Write the Hygiene tab**

Create `src/components/marketing/MetaPixelHygieneTab.tsx`:

- The `enabled` master switch, wrapped in `DeleteModal` from `src/components/global/DeleteModal.tsx` used as a generic confirm when switching **off**, with the warning "All Meta Pixel and Conversions API events will stop immediately. Your event mapping and status rules are kept."
- `excludedIps` as an add/remove list of text inputs validated against the same IPv4/CIDR regex the backend uses, with the helper text "Traffic from these addresses fires no events at all."
- The `blockBots` switch.

- [ ] **Step 3: Wire both tabs into the page**

Replace the two placeholder `TabsContent` bodies, guarding on `config` being loaded:

```tsx
<TabsContent value="setup">
  {config && <MetaPixelSetupTab config={config} />}
</TabsContent>
```

- [ ] **Step 4: Verify the token is never leaked or accidentally cleared**

```bash
cd /e/itdaily/id-daily-admin && npx tsc --noEmit && npm run dev
```

1. Enter a pixel ID and a token, save. Expected: success toast; reload shows the masked placeholder and no plaintext token anywhere. Open DevTools → Network → the `config` GET response and confirm there is no `accessToken` field.
2. Change only `testEventCode` and save. Expected: reload still shows `hasToken: true` and the same `tokenLast4` — the token was not wiped.
3. Click **Test connection** with a bad token. Expected: the result box shows `ok: false` and Meta's error message; the CAPI switch stays disabled.
4. Enter real credentials, test again. Expected: `ok: true`, the CAPI switch becomes enabled, and toggling it on saves without a 400.
5. Toggle the master switch off. Expected: a confirmation dialog appears first.

- [ ] **Step 5: Commit**

```bash
cd /e/itdaily/id-daily-admin && git add src/components/marketing src/app/\(mainLayout\)/marketing && git commit -m "feat(marketing): add Meta pixel setup and hygiene tabs"
```

---

## Task 11: Events tab and payload preview

**Repo:** AD

**Files:**

- Create: `src/components/marketing/MetaPixelEventsTab.tsx`
- Create: `src/components/marketing/PayloadPreviewModal.tsx`
- Modify: `src/app/(mainLayout)/marketing/meta-pixel/page.tsx`

**Interfaces:**

- Consumes: `TRIGGER_LABELS`, `META_STANDARD_EVENTS`, `useUpdateMetaPixelConfigMutation`, `usePreviewMetaPixelPayloadMutation`.
- Produces: `<MetaPixelEventsTab config={config} />`; `<PayloadPreviewModal open onOpenChange triggerKey? statusRuleId? />` reused by Task 12.

- [ ] **Step 1: Write the preview modal**

Create `src/components/marketing/PayloadPreviewModal.tsx` — wraps `custom/Modal`, calls `previewMetaPixelPayload` when opened, and renders the JSON in a `<pre className="max-h-96 overflow-auto rounded bg-muted p-3 text-xs">`. Show a one-line explanation above it: "This is exactly what would be sent to Meta. Nothing was sent."

- [ ] **Step 2: Write the Events tab**

Create `src/components/marketing/MetaPixelEventsTab.tsx`. One row per `config.triggers` entry, ordered by the registry:

| Column     | Content                                                                                                                                            |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trigger    | `TRIGGER_LABELS[key].label` with the description beneath in muted text                                                                             |
| Meta event | A `Select` of `META_STANDARD_EVENTS` plus a `Custom…` option; choosing `Custom…` reveals an `Input` and sets `isCustomEvent: true`                 |
| Enabled    | `Switch`                                                                                                                                           |
| Browser    | `Switch`, bound to `sendViaBrowser`                                                                                                                |
| CAPI       | `Switch`, bound to `sendViaCapi`, `disabled` when `!TRIGGER_LABELS[key].backendVisible \|\| !config.capiEnabled`, with a tooltip giving the reason |
| —          | A **Preview** button opening `PayloadPreviewModal` for that key                                                                                    |

State is local until a single **Save events** button submits `{ triggers: [...] }`. Disable Save while `isLoading`. An enabled row with an empty event name blocks the save with an inline field error rather than a toast.

Read-only when `!can("can_update_marketing")`.

- [ ] **Step 3: Verify the tab's guard rails**

Reload `/marketing/meta-pixel` → Events.

1. Expected: 14 rows; `cart_view`, `compare_add`, `checkout_success` and `login` are disabled with empty event names; the rest match the registry defaults.
2. The CAPI switch is disabled on `page_view`, `product_view`, `category_view`, `search`, `wishlist_add`, `compare_add` and `cart_view` regardless of config, with a tooltip.
3. With `capiEnabled: false`, every CAPI switch is disabled.
4. Enable a row but clear its event name and save. Expected: an inline validation error, no request sent.
5. Pick `Custom…` on `pc_builder_save`, type `PcBuildSaved`, save, reload. Expected: the value persists with `isCustomEvent: true`.
6. Click Preview on `product_view`. Expected: a modal with `event_name: "ViewContent"` and a 10-digit `event_time`.
7. Type a lowercase `purchase` as a _standard_ event. Expected: the backend rejects it with "Unknown standard event. Mark it as a custom event to use this name."

- [ ] **Step 4: Commit**

```bash
cd /e/itdaily/id-daily-admin && git add src/components/marketing src/app/\(mainLayout\)/marketing && git commit -m "feat(marketing): add Meta pixel events tab with payload preview"
```

---

## Task 12: Order status rules tab

**Repo:** AD

**Files:**

- Create: `src/components/marketing/MetaPixelStatusRulesTab.tsx`
- Create: `src/components/marketing/MetaPixelStatusRuleModal.tsx`
- Modify: `src/app/(mainLayout)/marketing/meta-pixel/page.tsx`

**Interfaces:**

- Consumes: `ORDER_STATUSES`, `META_STANDARD_EVENTS`, `useUpdateMetaPixelConfigMutation`, `PayloadPreviewModal`, `DeleteModal`, `GlobalTable`, `TCustomColumnDef`.
- Produces: `<MetaPixelStatusRulesTab config={config} />`.

- [ ] **Step 1: Write the rule modal**

Create `src/components/marketing/MetaPixelStatusRuleModal.tsx` — `custom/Modal` + react-hook-form + zod with fields `status` (Select of `ORDER_STATUSES`), `eventName` (standard Select + `Custom…`), `enabled` (Switch).

The late-status warning is required. Render it as an inline callout whenever `eventName === "Purchase"` and `status` is not `confirmed` or `processing`:

> Meta credits a purchase to an ad only inside the attribution window — 7 days from the click by default. Orders delivered later than that will not be attributed to the campaign, so Ads Manager will under-report revenue. This is the accurate choice if you only count fulfilled orders; use a custom event such as `OrderDelivered` instead if you want Purchase to fire at checkout.

Block two rules with the same `status` + `eventName` pair with a field error.

- [ ] **Step 2: Write the rules tab**

Create `src/components/marketing/MetaPixelStatusRulesTab.tsx`:

- When `!config.capiEnabled`, render only an empty state: "Order status events are sent from the server through the Conversions API. Finish the Setup tab and run Test connection to enable them." — no table, no add button.
- Otherwise a `GlobalTable` with `tableName="metaPixelStatusRules"` and `defaultColumns: TCustomColumnDef<TMetaPixelStatusRule>[]` covering `status`, `eventName`, `enabled` (a badge), and an `actions` column with the `edit_button` and `delete_button` Button variants plus a Preview button.
- Add / edit / delete each rewrite the whole `statusRules` array through `updateMetaPixelConfig`, since the backend replaces the array wholesale.
- Deletion goes through `global/DeleteModal` with the warning "This rule will stop firing immediately. Events already sent to Meta are not affected."

- [ ] **Step 3: Verify rule behaviour**

1. With `capiEnabled: false`: expected the empty state only.
2. With CAPI verified: expected one seeded row, `delivered → Purchase`, enabled.
3. Open it for edit. Expected the attribution warning is visible because status is `delivered`.
4. Change the event to a custom `OrderDelivered`. Expected the warning disappears.
5. Add a second rule `shipped → OrderShipped`, save, reload. Expected both rows persist.
6. Add a duplicate `delivered → Purchase`. Expected a field error, no save.
7. Delete a rule. Expected the confirm dialog, then the row is gone after reload.
8. Preview the `delivered → Purchase` rule. Expected a payload built from a real recent order with `custom_data.value` equal to goods-after-discount — verify against that order's items by hand, and confirm shipping and tax are **not** included.

- [ ] **Step 4: Commit**

```bash
cd /e/itdaily/id-daily-admin && git add src/components/marketing src/app/\(mainLayout\)/marketing && git commit -m "feat(marketing): add Meta pixel order status rules tab"
```

---

## Task 13: Event log page and per-order card

**Repo:** AD

**Files:**

- Create: `src/app/(mainLayout)/marketing/meta-pixel/logs/page.tsx`
- Create: `src/components/marketing/OrderMetaEventsCard.tsx`
- Modify: the order detail page (`src/app/(mainLayout)/orders/[orderNumber]/page.tsx`)

**Interfaces:**

- Consumes: `useGetMetaPixelLogsQuery`, `useRetryMetaPixelEventMutation`, `GlobalTable`, `Modal`, `useCan`.
- Produces: the `/marketing/meta-pixel/logs` route and `<OrderMetaEventsCard sentEvents={...} />`.

- [ ] **Step 1: Write the log page**

Create `src/app/(mainLayout)/marketing/meta-pixel/logs/page.tsx`:

- `PageHeader title="Meta Pixel event log" subtitle="Every event sent to Meta, with the response"`.
- Filter bar: status Select (`all`, `queued`, `sent`, `failed`, `dead`), event name Input, source Select, and from/to date inputs, all held in local state and passed to `useGetMetaPixelLogsQuery`.
- `GlobalTable` with `tableName="metaPixelLogs"` and columns: `createdAt` (formatted), `eventName`, `source`, `orderId` (rendering `orderNumber` as a `Link` to `/orders/<orderNumber>`, or `—`), `status` (a colour-coded `Badge`: sent = default, queued = secondary, failed = outline, dead = destructive), `attempts`, `fbtraceId`, and `actions`.
- The actions column: a **View** button opening a `Modal` showing `payload` and `metaResponse` as formatted JSON side by side, plus a **Retry** button shown only when `status` is `failed` or `dead` **and** `can("can_retry_meta_pixel_event")`.
- Pagination driven by the response `pagination` block.
- `if (!isLoading && error) globalError(error);`

- [ ] **Step 2: Write the per-order card**

Create `src/components/marketing/OrderMetaEventsCard.tsx` — takes `sentEvents: TMetaPixelSentEvent[]` and renders a small card listing event name, a status badge, `attempts`, `sentAt`, and `errorMessage` when present. Render nothing at all when the array is empty or absent, so old orders show no dead UI. Add `TMetaPixelSentEvent` to `src/interface/metaPixel.interface.ts`:

```ts
export type TMetaPixelSentEvent = {
  eventName: string;
  eventId: string;
  status: TSentEventStatus;
  attempts: number;
  sentAt?: string;
  fbtraceId?: string;
  errorMessage?: string;
};
```

Mount it on the order detail page behind `can("can_read_meta_pixel_logs")`, reading `order.trackingData?.sentEvents`. Extend the admin order interface with the optional `trackingData` field first.

- [ ] **Step 3: Verify the log page**

1. Open `/marketing/meta-pixel/logs`. Expected: rows from earlier tasks — at least one `test_connection` row and one `status_rule` row.
2. Filter `status=dead`. Expected only dead rows.
3. View a row. Expected the payload JSON matches what preview produced, and `metaResponse` holds Meta's reply.
4. Retry a dead row. Expected a success toast and the row moving to `sent` or back to `dead` within a minute after a refetch.
5. Sign in as a role with `can_read_meta_pixel_logs` but not `can_retry_meta_pixel_event`. Expected: no Retry button.
6. Open an order that has fired a Purchase. Expected: the Meta events card lists it with a `sent` badge. Open an old order. Expected: no card.

- [ ] **Step 4: Run the full build**

```bash
cd /e/itdaily/id-daily-admin && npm run build
```

Expected: `Compiled successfully`, and `/marketing/meta-pixel` and `/marketing/meta-pixel/logs` both listed in the route table.

- [ ] **Step 5: Commit**

```bash
cd /e/itdaily/id-daily-admin && git add src/app/\(mainLayout\) src/components/marketing src/interface && git commit -m "feat(marketing): add Meta pixel event log page and per-order event card"
```

---

## Task 14: Storefront pixel provider

**Repo:** FE

**Files:**

- Create: `src/lib/metaPixel/triggers.ts`
- Create: `src/lib/metaPixel/getPublicConfig.ts`
- Create: `src/providers/MetaPixelProvider.tsx`
- Create: `src/lib/metaPixel/serverEvent.ts`
- Modify: `src/app/layout.tsx`

**Interfaces:**

- Consumes: `GET /meta-pixel/public-config`, `POST /meta-pixel/events`.
- Produces:
  - `type TMetaTriggerKey` — the same 14 keys as the backend registry
  - `getMetaPixelPublicConfig(): Promise<TPublicConfig>` (server-only, cached 5 minutes)
  - `<MetaPixelProvider config={...}>` and `useTrackEvent(): (key, payload?) => void`
  - `sendServerEvent(input)` — a server action forwarding an eventId to the backend

- [ ] **Step 1: Write the shared trigger key type**

Create `src/lib/metaPixel/triggers.ts`:

```ts
// Must stay in sync with BE src/app/modules/metaPixel/metaPixel.constants.ts.
export const TRIGGER_KEYS = [
  "page_view",
  "product_view",
  "category_view",
  "search",
  "add_to_cart",
  "cart_view",
  "wishlist_add",
  "compare_add",
  "checkout_start",
  "checkout_success",
  "signup",
  "login",
  "pc_builder_save",
  "contact_submit",
] as const;

export type TMetaTriggerKey = (typeof TRIGGER_KEYS)[number];

export type TPublicTrigger = {
  key: TMetaTriggerKey;
  eventName: string;
  sendViaCapi: boolean;
};

export type TPublicConfig = {
  enabled: boolean;
  pixelId?: string;
  testEventCode?: string;
  currency: string;
  triggers: TPublicTrigger[];
};
```

- [ ] **Step 2: Write the server-side config fetch**

Create `src/lib/metaPixel/getPublicConfig.ts`:

```ts
import { TPublicConfig } from "./triggers";

const EMPTY: TPublicConfig = {
  enabled: false,
  currency: "BDT",
  triggers: [],
};

export const getMetaPixelPublicConfig = async (): Promise<TPublicConfig> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/meta-pixel/public-config`,
      { next: { revalidate: 300 } },
    );

    if (!res.ok) {
      return EMPTY;
    }

    const json = await res.json();

    return json?.data ?? EMPTY;
  } catch {
    // Tracking config must never break a page render.
    return EMPTY;
  }
};
```

Confirm the env var name the storefront already uses for the API base URL and match it.

- [ ] **Step 3: Write the provider**

Create `src/providers/MetaPixelProvider.tsx`:

```tsx
"use client";

import Script from "next/script";
import { createContext, useCallback, useContext, useMemo } from "react";
import { TMetaTriggerKey, TPublicConfig } from "@/lib/metaPixel/triggers";
import { sendServerEvent } from "@/lib/metaPixel/serverEvent";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

type TTrackPayload = {
  custom?: Record<string, unknown>;
  orderId?: string;
  eventId?: string;
};

const MetaPixelContext = createContext<TPublicConfig | null>(null);

export const MetaPixelProvider = ({
  config,
  children,
}: {
  config: TPublicConfig;
  children: React.ReactNode;
}) => (
  <MetaPixelContext.Provider value={config}>
    {config.enabled && config.pixelId && (
      <Script id="meta-pixel-base" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${config.pixelId}');
        `}
      </Script>
    )}
    {children}
  </MetaPixelContext.Provider>
);

export const useTrackEvent = () => {
  const config = useContext(MetaPixelContext);

  const triggerMap = useMemo(
    () => new Map((config?.triggers ?? []).map((t) => [t.key, t])),
    [config],
  );

  return useCallback(
    (key: TMetaTriggerKey, payload: TTrackPayload = {}) => {
      if (!config?.enabled) {
        return;
      }

      const trigger = triggerMap.get(key);

      if (!trigger || typeof window.fbq !== "function") {
        return;
      }

      const eventId =
        payload.eventId ??
        (payload.orderId
          ? `${payload.orderId}:${trigger.eventName}`
          : `${key}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`);

      const params = {
        currency: config.currency,
        ...payload.custom,
        ...(config.testEventCode
          ? { test_event_code: config.testEventCode }
          : {}),
      };

      window.fbq("track", trigger.eventName, params, { eventID: eventId });

      // The server copy carries the IP, user agent and hashed identity that the
      // browser call cannot, and dedupes against it on the shared eventId.
      if (trigger.sendViaCapi) {
        void sendServerEvent({
          triggerKey: key,
          eventId,
          orderId: payload.orderId,
          custom: payload.custom,
          eventSourceUrl: window.location.href,
        });
      }
    },
    [config, triggerMap],
  );
};
```

`fbq('track', ...)` with a custom event name is wrong — Meta requires `trackCustom` for non-standard names. Since the admin can set a custom name, branch on whether `trigger.eventName` is in the standard list and call `trackCustom` otherwise. Add the standard-event array to `triggers.ts` and use it here.

- [ ] **Step 4: Write the server-event forwarder**

Create `src/lib/metaPixel/serverEvent.ts`:

```ts
"use server";

import { instance } from "@/lib/axios";

export const sendServerEvent = async (input: {
  triggerKey: string;
  eventId: string;
  orderId?: string;
  custom?: Record<string, unknown>;
  eventSourceUrl?: string;
}) => {
  try {
    await instance.post("/meta-pixel/events", input);
  } catch {
    // A dropped backup copy must never surface to the customer.
  }
};
```

- [ ] **Step 5: Mount the provider in the root layout**

In `src/app/layout.tsx`, make the component async, fetch the config, and wrap the existing tree inside `<ThemeProvider>`:

```tsx
export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const metaPixelConfig = await getMetaPixelPublicConfig();
  ...
        <MetaPixelProvider config={metaPixelConfig}>
          ... existing children ...
        </MetaPixelProvider>
```

- [ ] **Step 6: Verify the base pixel loads and respects the switches**

```bash
cd /e/itdaily/it-daily-homepage && npx tsc --noEmit && npm run dev
```

With the admin config enabled and a real pixel ID:

1. Load the storefront. Expected: `fbevents.js` in the Network tab, `window.fbq` defined, and the `_fbp` cookie set.
2. Install the Meta Pixel Helper extension. Expected: it detects the pixel and one `PageView` — not two.
3. Turn the master switch off in admin, wait 5 minutes (or restart FE to clear the 5-minute cache), reload. Expected: no `fbevents.js` request at all.
4. Add your own IP to `excludedIps`, reload after the cache expires. Expected: no pixel.

Note the 5-minute `revalidate` explicitly when reporting results — a config change not appearing instantly is expected behaviour, not a bug.

- [ ] **Step 7: Commit**

```bash
cd /e/itdaily/it-daily-homepage && git add src/lib/metaPixel src/providers/MetaPixelProvider.tsx src/app/layout.tsx && git commit -m "feat(metaPixel): add pixel provider and config-driven base script"
```

---

## Task 15: Storefront trigger call sites

**Repo:** FE

**Files:**

- Modify: one file per trigger key (14 call sites)

**Interfaces:**

- Consumes: `useTrackEvent()` (Task 14).
- Produces: nothing downstream — this is the last task.

Each call site passes only the payload the trigger needs. Locate each by searching rather than assuming a path.

| Key                | Where                                                           | `custom` payload                                                         |
| ------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------------ |
| `page_view`        | A client component in the root layout using `usePathname()`     | none                                                                     |
| `product_view`     | `src/app/product/[slug]/page.tsx` client child                  | `content_ids: [sku]`, `content_type: 'product'`, `value`, `content_name` |
| `category_view`    | The category listing client component                           | `content_type: 'product'`, `content_category`                            |
| `search`           | The search submit handler                                       | `search_string`                                                          |
| `add_to_cart`      | The add-to-cart handler                                         | `content_ids`, `content_type`, `value`, `contents`                       |
| `cart_view`        | The cart page                                                   | `content_ids`, `value`, `num_items`                                      |
| `wishlist_add`     | The wishlist handler                                            | `content_ids`, `value`                                                   |
| `compare_add`      | `src/components/category/FilterCard.tsx` area / compare handler | `content_ids`                                                            |
| `checkout_start`   | The checkout page mount                                         | `content_ids`, `value`, `num_items`                                      |
| `checkout_success` | After `addOrder` resolves                                       | `value`, `num_items`, plus `orderId` so the eventId matches the server's |
| `signup`           | The register success handler                                    | none                                                                     |
| `login`            | The login success handler                                       | none                                                                     |
| `pc_builder_save`  | The PC-builder save handler                                     | `content_ids`                                                            |
| `contact_submit`   | The contact form submit handler                                 | none                                                                     |

- [ ] **Step 1: Add the `page_view` tracker**

Create a small client component that fires on pathname change and mount it inside the provider:

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useTrackEvent } from "@/providers/MetaPixelProvider";

const MetaPixelPageView = () => {
  const pathname = usePathname();
  const track = useTrackEvent();

  useEffect(() => {
    track("page_view");
  }, [pathname, track]);

  return null;
};

export default MetaPixelPageView;
```

The base script's `fbq('init')` does not itself send a PageView in this setup, so this component is the only source — verify with Pixel Helper that exactly one fires per navigation.

- [ ] **Step 2: Add `product_view`**

In the product page's client component:

```tsx
useEffect(() => {
  track("product_view", {
    custom: {
      content_ids: [product.sku],
      content_type: "product",
      content_name: product.name,
      value: product.finalPrice,
    },
  });
}, [product.sku, track]);
```

- [ ] **Step 3: Add `checkout_success` with the shared eventId**

Where `addOrder` resolves successfully, pass the created order's id so the browser event and the server backup collapse into one:

```tsx
const res = await addOrder(payload);

if (!res?.error) {
  track("checkout_success", {
    orderId: res?.data?._id,
    custom: {
      value: goodsTotal,
      num_items: totalQuantity,
      content_ids: contentIds,
    },
  });
}
```

Confirm the actual shape of `res.data` before writing `_id`.

- [ ] **Step 4: Add the remaining 11 call sites**

Follow the table above. Every call is `track('<key>', { custom: {...} })` — no conditionals at the call site, because enablement is decided inside `useTrackEvent`.

- [ ] **Step 5: Verify the whole funnel with Pixel Helper**

With the pixel enabled, `test_event_code` set, and Events Manager → Test Events open, walk: home → category → product → add to cart → cart → checkout → place order.

Expected in Pixel Helper, in order and with no duplicates: `PageView` (once per navigation), `ViewContent`, `ViewContent`, `AddToCart`, `InitiateCheckout`. `checkout_success` fires nothing because it ships disabled — confirm that, then temporarily map it to `Purchase` in admin, place another order, and confirm exactly one `Purchase` appears with an `eventID` equal to `<orderId>:Purchase`. Disable it again afterwards.

Refresh the order-confirmation page. Expected: no second Purchase, because the eventId is derived from the order id.

- [ ] **Step 6: Verify the browser/server dedup**

Enable `sendViaCapi` on `add_to_cart` in admin. Add a product to the cart once.

Expected: Pixel Helper shows one `AddToCart`; the admin event log shows one `browser_backup` row with the same eventId; Events Manager shows a single AddToCart, not two, and its details list both Browser and Server as sources.

- [ ] **Step 7: Run the build and commit**

```bash
cd /e/itdaily/it-daily-homepage && npx tsc --noEmit && npm run build
```

Expected: a successful build.

```bash
git add -A && git commit -m "feat(metaPixel): fire pixel events from all storefront trigger points"
```

---

## Rollout checklist

Run after all tasks are complete, in this order:

1. Set `META_PIXEL_ENCRYPTION_KEY` in the production environment. Without it, every config read throws.
2. Deploy BE, then FE, then AD.
3. Grant `marketing` permissions to the roles that need them (Roles page).
4. In admin: enter pixel ID, dataset ID, access token, and a `test_event_code`. Run **Test connection**. Enable CAPI.
5. Confirm `content_ids` source matches your catalog feed, if one exists. Audit for blank or duplicate SKUs first:
   `db.products.aggregate([{$group:{_id:"$sku",n:{$sum:1}}},{$match:{$or:[{_id:null},{_id:""},{n:{$gt:1}}]}}])`
6. Add office and warehouse IPs to `excludedIps`.
7. Leave `test_event_code` set and the master switch on for one day; watch the event log and Events Manager Test Events.
8. Clear `test_event_code` to go live.
9. Confirm the `delivered → Purchase` rule fires on a real delivery, and that Ads Manager begins attributing purchases within the click window.
