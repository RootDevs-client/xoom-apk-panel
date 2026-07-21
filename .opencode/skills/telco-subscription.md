---
name: telco-subscription
description: Complete implementation reference for SMS App & Telco Subscription Integration — master flow, GetEvinaJS, all 4 PIN flows, webhook lifecycle, 3 admin modes, CG callback, operator routing, heartbeat, WhatsApp.
---

# SMS App & Telco Subscription Integration — Implementation Skill

## 1. Master Flow

```
App Installation
       ↓
Capture MSISDN / IP / UA / device context
       ↓
Identify Telco
       ↓
   ┌───┴───┐
   │ EVINA │      Non-EVINA
   │ telco │  ──→ enter app directly
   └───┬───┘
       ↓
GetEvinaJS + render onboarding
       ↓
User performs ONE required click to enter the app
       ↓
Confirm lifecycle / APP_ACTIVE
       ↓
Admin Mode: Instant / With Timer / Hold to Initiate
       ↓
Route to applicable PIN Flow (1 / 2 / 3 / 4)
       ↓
PinRequest → PIN handling → PinVerify
```

**Key rule**: GetEvinaJS and PinRequest are **separate calls**. Do not merge them.

---

## 2. Installation & Onboarding Flow

| Step    | Action                                                     | Webhook Event         |
| ------- | ---------------------------------------------------------- | --------------------- |
| 1       | App installed from APK or Play Store                       | `APP_DOWNLOADED`      |
| 2       | Capture MSISDN, IP, UA, device context                     | `DETAILS_CAPTURED`    |
| 3       | Identify telco (EVINA / CG / Standard)                     | —                     |
| 4A      | **EVINA telco**: Call GetEvinaJS, store JS + TransactionID | `GET_EVINA_JS_CALLED` |
| 4A cont | Render EVINA content on onboarding page                    | `EVINA_JS_RENDERED`   |
| 4B      | **Non-EVINA telco**: Enter app directly                    | —                     |
| 5       | EVINA: User performs ONE required click to enter app       | —                     |
| 6       | Report APP_ACTIVE lifecycle state                          | `APP_ACTIVE`          |

**All 3 APIs called directly from mobile client**: `POST https://universal-subscription-api.vclipss.com/{getevinajs|pinrequest|pinverify}` — no server proxy.

**Exception**: Hold-to-Initiate (admin mode) calls PinRequest server-side (no browser session).

---

## 3. Three Admin Initiation Modes

| Mode                 | Trigger                                      | Storage                                    | Action                                                                                                             |
| -------------------- | -------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Instant**          | No delay, no timer, no scheduled wait        | None                                       | When APP_ACTIVE, continue immediately to applicable PIN flow                                                       |
| **With Timer**       | Configured interval (15 min / 30 min / 1 hr) | Store txnId, MSISDN until interval reached | At configured time, deliver stored data to webhook + continue PIN processing (only when lifecycle rules permit)    |
| **Hold to Initiate** | Manual/business-controlled release           | Store txnId, MSISDN indefinitely           | When manually triggered, deliver/process stored data + continue PIN flow (subject to APP_ACTIVE/APP_DELETED rules) |

**Hold to Initiate is intentionally different from Timer**: no expiry time, record stays on hold until authorized/manual trigger.

### Hold to Initiate — Admin Portal Implementation

- **Model**: `holdStatus: boolean` added to Subscribe
- **Admin UI**: Checkbox column (single/bulk) + "Initiate Selected" button + confirmation dialog
- **API**:
  - `GET /api/admin/subscribe/hold` — paginated held records
  - `POST /api/admin/subscribe/initiate` — `{ ids: string[] }`; fire webhook → PinRequest → update status
- **Server action**: `initiateHoldSubscriptions(ids)` in `actions/subscribe/subscribeActions.ts`

---

## 4. Webhook & Status Notifications

### Endpoint

- **URL**: `POST http://vivavas1.future-club.com/mi-lp2/webhook.aspx`
- **Headers**: `Content-Type: application/json`
- **Auth**: None

### Payload

```json
{
  "MobileNumber": "string",
  "IP": "string",
  "UA": "string",
  "TransactionID": "string",
  "ActionStatus": "string",
  "TimeStamp": "string",
  "LifecycleStatus": "string",
  "LastActiveTimestamp": "string"
}
```

### Full Status Reference

