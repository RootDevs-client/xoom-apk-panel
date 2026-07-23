# xoom-sports — AGENTS.md

## Stack

- Next.js 16.2.5 + Turbopack, React 19, TypeScript strict
- Tailwind CSS v4 (`@import "tailwindcss"`), shadcn/ui (New York), Lucide icons
- MongoDB + Mongoose, NextAuth v5 beta (Credentials provider + JWT)
- Zod validation, react-hook-form, zustand, TipTap editor
- Cloudinary (primary) + AWS S3 (file upload fallback)

## Commands

| Command             | Action                          |
| ------------------- | ------------------------------- |
| `pnpm dev`          | Dev server (Turbopack)          |
| `pnpm build`        | Production build (Turbopack)    |
| `pnpm lint`         | ESLint                          |
| `pnpm lint:fix`     | ESLint fix + `--max-warnings=0` |
| `pnpm format`       | Prettier write                  |
| `pnpm format:check` | Prettier check                  |
| `pnpm type-check`   | `tsc --noEmit`                  |

Run order: `pnpm lint:fix` → `pnpm type-check` → `pnpm build`

## Structure

- `app/(admin)/` — admin login page
- `app/(private)/` — protected admin dashboard routes (sidebar, stats, CRUD for categories/topics/news/subscriptions/settings/analytics, hold-to-initiate, heartbeat dashboard)
- `app/(public)/` — public landing page, terms, privacy, phone number entry
- `app/api/admin/` — admin API (auth, CRUD endpoints, initiate-hold, heartbeat-admin)
- `app/api/public/` — public API (requires `x-api-key` header; includes heartbeat, callback/cg, evina proxies)
- `app/api/auth/[...nextauth]/` — NextAuth handlers + auth() singleton
- `actions/` — server actions, organized by domain
- `components/` — shadcn/ui + custom components
- `components/evina-components/` — Evina subscription flow components (PhoneScreen, PinScreen, SubscriptionPage, etc.)
- `config/` — dbConnect, routes, cloudinary, constants
- `lib/` — utils, types, api-client, async-handler, validation schemas, evina, s3, webhook, heartbeat
- `lib/evina/` — Evina SDK injection, constants, types
- `lib/whatsapp/` — WhatsApp integration service layer (modular, swappable provider)
- `model/` — Mongoose models (User, Event, Subscribe, LifecycleStatus, Settings, etc.)
- `providers/` — AuthSessionProvider (client), DashboardProvider (loading/redirect)
- `store/` — Zustand stores (useAdminProfile, useTableStore)

## API patterns

- **Response format**: `{ status: boolean, message: string, data?, pagination? }` via `apiResponse()` in `@/lib/server.utils`
- **Handler wrappers**: `asyncHandler(schema, handler, checkAuth?)` for JSON, `asyncFormDataHandler(schema, handler, checkAuth?)` for multipart
  - Both auto-connect to DB, validate with Zod, handle errors
  - `checkAuth=true` validates Bearer JWT via `authenticate()`
  - Public routes auto-validate `x-api-key` header via `validateApiKey()`
- **Client API**: `apiClient()` in `@/lib/api-client` sends Bearer JWT for admin routes, `x-api-key` for public
- **Auth middleware**: `proxy.ts` protects `/admin/*` via NextAuth `auth()` — redirects to `/admin/login`
- **Default admin seed**: `config/database.ts:seedDefaultAdmin()` creates `admin@example.com` / `ChangeMe123!` on first connect

## Auth flow

1. POST `/api/admin/auth/login` → returns JWT (20-day expiry)
2. NextAuth stores JWT in session token. Middleware checks session for `/admin/*`.
3. API routes with `checkAuth=true` verify Bearer token against DB user.

## Models (MongoDB collections)

- `users` — admin credentials (bcrypt)
- `events` — app analytics events: `firstopen`, `appopen`, `appclose`
- `categories` — news categories (name, slug, icon)
- `topics` — news topics (name, slug, icon)
- `news` — articles with category refs + topics
- `subscribes` — subscriber records (phone unique, reference unique). Fields: phone, reference, platform, membershipPlan, expiryDate, status (boolean), holdStatus (boolean), deviceInfo[]
- `promotionmethods` — operator promotion config
- `settings` — singleton doc with general, privacyPolicy, termsOfService subdocs
- `lifecyclestatuses` — heartbeat/lifecycle tracking per MSISDN (msisdn unique, lifecycleStatus, lastSuccessfulHeartbeat, lastHeartbeatCheck, missedHeartbeatCount, transactionId, pendingState)
- `webhookevents` — (optional) persisted failed webhook events for retry scheduling
- `cgcallbacklogs` — (optional) CG callback audit trail

