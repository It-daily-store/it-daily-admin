# Meta Pixel + Conversions API — Admin-Managed Tracking

Date: 2026-09-09
Status: Approved design, ready for implementation planning

## Problem

The storefront has no Meta tracking at all. Marketing needs to configure the
Meta Pixel and Conversions API (CAPI) from the admin panel — without a code
deploy — and to control which Meta event fires at which point in the customer
journey, including events triggered by order status changes after the customer
has left the site.

## Goals

1. Admin configures pixel credentials and CAPI credentials from the admin panel.
2. Admin can enable/disable tracking globally and per event.
3. Admin maps a Meta event to each known storefront trigger point.
4. Admin defines rules of the form "when an order reaches status X, send event Y
   via CAPI" — gated on CAPI being verified.
5. Every order carries the identity data CAPI needs, so an event fired days
   after checkout still matches a Meta user.
6. Every send is observable, idempotent, and retryable.

## Non-goals

- Other ad platforms (Google, TikTok). Meta only; this is its own module.
- Cookie consent / GDPR gating. Traffic is effectively Bangladesh-only.
- Multiple pixels or per-brand pixel routing. Exactly one pixel/dataset.
- A Meta product catalog feed. Out of scope, but `contentIdSource` is
  configurable so a future feed can be keyed consistently.

## Two facts that shaped the design

**Deduplication works on `event_name` + `event_id` pairs, not on `event_id`
alone.** Sending `InitiateCheckout` and `Purchase` with the same id does not
tell Meta they belong to one funnel. What links a funnel is the user identity
carried on each event: `fbp`, `fbc`, client IP, user agent, hashed PII. So
`event_id` is used here for its real purpose — collapsing the _same_ event sent
twice (browser copy + server copy, or a thank-you page refresh).

**Purchase-on-delivered trades attribution for accuracy.** `event_time` is the
status-change moment, so Meta never rejects the event. But a purchase recorded
10 days after the ad click falls outside Meta's default 7-day-click window and
is not credited to the campaign. This is an accepted tradeoff for a COD market
where pre-delivery revenue is not real revenue. The admin UI surfaces the
tradeoff; `checkout_success` remains mappable for an early funnel signal.

## Decisions

| Question                    | Decision                                                           |
| --------------------------- | ------------------------------------------------------------------ |
| Module placement            | Own backend module `metaPixel`, not inside `settings`              |
| Platform scope              | Meta only, no generic provider abstraction                         |
| Pixel count                 | Exactly one pixel/dataset                                          |
| Environments                | Single config + Meta `test_event_code` field                       |
| Token storage               | AES-256-GCM encrypted at rest; API returns last 4 only             |
| RBAC                        | New `EAppModules.marketing` with read/update permissions           |
| Event mapping               | Fixed code-defined trigger registry; admin remaps event names      |
| Channels                    | Per-trigger `sendViaBrowser` / `sendViaCapi` toggles               |
| Event names                 | Meta standard list + free-text custom option                       |
| `value`                     | Goods only, after discount; excludes shipping and tax              |
| `content_ids`               | Default `sku`, admin-selectable (`sku` / `_id` / `slug`)           |
| Status triggers             | Rule list: any status to any event, each independently toggled     |
| Payment conditions on rules | Not in v1                                                          |
| Idempotency                 | Per-order sent-event ledger                                        |
| PII                         | SHA-256 hashed at order creation; raw PII never duplicated         |
| Delivery                    | Detached send via a BullMQ queue, reusing the existing Redis       |
| Observability               | Admin event log page in v1                                         |
| Consent                     | Skipped                                                            |
| Extras in v1                | Test connection, global kill switch, preview payload, excluded IPs |
| Purchase default            | `delivered` to `Purchase`, seeded enabled                          |
| Currency                    | Single currency, `currency` field defaulting to `BDT`              |

## Data model

New module `src/app/modules/metaPixel/` in the backend, following the existing
module file shape (`.interface`, `.model`, `.validation`, `.service`,
`.controller`, `.route`, `.constants`).

### `MetaPixelConfig` (single upserted document)

- **Credentials**: `pixelId`, `datasetId`, `accessToken` (encrypted),
  `testEventCode`, `tokenVerifiedAt`, `tokenExpiresAt`
- **Master switches**: `enabled` (global kill switch), `capiEnabled`
  (settable only after a successful test connection)