| ActionStatus            | When                                                                      |
| ----------------------- | ------------------------------------------------------------------------- |
| `APP_DOWNLOADED`        | App installation detected                                                 |
| `DETAILS_CAPTURED`      | MSISDN, IP, UA, device details collected                                  |
| `GET_EVINA_JS_CALLED`   | GetEvinaJS API called (EVINA flows only); include TransactionID           |
| `EVINA_JS_RENDERED`     | EVINA content rendered on onboarding page                                 |
| `EVINA_WAITING_ENABLED` | EVINA rendered waiting/next-step state enabled (only while APP_ACTIVE)    |
| `APP_ACTIVE`            | App open/foreground activity + configured heartbeat refresh               |
| `APP_INACTIVE`          | Hold delayed/immediate next-step PIN processing until APP_ACTIVE restored |
| `APP_DELETED`           | Stop pending timer, held initiation, OTP/PIN, and verification actions    |
| `PIN_REQUEST_CALLED`    | PinRequest invoked                                                        |
| `PIN_RECEIVED`          | PIN received/available in the relevant cycle                              |
| `PIN_VERIFY_INVOKED`    | PinVerify invoked                                                         |

### Two Uses of the Webhook

1. **Status/Event Notifications** — send after major app actions and lifecycle changes
2. **Delayed/Manual Data Delivery** — With Timer: send stored data when interval reached; Hold to Initiate: send/process stored data when manually triggered

### Success Condition

HTTP 200 + `{ "status": "success" }`

### Retry Policy

- 3 attempts total (1 immediate + 2 retries)
- Retry interval: 1 hour between attempts
- Prevent duplicate processing using MSISDN + TransactionID + status + timestamp/idempotency logic

### Firing Points

| ActionStatus         | Where                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------- |
| `EVINA_JS_RENDERED`  | `SubscriptionPage.tsx` — client-side fetch to webhook URL after Evina.load()          |
| `PIN_REQUEST_CALLED` | Client-side or server-side depending on flow                                          |
| `PIN_VERIFY_INVOKED` | `SubscriptionPage.tsx` — client-side fetch to webhook URL before PinVerify            |
| `APP_ACTIVE`         | `app/api/public/subscribe/route.ts` — server-side via `sendWebhook()`                 |
| `APP_DELETED`        | `app/api/admin/subscribe/[id]/unsubscribe/route.ts` — server-side via `sendWebhook()` |

### Files

| File                    | Purpose                                                    |
| ----------------------- | ---------------------------------------------------------- |
| `lib/webhook.ts`        | `sendWebhook(actionStatus, payload)` utility with retry    |
| `model/WebhookEvent.ts` | Persisted failed events (retryCount, nextRetryAt, payload) |

---

## 5. Four Final PIN Flows

| Flow   | EVINA | PIN Page   | APIs                                                      |
| ------ | ----- | ---------- | --------------------------------------------------------- |
| Flow 1 | Yes   | Telco Page | GetEvinaJS → PinRequest → PinVerify                       |
| Flow 2 | Yes   | Our Page   | GetEvinaJS → PinRequest → **User enters PIN** → PinVerify |
| Flow 3 | No    | Telco Page | PinRequest → PinVerify                                    |
| Flow 4 | No    | Our Page   | PinRequest → **User enters PIN** → PinVerify              |

### Flow 1 — EVINA + PIN in Telco Page

```
GetEvinaJS
   ↓
Render EVINA
   ↓
ONE user click
   ↓
PinRequest
   ↓
PIN on Telco Page (telco handles UI)
   ↓
PinVerify
```

### Flow 2 — EVINA + PIN in Our Page (current implementation)

```
GetEvinaJS
   ↓
Render EVINA
   ↓
ONE user click (id="Confirm")
   ↓
PinRequest
   ↓
PIN on Our Page (4-digit input)
   ↓
PinVerify
```

### Flow 3 — PIN Only (No EVINA) in Telco Page

```
Enter app directly
   ↓
PinRequest
   ↓
PIN on Telco Page (telco handles UI)
   ↓
PinVerify
```

### Flow 4 — PIN Only (No EVINA) in Our Page

```
Enter app directly
   ↓
PinRequest
   ↓
PIN on Our Page (4-digit input)
   ↓
PinVerify
```

---

## 6. Operator / Telco Routing