## Key conventions

- `@/*` path alias maps to project root
- API route handlers: `asyncHandler` + Zod schema in `validation-schema.ts`
- API input: zod schemas in `@/lib/validation-schema.ts`
- `cn()` from `@/lib/utils` for class merging
- Tailwind v4: `@theme inline` blocks, `@custom-variant dark`, `@import "tailwindcss"`
- Fonts: DM Sans (body) + Urbanist (headings) via CSS variables
- API authentication: `checkAuth` param on `asyncHandler`. Public routes validated via `x-api-key`.
- `extractFormData()` / `convertToFormData()` helpers parse complex FormData with nested keys like `items[0].name`

## Evina (telco pin verification — implemented at mobile end)

- `lib/evina/evina.ts` — injects SDK script into `<head>`, polls `window.evina_notify`, lifecycle: `idle → loaded → activated → error`
- `lib/evina/constants.ts` — universal-subscription-api URLs: /getevinajs, /pinrequest, /pinverify
- `lib/evina/types.ts` — Country, PinRequestPayload, PinVerifyPayload, ApiResponse, GetEvinaJSPayload, SubscriptionStep
- `components/evina-components/SubscriptionPage.tsx` — orchestrates the flow state machine
- `components/evina-components/PinScreen.tsx` — dual-mode: confirm (EVINA header + Confirm button) then PIN entry
- **Flow (all at mobile end — direct POST to universal-subscription-api, no server proxy)**:
  `phone → GetEvinaJS → Evina.load() → Confirm click (id="Confirm") → PinRequest → PIN entry → PinVerify`
- All 3 APIs called directly from client (mobile webview/browser): `POST https://universal-subscription-api.vclipss.com/{getevinajs|pinrequest|pinverify}`
- TransactionId generated once on phone submit, reused across GetEvinaJS, PinRequest, PinVerify, and all webhook events for that session
- GetEvinaJS returns `{ status, errorCode, responseMessage }` — `errorCode: 0` = success
- `Evina.load()` called with GetEvinaJS responseMessage (not PinRequest)
- Confirm button bound via HTML `id="Confirm"` — user performs ONE click to trigger PinRequest
- Error codes: 0 = success, any other = fail
- **Exception**: For Hold-to-Initiate (admin-initiated), PinRequest is called server-side because there is no user browser session

## Four PIN Flows

| Flow | EVINA | PIN Page | API Sequence |
|------|-------|----------|-------------|
| Flow 1 | Yes | Telco Page | GetEvinaJS → Render → 1 click → PinRequest → PinVerify |
| Flow 2 | Yes | Our Page | GetEvinaJS → Render → 1 click → PinRequest → Our PIN → PinVerify |
| Flow 3 | No | Telco Page | PinRequest → PinVerify |
| Flow 4 | No | Our Page | PinRequest → Our PIN → PinVerify |

Routing to Flow 1/2/3/4 determined per operator by `userTelcoServiceId`, `adAgencyCampaignId`, `pinPageLocation` (Telco/Our), and `isEvina` config.

## Admin Initiation Modes

| Mode | Trigger | Storage |
|------|---------|---------|
| **Instant** | No delay — when APP_ACTIVE, continue immediately to PIN flow | None |
| **With Timer** | Configured interval (15 min / 30 min / 1 hr) | Store txnId + MSISDN until interval reached |
| **Hold to Initiate** | Manual/business-controlled release (no timer) | Store indefinitely until manually triggered |

Hold to Initiate is intentionally different from Timer: no expiry time, record stays on hold until authorized/manual trigger.

## Operator Routing

See skill file for full table. Key operator groups:
- **EVINA telcos**: stc Kuwait, Ooredoo Oman/Maldives, Stc KSA, Mobily KSA, Zain KSA, Virgin KSA
- **CG callback telcos**: GP Bangladesh, Robi Bangladesh, Ooredoo Kuwait, Omantel Oman, stc Bahrain
- **Standard PIN/OTP**: Banglalink, Batelco

## Webhook