- **Payload options**: `currency` (default `BDT`), `contentIdSource`
  (`sku` | `_id` | `slug`), `contentType` (`product`)
- **Hygiene**: `excludedIps: string[]` (IPs and CIDRs), `blockBots: boolean`
- **`triggers[]`**: `{ key, eventName, isCustomEvent, enabled, sendViaBrowser,
sendViaCapi }` — one entry per registry key. `sendViaCapi` is only valid on
  backend-visible keys and is forced false while `capiEnabled` is false.
- **`statusRules[]`**: `{ id, status, eventName, isCustomEvent, enabled }`
- `lastUpdatedBy`, timestamps

The access token is encrypted with AES-256-GCM using a key from the environment
(`META_PIXEL_ENCRYPTION_KEY`). No endpoint ever returns the plaintext token;
reads return `tokenLast4` and `hasToken`.

### Order `trackingData` sub-document

Written once at order creation, never updated afterwards.

- **Raw, non-PII**: `fbp`, `fbc`, `clientIp`, `userAgent`, `eventSourceUrl`
- **SHA-256 hashed**, normalized per Meta's rules before hashing (trim +
  lowercase; phone reduced to E.164 digits): `em`, `ph`, `fn`, `ln`, `ct`,
  `st`, `zp`, `country`, `external_id`
- **`sentEvents[]`** (the ledger): `{ eventName, eventId, status:
queued|sent|failed|dead, attempts, sentAt, metaResponse, fbtraceId,
nextRetryAt }`

Raw customer PII is never copied into `trackingData`. Hashes are computed at
order creation because the delayed status-triggered events fire when no browser
and possibly no current user record is available.

### `MetaPixelEventLog`

One row per send attempt, across all sources:
`{ eventName, eventId, source: browser_backup|status_rule|manual, orderId?,
payload, status, attempts, httpStatus, metaResponse, fbtraceId, createdAt }`
with a 90-day TTL index.

Rationale for the split: the per-order ledger answers "did this order's
Purchase go out" and must live with the order to guarantee idempotency; the
event log answers "is the integration healthy" and is disposable.

## Trigger registry

Defined in code (`metaPixel.constants.ts`, mirrored in the storefront), not in
the database. Admin can remap the event name and toggle channels, but cannot
add or remove keys — a key with no call site could never fire.

| key                | backend-visible | default event        | default state |
| ------------------ | --------------- | -------------------- | ------------- |
| `page_view`        | no              | PageView             | on            |
| `product_view`     | no              | ViewContent          | on            |
| `category_view`    | no              | ViewContent          | on            |
| `search`           | no              | Search               | on            |
| `add_to_cart`      | yes             | AddToCart            | on            |
| `cart_view`        | no              | —                    | off           |
| `wishlist_add`     | no              | AddToWishlist        | on            |
| `compare_add`      | no              | —                    | off           |
| `checkout_start`   | yes             | InitiateCheckout     | on            |
| `checkout_success` | yes             | —                    | off           |
| `signup`           | yes             | CompleteRegistration | on            |
| `login`            | yes             | —                    | off           |
| `pc_builder_save`  | yes             | CustomizeProduct     | on            |
| `contact_submit`   | yes             | Contact              | on            |

Because the registry is a shared typed constant, a mistyped trigger key is a
compile error rather than a silently dead event.

## Data flow

### Browser path

A `MetaPixelProvider` in the storefront fetches
`GET /meta-pixel/public-config` once. That endpoint returns only
`{ enabled, pixelId, testEventCode, currency, triggers[] }` — never the token,
never the status rules. The provider injects the base pixel script when
`enabled && pixelId`.

All call sites use one helper, `trackEvent(key, payload)`, which resolves the
key against the fetched config, returns silently when the trigger is disabled
or `sendViaBrowser` is false, generates an `eventId`, and calls
`fbq('track', eventName, params, { eventID })`.

### Server backup path

For backend-visible triggers with `sendViaCapi` enabled, the storefront's
existing server actions forward the generated `eventId` to
`POST /meta-pixel/events` (rate-limited, unauthenticated), and the backend
sends the same event via CAPI with that id, so Meta collapses the pair. When no
`eventId` is supplied, the backend derives a deterministic one so the send stays
idempotent.

### Status-rule path

In `order.service.ts`, inside the existing `statusChanged` branch (currently
around lines 513-546), after the order is persisted:
`MetaPixelService.onOrderStatusChanged(order, newStatus)`.