| Telco             | Country    | EVINA   | Variant          | PIN Flow | Notes                                                          |
| ----------------- | ---------- | ------- | ---------------- | -------- | -------------------------------------------------------------- |
| Banglalink (BL)   | Bangladesh | No      | Standard PIN/OTP | Flow 4   | Direct PinRequest → PinVerify                                  |
| GrameenPhone (GP) | Bangladesh | No      | CG page          | Flow 3/4 | Telco consent/CG callback before final PIN                     |
| Robi              | Bangladesh | No      | CG page          | Flow 3/4 | Telco consent/CG callback before final PIN                     |
| stc               | Kuwait     | **Yes** | EVINA PIN/OTP    | Flow 1/2 | Separate GetEvinaJS, render/click, then PinRequest + PinVerify |
| Ooredoo           | Kuwait     | No      | CG page          | Flow 3/4 | CG callback; handle errorCode + transactionId                  |
| Ooredoo           | Oman       | **Yes** | EVINA PIN/OTP    | Flow 1/2 | Same separate EVINA + PinRequest journey                       |
| Ooredoo           | Maldives   | **Yes** | EVINA PIN/OTP    | Flow 1/2 | Same separate EVINA + PinRequest journey                       |
| Omantel           | Oman       | No      | CG page          | Flow 3/4 | CG callback; handle errorCode + transactionId                  |
| stc               | Bahrain    | No      | CG page          | Flow 3/4 | CG consent before PIN confirmation/PinVerify                   |
| Batelco           | Bahrain    | No      | Standard PIN/OTP | Flow 4   | Direct PinRequest → PinVerify                                  |
| Stc KSA           | KSA        | **Yes** | EVINA PIN/OTP    | Flow 1/2 | Separate GetEvinaJS, render/click, then PinRequest + PinVerify |
| Mobily KSA        | KSA        | **Yes** | EVINA PIN/OTP    | Flow 1/2 | Same                                                           |
| Zain KSA          | KSA        | **Yes** | EVINA PIN/OTP    | Flow 1/2 | Same                                                           |
| Virgin KSA        | KSA        | **Yes** | EVINA PIN/OTP    | Flow 1/2 | Same                                                           |

**Operator config required per telco**: `userTelcoServiceId`, `adAgencyCampaignId`, `OTPPageConfirmButtonHTMLID`, PIN page location (Telco/Our Page = Flow 1/3 vs 2/4), CG callback URL (CG-enabled operators).

---

## 7. CG Page / Telco Consent Callback

### CG Flow (for GP Bangladesh, Robi, Omantel, Ooredoo, stc Bahrain)

1. Capture MSISDN / ClickId / IP / UA
2. Call PinRequest / Generate PIN (starts telco CG consent journey)
3. User completes telco CG consent on operator page
4. Operator redirects to CG callback URL:
   `http://<host>/api/public/callback/cg?errorCode={errorCode}&AdAgencyCampaignTransactionId={transactionId}`
5. Evaluate errorCode before continuing
6. If PIN confirmation required, continue with **same** transactionId (do not generate new)
7. Call PinVerify when required

### Callback Error Codes

| Code | Meaning                                      | Handling                                            |
| ---- | -------------------------------------------- | --------------------------------------------------- |
| -72  | MSISDN already active                        | Show "already subscribed" message                   |
| -73  | Free period enabled                          | Allow user to continue per campaign rules           |
| -74  | OTP sent, waiting confirmation               | Show OTP page, call PinVerify after user enters OTP |
| -75  | Internal server error                        | Stop flow, show retry/support message               |
| -76  | Error processing subscription                | Stop flow, show retry/support message               |
| -77  | Subscription activated, waiting for charging | Show "pending/activation in progress" message       |
| -78  | Invalid MSISDN                               | Ask user to re-enter valid number                   |
| -79  | Blacklisted MSISDN                           | Reject subscription attempt                         |
| -80  | Bypass request                               | Stop normal subscription flow                       |
| -1   | Fraud activity                               | Reject, do not continue OTP verification            |

### Implementation Files

| File                                  | Purpose                                                                                                                    |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `app/api/public/callback/cg/route.ts` | Parse errorCode + transactionId from query, call handleCgCallback(), return `{ status: "success" }`                        |
| `lib/cg-callback.ts`                  | `handleCgCallback(errorCode, transactionId)` — lookup Subscribe by `reference: transactionId`, return handling instruction |

---

## 8. API Reference — GetEvinaJS, PinRequest, PinVerify