- **Endpoint**: `POST http://vivavas1.future-club.com/mi-lp2/webhook.aspx`
- **Headers**: `Content-Type: application/json`
- **Auth**: None
- **Payload**: `{ MobileNumber, IP, UA, TransactionID, ActionStatus, TimeStamp, LifecycleStatus?, LastActiveTimestamp? }`
- **ActionStatus values**: `APP_DOWNLOADED`, `DETAILS_CAPTURED`, `GET_EVINA_JS_CALLED`, `EVINA_JS_RENDERED`, `EVINA_WAITING_ENABLED`, `APP_ACTIVE`, `APP_INACTIVE`, `APP_DELETED`, `PIN_REQUEST_CALLED`, `PIN_RECEIVED`, `PIN_VERIFY_INVOKED`
- **Success condition**: HTTP 200 + `{ "status": "success" }`
- **Retry policy**: 3 attempts total (1 immediate + 2 retries), retry interval 1 hour
- **Firing points**:
  - `EVINA_JS_RENDERED` — fired client-side after GetEvinaJS returns + Evina.load() completes
  - `PIN_VERIFY_INVOKED` — fired client-side when PinVerify API is called
  - `APP_ACTIVE` — fired server-side from subscribe route on successful subscription
  - `APP_DELETED` — fired server-side from unsubscribe route or heartbeat detection
- `lib/webhook.ts` — utility: `sendWebhook(actionStatus, mobileNumber, transactionId, ip, ua)` handles POST + response check + retry scheduling
- Retry persistence: failed events stored in `webhookevents` collection with `retryCount`, `nextRetryAt`, `payload`; retry via cron or on subsequent webhook calls

## Heartbeat / Lifecycle Management

- **State machine**: `APP_ACTIVE` ↔ `APP_INACTIVE` → `APP_DELETED` (terminal)
- **Heartbeat frequency**: every 30–60 minutes (configurable)
- **Model** (`LifecycleStatus`): msisdn (unique), transactionId, lifecycleStatus, lastSuccessfulHeartbeat, lastHeartbeatCheck, missedHeartbeatCount (max 6 before deletion), pendingState
- **API**:
  - `POST /api/public/heartbeat` — receive heartbeat from app; sets APP_ACTIVE, resets counter
  - `GET /api/public/heartbeat/{msisdn}` — check current lifecycle status
  - `GET /api/admin/heartbeat` — admin dashboard: list all lifecycle records, filter by status
- **APP_DELETED trigger** (whichever comes first):
  1. Confirmed uninstall/deletion signal from the app, OR
  2. No successful heartbeat for 6 consecutive hours
- **On APP_DELETED**: stop all pending Hold-to-Initiate, PinRequest/PIN/PinVerify processing; do not auto-resume
- **Re-activation**: if APP_INACTIVE app sends heartbeat within 6hr window → back to APP_ACTIVE, resume pending processing
- `lib/heartbeat.ts` — checkLifecycle(), updateHeartbeat(), processMissedHeartbeats() utilities
- Admin heartbeat dashboard follows existing CRUD pattern (DataTableWithPagination, filters by status)

## Hold to Initiate

- **Purpose**: Admin manually initiates subscription for MSISDNs in held/pending state (no timer)
- **Model**: `holdStatus: boolean` field added to `Subscribe` model
- **Flow**: MSISDN in hold state → Admin selects (single or bulk) → Admin clicks "Initiate" → Webhook (`APP_ACTIVE`) → PinRequest → PIN flow → PinVerify
- **Admin UI** (new page under subscription/):
  - List view of subscribers where `holdStatus: true` (or `status: false` + `holdStatus: true`)
  - Checkbox column for individual selection
  - "Select All" checkbox
  - "Initiate Selected" button in toolbar
  - Confirmation dialog before initiation
- **API**:
  - `GET /api/admin/subscribe/hold` — paginated list of held MSISDNs (admin, checkAuth)
  - `POST /api/admin/subscribe/initiate` — accepts `{ ids: string[] }`; for each: fire webhook → call PinRequest → update status; returns results per MSISDN
- **Server action**: `initiateHoldSubscriptions(ids: string[])` in `actions/subscribe/subscribeActions.ts`
- PinRequest for initiated MSISDNs is called server-side (not client-side) because there's no user browser session

## CG Callback