That function:

1. Loads config; returns immediately when `!enabled || !capiEnabled`.
2. Finds enabled `statusRules` matching the new status.
3. For each rule, checks the order's `sentEvents` ledger for a non-failed entry
   with the same `eventName`; skips when present. This makes
   delivered to processing to delivered fire exactly once.
4. Builds the payload from the order items and the `trackingData` snapshot.
5. Writes a `queued` ledger entry with `eventId = <orderId>:<eventName>`.
6. Fires the send, detached.

`event_time` is the status-change timestamp.

### Sending, retry, hygiene

`sendToMeta()` posts to `https://graph.facebook.com/v21.0/{pixelId}/events`.
Sends are dispatched through a BullMQ queue (`metaPixel.queue.ts`), reusing the
Redis connection and the `<module>.queue.ts` pattern already established by
`product.queue.ts` and `deal.queue.ts`. The HTTP request only enqueues, so Meta
latency or downtime never slows or fails an admin's status update, and a server
restart mid-send does not lose the event. Every outcome is written to both the
order ledger and the event log.

Retry policy is the queue's: `attempts: 5` with exponential backoff starting at
60s. Failure classification decides whether a retry is attempted at all:

- 4xx caused by configuration (bad token, unknown pixel) is non-retryable. The
  job throws BullMQ's `UnrecoverableError` so retries stop immediately, and the
  ledger entry is marked `dead`.
- Network errors, 5xx and 429 throw a normal error, so the queue retries with
  backoff. After the final attempt the worker's `failed` handler marks the entry
  `dead`.

`excludedIps` and bot filtering apply on the server path via CIDR match on
`clientIp` and a crawler UA regex. For the browser path, `public-config`
returns `enabled: false` when the requesting IP is excluded, so staff browsing
fires nothing.

## API surface

| Method | Path                          | Permission                              |
| ------ | ----------------------------- | --------------------------------------- |
| GET    | `/meta-pixel/public-config`   | none (storefront); masked               |
| GET    | `/meta-pixel/config`          | `can_read_marketing`                    |
| PUT    | `/meta-pixel/config`          | `can_update_marketing`                  |
| POST   | `/meta-pixel/test-connection` | `can_update_marketing`                  |
| POST   | `/meta-pixel/preview-payload` | `can_read_marketing`                    |
| GET    | `/meta-pixel/logs`            | `can_read_marketing`                    |
| POST   | `/meta-pixel/logs/:id/retry`  | `can_update_marketing`                  |
| POST   | `/meta-pixel/events`          | none (storefront ingress, rate-limited) |

`test-connection` sends a real test event with the saved credentials and returns
the raw Meta response. A successful test is what unlocks `capiEnabled`, and
therefore the whole status-rule feature.

`preview-payload` takes `{ triggerKey | statusRuleId, sampleOrderId? }` and
returns the exact JSON that would be sent, without sending it.

## RBAC

Add `EAppModules.marketing` to the roles enum, with `can_see_meta_pixel_page`,
`can_read_marketing`, `can_update_marketing`, `can_read_meta_pixel_logs` and
`can_retry_meta_pixel_event` in `PERMISSION_CATALOG`.

No role migration is required. `checkPermission` denies when a role document has
no entry for the module (`granted !== true`), and `isMasterAdmin` short-circuits
before any lookup — so existing roles default to no access and the master admin
has access immediately. `PERMISSION_CATALOG` is declared
`satisfies Record<EAppModules, readonly TPermissionDef[]>` and `MODULE_LABELS` is
a `Record<EAppModules, string>`, so adding the enum value fails the build until
both are updated.

## Admin UI

New sidebar group **Marketing**, alongside the existing `storefront` group.

### `(mainLayout)/marketing/meta-pixel/page.tsx`

A `Tabs` layout — a single flat form would be unusable at this field count.

1. **Setup** — pixel ID, dataset ID, token (write-only input rendering a masked
   value plus the last 4 characters when configured), test event code, currency,
   `contentIdSource` select, the **Test connection** button with its response
   rendered inline, and a CAPI status badge. `capiEnabled` renders disabled with
   an explanatory tooltip until a test passes.
2. **Events** — the trigger registry as a table: trigger name and description,
   an event-name combobox (Meta standard list plus a "Custom" option that
   reveals a text input), enabled switch, browser switch, CAPI switch (disabled
   with a tooltip on front-end-only triggers), and a **Preview payload** button
   per row opening a `Modal` with the JSON.