### 8.1 GetEvinaJS

**Purpose**: Obtain EVINA JavaScript/content and TransactionID for EVINA-controlled telcos.
**Use only for**: Flow 1 and Flow 2 (EVINA telcos).
**Call before**: PinRequest. Store EVINA JS/content + TransactionID.

- **Endpoint**: `POST https://universal-subscription-api.vclipss.com/getevinajs`
- **Method**: JSON POST
- **Auth**: None
- **Request**:
  ```json
  {
    "msisdn": "string",
    "userTelcoServiceId": 0,
    "adAgencyCampaignId": 0,
    "adAgencyCampaignTransactionId": "string",
    "userIP": "string",
    "ua": "string"
  }
  ```
- **Response**:
  ```json
  {
    "status": "string",
    "errorCode": 0,
    "responseMessage": "string"
  }
  ```
- `errorCode: 0` = success; any other = fail
- `responseMessage` contains EVINA JS to inject via `Evina.load()`
- **Do not** expect PinRequest to return EVINA JS — GetEvinaJS and PinRequest are **separate calls**

### 8.2 PinRequest / Generate PIN

**Endpoint**: `POST https://universal-subscription-api.vclipss.com/pinrequest`

**Request**:

```json
{
  "msisdn": "string",
  "userTelcoServiceId": 0,
  "adAgencyCampaignId": 0,
  "adAgencyCampaignTransactionId": "string",
  "userIP": "string",
  "ua": "string"
}
```

| Parameter                       | How to Populate                                                      |
| ------------------------------- | -------------------------------------------------------------------- |
| `msisdn`                        | User mobile number                                                   |
| `userTelcoServiceId`            | Service ID configured for selected telco                             |
| `adAgencyCampaignId`            | Campaign ID configured for selected telco/campaign                   |
| `adAgencyCampaignTransactionId` | ClickId/transaction key — preserve through PinVerify and CG callback |
| `userIP`                        | Subscriber IP captured during app/landing flow                       |
| `ua`                            | Device/browser/WebView user agent                                    |

**Standard response**: Same shape as GetEvinaJS (`status`, `errorCode`, `responseMessage`).

**Rules**:

- EVINA flows: PinRequest only after EVINA rendered + user click
- Non-EVINA flows: PinRequest directly after app/admin-mode gating
- CG operators: PinRequest may start telco consent journey; continue based on callback

### 8.3 PinVerify / Verify PIN

**Endpoint**: `POST https://universal-subscription-api.vclipss.com/pinverify`

**Request**:

```json
{
  "adAgencyCampaignTransactionId": "string",
  "pin": "string"
}
```

| Parameter                       | How to Populate                                                      |
| ------------------------------- | -------------------------------------------------------------------- |
| `adAgencyCampaignTransactionId` | Same transaction ID from PinRequest/CG journey — must match original |
| `pin`                           | PIN entered by user for verification                                 |

**Standard response**: Same shape as GetEvinaJS (`status`, `errorCode`, `responseMessage`).

### 8.4 API Sequence by Flow

| Flow   | Sequence                                                           | Rule                                  |
| ------ | ------------------------------------------------------------------ | ------------------------------------- |
| Flow 1 | GetEvinaJS → Render → 1 click → PinRequest → Telco PIN → PinVerify | EVINA required; PIN on telco page     |
| Flow 2 | GetEvinaJS → Render → 1 click → PinRequest → Our PIN → PinVerify   | EVINA required; our page collects PIN |
| Flow 3 | PinRequest → Telco PIN → PinVerify                                 | No EVINA                              |
| Flow 4 | PinRequest → Our PIN → PinVerify                                   | No EVINA                              |

---

## 9. Operator Configuration Rules

| Configuration                   | Used In                              | Rule                                                                           |
| ------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------ |
| `userTelcoServiceId`            | PinRequest                           | Telco/service-specific configured value                                        |
| `adAgencyCampaignId`            | PinRequest                           | Telco/campaign-specific configured value                                       |
| `adAgencyCampaignTransactionId` | PinRequest / CG callback / PinVerify | Keep correlated and unchanged for the related journey                          |
| `userIP`                        | PinRequest                           | Use captured subscriber IP                                                     |
| `ua`                            | PinRequest                           | Use captured device/browser/WebView user agent                                 |
| `OTPPageConfirmButtonHTMLID`    | GetEvinaJS / EVINA page              | Configure the confirmation/onboarding CTA identifier EVINA binds to            |
| CG Callback URL                 | CG-enabled operators                 | Provide callback URL and handle errorCode + transactionId                      |
| PIN page location               | Flow routing                         | Configured as Telco Page or Our Page per operator (determines Flow 1/3 vs 2/4) |