- **Endpoint**: `POST /api/public/callback/cg` (public, no auth — called by external CG system)
- **Callback URL format**: `http://<host>/api/public/callback/cg?errorCode={errorCode}&AdAgencyCampaignTransactionId={transactionId}`
- **Single common callback** for all telco operators (same handling logic regardless of operator)
- **Correlation**: TransactionId (AdAgencyCampaignTransactionId) is the same value used for GetEvinaJS/PinRequest — lookup the Subscribe record to identify MSISDN
- **Callback error codes**:

| Code | Meaning | Handling |
|------|---------|----------|
| -72 | MSISDN already active | Show "already subscribed" message |
| -73 | Free period enabled | Allow user to continue per campaign rules |
| -74 | OTP sent, waiting confirmation | Show OTP page, call PinVerify after user enters OTP |
| -75 | Internal server error | Stop flow, show retry/support message |
| -76 | Error processing subscription | Stop flow, show retry/support message |
| -77 | Subscription activated, waiting for charging | Show "pending/activation in progress" message |
| -78 | Invalid MSISDN | Ask user to re-enter valid number |
| -79 | Blacklisted MSISDN | Reject subscription attempt |
| -80 | Bypass request | Stop normal subscription flow |
| -1 | Fraud activity | Reject, do not continue OTP verification |

- `lib/cg-callback.ts` — `handleCgCallback(errorCode, transactionId)` — looks up Subscribe by reference=transactionId, returns appropriate response/handling instruction
- Response to CG: `{ status: "success" }` on receipt (acknowledgment), actual processing result handled asynchronously

## WhatsApp Integration

- **Approach**: Third-party WhatsApp API via modular service layer
- **Architecture**:
  ```
  Main Application
       ↓
  WhatsApp Integration / Service Layer (lib/whatsapp/)
       ↓
  Third-Party WhatsApp API Provider
  ```
- **Requirements**:
  - Third-party provider must NOT be tightly coupled throughout the application
  - Service layer must be swappable — support replacing provider or migrating to Meta official API
  - API endpoints/credentials changeable without changing main application logic
- `lib/whatsapp/` — contains provider interface, concrete implementation(s), types, constants
  - `types.ts` — WhatsApp provider interface (sendMessage, getMessages, createChannel, etc.)
  - `provider.ts` — abstract class / interface defining the contract
  - `third-party.ts` — concrete implementation for the chosen third-party API
  - `factory.ts` — factory to instantiate provider from settings/env
  - `constants.ts` — provider endpoints, defaults

## WebSocket (Real-time Status Events)

- **Purpose**: Push real-time status/event updates from server to connected mobile clients
- **Existing infrastructure**: `socket.io` + `socket.io-client` already in dependencies. Baileys/WhatsApp socket servers at `lib/baileys/socket-server.ts`, `lib/whatsapp-meta/socket-server.ts`. Client utility at `lib/socket-client.ts`.
- **Socket port**: `3001` (configurable via `NEXT_PUBLIC_SOCKET_URL`)
- **Telco subscription events to emit**:

| Event | When | Payload |
|-------|------|---------|
| `telco:status:update` | Subscription status changes (subscribed/unsubscribed) | `{ phone, status, transactionId }` |
| `telco:lifecycle:change` | Lifecycle status changes (APP_ACTIVE/INACTIVE/DELETED) | `{ phone, lifecycleStatus, missedHeartbeatCount }` |
| `telco:cg:callback` | CG callback received | `{ phone, transactionId, errorCode }` |
| `telco:pin:requested` | PinRequest called | `{ phone, transactionId }` |
| `telco:pin:verified` | PinVerify succeeds/fails | `{ phone, transactionId, success }` |
| `telco:initiate:progress` | Hold-to-Initiate processing per MSISDN | `{ phone, id, success, error? }` |
| `telco:heartbeat:missed` | Heartbeat threshold reached | `{ phone, missedCount }` |

- **Rooms**: Mobile client joins room by `msisdn`/`phone` to receive events for their subscription
- **File structure** (to create):
  - `lib/telco/types.ts` — socket event interfaces (`ServerToClientEvents`, `ClientToServerEvents`)
  - `lib/telco/socket-server.ts` — Socket.IO server with telco rooms
  - `lib/telco/socket-emitter.ts` — emit utility functions called from API routes

## Env requirements

See `.env.example`. Key vars: MONGODB_URI, NEXTAUTH_SECRET, cloudinary/S3 credentials, PUBLIC_API_KEY (for public API routes), UNIVERSAL_SUBSCRIPTION_API_URL (optional, falls back to hardcoded), WHATSAPP_PROVIDER_URL, WHATSAPP_API_KEY.