3. **Order status rules** — a `GlobalTable` of rules with add/edit through
   `Modal` + react-hook-form + zod, and `DeleteModal` for removal. The
   late-status Purchase warning renders as an inline callout on the rule form.
   The whole tab is gated behind `capiEnabled`.
4. **Hygiene** — global kill switch (prominent, behind a confirmation dialog),
   excluded IPs as a tag input, block-bots toggle.

### `(mainLayout)/marketing/meta-pixel/logs/page.tsx`

`PageHeader` + `GlobalTable` with columns for event, order (linking to the order
page), status badge, attempts, `fbtraceId`, and timestamp; a filter bar for
event / status / date; a row action opening the full payload and Meta response in
a `Modal`; and a retry button on `failed` and `dead` rows.

### Order detail page

A "Meta events" card listing that order's `sentEvents` ledger, so support can
answer "did this order's Purchase fire" without leaving the page.

### Conventions

Follows the established chain: new `tagTypes.metaPixel` and
`tagTypes.metaPixelLogs` entries, then `src/redux/api/metaPixelApi.ts` via
`injectEndpoints`, `src/interface/metaPixel.interface.ts`, components under
`src/components/marketing/`, and pages composed from `PageHeader`,
`GlobalTable`, `Modal`, `DeleteModal`, with `globalError(err)` in every catch.

## Storefront changes

Deliberately thin:

- One `MetaPixelProvider`.
- One shared trigger-registry constants file.
- One `trackEvent(key, payload)` helper.
- `fbp` / `fbc` / client IP / user agent capture in the checkout server action.
- Roughly 14 call sites, one per registry key.

## Testing

No test framework is configured in any of the three repos, so verification is
manual and staged:

1. Configure credentials in admin, run **Test connection**, confirm the event
   appears in Meta Events Manager under Test Events using `test_event_code`.
2. Use **Preview payload** on each trigger to confirm `value`, `currency`,
   `content_ids` and `content_type` are correct before enabling.
3. Install the Meta Pixel Helper browser extension and walk the storefront
   journey, confirming one event per trigger and no duplicates on refresh.
4. Place a test order, then advance it to `delivered`, and confirm exactly one
   `Purchase` in the event log and in Events Manager. Flip the status away and
   back and confirm no second send.
5. Set an invalid token and confirm the send is marked `dead` after a single
   attempt (no retries) and surfaces in the log; point the Graph host at an
   unreachable address and confirm the queue retries with backoff before going
   `dead` on the fifth attempt.
6. Add your own IP to `excludedIps` and confirm the storefront fires nothing.
7. Toggle the global kill switch and confirm both paths go silent.

## Risks

- **Attribution loss on Purchase-on-delivered** — accepted, documented in the
  UI. Mitigation available: enable `checkout_success` as an early signal.
- **`content_ids` mismatch with a future catalog feed** — silent failure mode
  with no error anywhere. Mitigated by making `contentIdSource` explicit and
  configurable, and by warning in the Setup tab that it must match the feed.
- **Products with blank or duplicate `sku`** — would never match a catalog.
  Worth an audit query before choosing `sku`.
- **Token expiry** — long-lived system-user tokens can still be revoked.
  `tokenVerifiedAt` is recorded; a health warning when no successful send has
  occurred in 24 hours is a natural follow-up.
- **Redis becomes a hard dependency for CAPI sends** — if Redis is unreachable,
  events queue nowhere. Redis is already required for the product and deal
  queues so this adds no new infrastructure, but the enqueue call must be
  wrapped so a Redis failure records a `dead` ledger entry rather than throwing
  into the order-status request.
- **Orders predating the feature have no `trackingData`** — a status rule firing
  on one of them would send an event with no identity data, which Meta cannot
  match. Such sends are skipped and recorded in the log as `dead` with a
  "missing tracking data" reason rather than sent unmatched. No historical
  backfill is in scope.
- **Unauthenticated `POST /meta-pixel/events` ingress** — a third party could
  inject fabricated events and pollute the pixel. Mitigated by rate limiting per
  IP, accepting only registry keys whose `sendViaCapi` is enabled, and rejecting
  a payload whose `eventId` does not correspond to a real order where an order
  is implied. Fully closing this would require signing the request from the
  storefront, which is a reasonable follow-up if abuse appears.