---

## 10. Heartbeat / Lifecycle Management

### State Machine

```
APP_ACTIVE ←→ APP_INACTIVE ──(6hr no heartbeat)──→ APP_DELETED (terminal)
```

- **APP_ACTIVE**: Allow next-step processing. Keep last-active timestamp current.
- **APP_INACTIVE**: Keep stored data. Hold PinRequest/PIN handling/PinVerify or delayed/manual next-step processing until active again.
- **APP_DELETED**: Stop pending timer, Hold-to-Initiate processing, OTP/PIN, and verification actions. Retain MSISDN, timestamps, transaction history for audit.

### LifecycleStatus Model

```
model/LifecycleStatus.ts
  msisdn: string (unique)
  transactionId: string
  lifecycleStatus: "APP_ACTIVE" | "APP_INACTIVE" | "APP_DELETED"
  lastSuccessfulHeartbeat: Date
  lastHeartbeatCheck: Date
  missedHeartbeatCount: number (max 6 → APP_DELETED)
  pendingState?: string (e.g., "PIN_VERIFY" or hold reference)
```

### API Endpoints

| Method | Path                             | Auth      | Purpose                                          |
| ------ | -------------------------------- | --------- | ------------------------------------------------ |
| POST   | `/api/public/heartbeat`          | x-api-key | Receive heartbeat; upsert LifecycleStatus        |
| GET    | `/api/public/heartbeat/{msisdn}` | x-api-key | Get current lifecycle status                     |
| GET    | `/api/admin/heartbeat`           | checkAuth | List all records with pagination + status filter |

### Heartbeat Utilities (`lib/heartbeat.ts`)

```ts
updateHeartbeat(msisdn, transactionId?) → upsert LifecycleStatus
checkLifecycle(msisdn) → "APP_ACTIVE" | "APP_INACTIVE" | "APP_DELETED"
processMissedHeartbeats() → check all APP_ACTIVE records; increment missedHeartbeatCount;
                           if >= 6 → set APP_DELETED + fire webhook
```

---

## 11. WhatsApp Integration

### Architecture

```
Main Application
       ↓
WhatsApp Integration / Service Layer (lib/whatsapp/)
       ↓
Third-Party WhatsApp API Provider
```

### Files

| File                          | Purpose                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| `lib/whatsapp/types.ts`       | Provider interface (`sendMessage`, `getMessages`, `createChannel`, etc.) |
| `lib/whatsapp/provider.ts`    | Abstract class defining the contract                                     |
| `lib/whatsapp/third-party.ts` | Concrete implementation for chosen third-party API                       |
| `lib/whatsapp/factory.ts`     | Factory instantiation from Settings/env                                  |
| `lib/whatsapp/constants.ts`   | Provider endpoints, defaults                                             |

**Key**: Main app imports from factory only. To swap provider: replace `third-party.ts`, update factory — no main app changes.

---

## 12. WebSocket (Real-time Status Events for Mobile)

### Purpose

Push real-time status/event updates from server to connected mobile clients so the app knows immediately when a CG callback arrives, lifecycle changes, or an admin initiates a hold record.

### Existing Infrastructure

- `socket.io` + `socket.io-client` already in dependencies
- Existing socket servers at `lib/baileys/socket-server.ts` and `lib/whatsapp-meta/socket-server.ts`
- Client utility at `lib/socket-client.ts`
- Port `3001` (configurable via `NEXT_PUBLIC_SOCKET_URL`)

### Telco Events to Emit

| Event                     | When                                                   | Payload                                            |
| ------------------------- | ------------------------------------------------------ | -------------------------------------------------- |
| `telco:status:update`     | Subscription status changes (subscribed/unsubscribed)  | `{ phone, status, transactionId }`                 |
| `telco:lifecycle:change`  | Lifecycle status changes (APP_ACTIVE/INACTIVE/DELETED) | `{ phone, lifecycleStatus, missedHeartbeatCount }` |
| `telco:cg:callback`       | CG callback received                                   | `{ phone, transactionId, errorCode }`              |
| `telco:pin:requested`     | PinRequest called                                      | `{ phone, transactionId }`                         |
| `telco:pin:verified`      | PinVerify succeeds/fails                               | `{ phone, transactionId, success }`                |
| `telco:initiate:progress` | Hold-to-Initiate processing per MSISDN                 | `{ phone, id, success, error? }`                   |
| `telco:heartbeat:missed`  | Heartbeat threshold reached                            | `{ phone, missedCount }`                           |

### Rooms

Mobile client joins room by `msisdn`/`phone` to receive events for their subscription only.

### Files to Create

| File                          | Purpose                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| `lib/telco/types.ts`          | Socket event interfaces (`ServerToClientEvents`, `ClientToServerEvents`) |
| `lib/telco/socket-server.ts`  | Socket.IO server with telco rooms (join/leave by msisdn)                 |
| `lib/telco/socket-emitter.ts` | Emit utility functions called from API routes                            |

### Firing Points

| Event                     | Where to emit from                                                      |
| ------------------------- | ----------------------------------------------------------------------- |
| `telco:status:update`     | `app/api/public/subscribe/route.ts` — after subscribe success           |
| `telco:lifecycle:change`  | `lib/heartbeat.ts` — `updateHeartbeat()` or `processMissedHeartbeats()` |
| `telco:cg:callback`       | `app/api/public/callback/cg/route.ts` — after callback received         |
| `telco:pin:requested`     | Client-side or server-side PinRequest handler                           |
| `telco:pin:verified`      | Client-side or server-side PinVerify handler                            |
| `telco:initiate:progress` | `app/api/admin/subscribe/initiate/route.ts` — per MSISDN                |
| `telco:heartbeat:missed`  | `lib/heartbeat.ts` — `processMissedHeartbeats()`                        |

---

## 13. Webhook Firing Points — Full Reference

| ActionStatus            | When                                     | Origin          | Via                                                   |
| ----------------------- | ---------------------------------------- | --------------- | ----------------------------------------------------- |
| `APP_DOWNLOADED`        | App installation detected                | Mobile client   | Direct fetch to webhook URL                           |
| `DETAILS_CAPTURED`      | MSISDN, IP, UA, device context collected | Mobile client   | Direct fetch                                          |
| `GET_EVINA_JS_CALLED`   | GetEvinaJS API called                    | Mobile client   | Direct fetch                                          |
| `EVINA_JS_RENDERED`     | Evina.load() completed                   | Mobile client   | Direct fetch                                          |
| `EVINA_WAITING_ENABLED` | EVINA waiting state active (APP_ACTIVE)  | Mobile client   | Direct fetch                                          |
| `APP_ACTIVE`            | Heartbeat / successful subscription      | Mobile + Server | Mobile: direct fetch; Server: `sendWebhook()`         |
| `PIN_REQUEST_CALLED`    | PinRequest invoked                       | Mobile / Server | Varies by flow                                        |
| `PIN_RECEIVED`          | PIN received in relevant cycle           | Mobile / Server | Varies                                                |
| `PIN_VERIFY_INVOKED`    | PinVerify called                         | Mobile / Server | Varies                                                |
| `APP_INACTIVE`          | Heartbeat missed threshold               | Server          | `sendWebhook()` from heartbeat process                |
| `APP_DELETED`           | 6hr no heartbeat / confirmed uninstall   | Server          | `sendWebhook()` from heartbeat process or unsubscribe |

---

## 13. Implementation Order

1. **Models** — `LifecycleStatus`, `WebhookEvent`, update `Subscribe` (holdStatus)
2. **Lib utilities** — `lib/webhook.ts`, `lib/heartbeat.ts`, `lib/cg-callback.ts`
3. **API routes** — callback (public), heartbeat (public + admin), hold/initiate (admin)
4. **Client Evina flow** — update types, SubscriptionPage, PinScreen (GetEvinaJS + Confirm + 4-flow routing)
5. **Admin UI** — Hold to Initiate page, heartbeat dashboard, Instant/Timer mode config
6. **Operator config** — Service ID, Campaign ID, CG URLs, PIN page location per operator
7. **WebSocket** — `lib/telco/types.ts`, `lib/telco/socket-server.ts`, `lib/telco/socket-emitter.ts`; integrate emit calls into relevant API routes
8. **WhatsApp** — modular service layer (parallel, low dependency)
