# WhatsApp Module — Frontend Integration Documentation

## Base Info

- **Base URL:** `http://localhost:8000/api/v1`
- **Socket Namespace:** `/admin`
- **HTTP Auth:** JWT Bearer token
- **Socket Auth:** `auth: { token: "<JWT>" }` or query param `?token=<JWT>`
- **Room Model:** `account:<accountId>`

---

## Socket Setup

```ts
import { io, Socket } from "socket.io-client";

const baseUrl = "http://localhost:8000";
const jwt = "<ADMIN_JWT>";
const accountId = "<WHATSAPP_ACCOUNT_ID>";

const socket: Socket = io(`${baseUrl}/admin`, {
  auth: { token: jwt },
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("Socket connected:", socket.id);
});

socket.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("Socket disconnected:", reason);
});
```

---

## 1. Create Account

### Frontend

```ts
POST /admin/baileys/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "GP Bangladesh"
}
```

### Backend

- Creates `WhatsappAccount` in MongoDB with status `PENDING`
- Generates unique `sessionId`
- **Automatically starts a Baileys session**
- Session begins connecting immediately

### Socket Events After Create

| Event          | Payload                               | When                    |
| -------------- | ------------------------------------- | ----------------------- |
| `status`       | `{ accountId, status: "connecting" }` | Immediately after start |
| `qr`           | `{ accountId, qr: "2@..." }`          | When QR is generated    |
| `ready`        | `{ accountId, phone, jid }`           | When QR is scanned      |
| `disconnected` | `{ accountId, reason?: string }`      | If connection fails     |
| `error`        | `{ accountId, message, code? }`       | If session start fails  |

### Frontend Response

```ts
const res = await api.post("/admin/baileys/create", { name: "GP Bangladesh" });
const { accountId, sessionId } = res.data.data;

// Join room for this account to receive events
socket.emit("admin:join", { accountId });
```

---

## 2. Reload Page

### Frontend

Reconnect socket with stored JWT.

```ts
const socket = io(`${baseUrl}/admin`, {
  auth: { token: jwt },
});

socket.on("connect", () => {
  // Server auto-joins all active account rooms on connection
  // Optionally also explicitly join rooms for accounts you care about
  socket.emit("admin:join", { accountId });
});
```

### Backend

- Authenticates socket via `WsJwtGuard`
- Auto-joins all active account rooms (`account:<accountId>`)
- When joining, `emitRoomState` checks current DB status and sends cached state to the newly joined socket

### Socket Events

| Condition                                            | Event   | Payload                     |
| ---------------------------------------------------- | ------- | --------------------------- |
| Account status is `CONNECTED`                        | `ready` | `{ accountId, phone, jid }` |
| Account status is NOT connected AND cached QR exists | `qr`    | `{ accountId, qr }`         |
| Account status is NOT connected AND no cached QR     | —       | No event                    |
| Nothing to report                                    | —       | No event                    |

### Frontend Response

- If `qr`: show QR modal
- If `ready`: show connected state
- If nothing: show idle/pending state

**No polling required.**

---

## 3. Refresh QR

### Frontend

```ts
// Option A: HTTP API
POST /admin/baileys/disconnect/:sessionId
Authorization: Bearer {token}

// Then
POST /admin/baileys/start/:sessionId
Authorization: Bearer {token}
```

```ts
// Option B: Socket event
socket.emit("refresh-qr", { accountId });
```

### Backend

- Cancels pending reconnect timers
- Gracefully closes existing socket
- Re-initializes Baileys socket
- Generates new QR

### Socket Events

| Event    | Payload                               | When               |
| -------- | ------------------------------------- | ------------------ |
| `status` | `{ accountId, status: "connecting" }` | Session restarting |
| `qr`     | `{ accountId, qr: "2@..." }`          | New QR generated   |
| `error`  | `{ accountId, message, code? }`       | If restart fails   |

### Frontend Response

Replace existing QR in UI with the new one.

---

## 4. Connected

### When it happens

QR scan succeeds. Baileys detects `connection === 'open'`.

### Socket Event

`ready`

### Payload

```json
{
  "accountId": "507f1f77bcf86cd799439011",
  "phone": "8801712345679",
  "jid": "8801712345679@s.whatsapp.net"
}
```

### Frontend Response

- Close QR modal
- Update account status to `CONNECTED`
- Store `phone` and `jid` for API calls

---

## 5. Disconnected

### When it happens

Baileys detects `connection === 'close'` with non-logout reason.

### Socket Event

`disconnected`

### Payload

```json
{
  "accountId": "507f1f77bcf86cd799439011",
  "reason": "reason_401"
}
```

Possible `reason` values:

- `manual_disconnect` — triggered by `POST /admin/baileys/disconnect/:sessionId`
- `restart_required` — Baileys requested restart, backend will auto-reconnect
- `reason_<statusCode>` — other disconnection reasons

### Frontend Response

- Show disconnected badge/warning
- Show reconnect button if `reason` is not `manual_disconnect`
- Backend may auto-reconnect in background; listen for `ready` or another `disconnected`

---

## 6. Logout

### When it happens

Admin calls `POST /admin/baileys/logout/:sessionId` or Baileys session is logged out.

### Socket Event

`logout`

### Payload

```json
{
  "accountId": "507f1f77bcf86cd799439011"
}
```

### Frontend Response

- Remove connected UI
- Show disconnected state
- Clear local session data
- `sessionId` is removed from backend; frontend must use HTTP APIs for future operations

---

## 7. Incoming Message

### When it happens

Baileys emits `messages.upsert`. Backend persists to MongoDB and emits socket event.

### Socket Event

`message`

### Payload

```json
{
  "accountId": "507f1f77bcf86cd799439011",
  "channelId": "507f1f77bcf86cd799439012",
  "messageId": "3EB0ABCD1234",
  "fromMe": false,
  "type": "text",
  "text": "Hello from customer",
  "timestamp": "2026-07-23T10:00:00.000Z"
}
```

`type` can be: `text`, `image`, `video`, `audio`, `document`, `sticker`

If `type` is `image`, `video`, or `document`, use `caption` instead of `text` for display text.

### Frontend Response

- Append message to chat UI for `channelId`
- If `fromMe: true`, show as sent message (right side)
- If `fromMe: false`, show as received message (left side)
- Update last message preview in conversation list
- Scroll to bottom

---

## 8. Sync Events

### When it happens

Baileys emits `contacts.update` or `groups.update`.

### Socket Event

`sync`

### Payload

```json
{
  "accountId": "507f1f77bcf86cd799439011",
  "type": "contacts",
  "status": "updated"
}
```

or

```json
{
  "accountId": "507f1f77bcf86cd799439011",
  "type": "groups",
  "status": "updated"
}
```

### Frontend Response

- Refresh contacts/channels list
- Show sync indicator briefly

---

## 9. History Sync

### When it happens

Baileys is syncing message history during connection.

### Socket Event

`history`

### Payload

```json
{
  "accountId": "507f1f77bcf86cd799439011",
  "progress": 45
}
```

`progress` is 0-100.

### Frontend Response

- Show history sync progress bar if applicable
- Hide when `progress` reaches 100 or no more events

---

## 10. Auth Error

### When it happens

Socket JWT is invalid or missing on `/admin` namespace.

### Socket Event

`error` (immediate on connect)

### Payload

```json
{
  "message": "Authentication failed"
}
```

Client is disconnected immediately after this emission.

### Frontend Response

- Show error toast
- Redirect to login page

---

## Complete Feature Table

| Frontend Action               | API / Socket Emit                                                                    | Backend Action                                                   | Socket Response                 | Frontend Response                 |
| ----------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------------------- | --------------------------------- |
| Create WhatsApp account       | `POST /admin/baileys/create`                                                         | Create MongoDB account, generate `sessionId`, auto-start Baileys | `status`, `qr`                  | Show QR modal                     |
| Refresh QR                    | `socket.emit('refresh-qr', { accountId })` or `POST /admin/baileys/start/:sessionId` | Restart Baileys session, generate new QR                         | `qr`                            | Replace existing QR               |
| Reload page                   | Reconnect socket `/admin` with JWT                                                   | Auto-join all active account rooms, emit room state              | `qr` or `ready` or nothing      | Show QR / connected / idle        |
| Scan QR succeeds              | —                                                                                    | Baileys detects open connection                                  | `ready`                         | Close QR modal, update status     |
| Connection drops (non-logout) | —                                                                                    | Baileys detects close, may auto-reconnect                        | `disconnected`                  | Show disconnected badge           |
| Manual disconnect             | `POST /admin/baileys/disconnect/:sessionId`                                          | Gracefully close socket, update DB                               | `disconnected`                  | Show disconnected state           |
| Logout                        | `POST /admin/baileys/logout/:sessionId`                                              | Logout from Baileys, clear session data                          | `logout`                        | Remove connected UI               |
| Receive message               | —                                                                                    | Persist message to DB                                            | `message`                       | Append to chat UI                 |
| Contacts updated              | —                                                                                    | —                                                                | `sync`                          | Refresh contacts list             |
| Groups updated                | —                                                                                    | —                                                                | `sync`                          | Refresh groups list               |
| History syncing               | —                                                                                    | —                                                                | `history`                       | Show progress bar                 |
| Reconnect max retries         | —                                                                                    | Stop reconnecting                                                | `error` with code `MAX_RETRIES` | Show error, prompt manual restart |

---

## HTTP API Reference

### Baileys Sessions

| Method | Endpoint                               | Auth | Description                         |
| ------ | -------------------------------------- | ---- | ----------------------------------- |
| `POST` | `/admin/baileys/create`                | JWT  | Create account + auto-start session |
| `POST` | `/admin/baileys/start/:sessionId`      | JWT  | Start session for existing account  |
| `POST` | `/admin/baileys/disconnect/:sessionId` | JWT  | Disconnect session without logout   |
| `POST` | `/admin/baileys/logout/:sessionId`     | JWT  | Full logout and clear session       |
| `GET`  | `/admin/baileys/sessions`              | JWT  | List all sessions                   |
| `GET`  | `/admin/baileys/sessions/:sessionId`   | JWT  | Get single session details          |
| `POST` | `/admin/baileys/start-all`             | JWT  | Start all pending sessions          |

### WhatsApp Accounts

| Method   | Endpoint                      | Auth | Description                |
| -------- | ----------------------------- | ---- | -------------------------- |
| `POST`   | `/admin/whatsapp-account`     | JWT  | Create account record only |
| `GET`    | `/admin/whatsapp-account`     | JWT  | List accounts              |
| `GET`    | `/admin/whatsapp-account/:id` | JWT  | Get account by ID          |
| `PUT`    | `/admin/whatsapp-account/:id` | JWT  | Update account             |
| `DELETE` | `/admin/whatsapp-account/:id` | JWT  | Delete account             |

### WhatsApp Channels

| Method   | Endpoint                      | Auth | Description       |
| -------- | ----------------------------- | ---- | ----------------- |
| `POST`   | `/admin/whatsapp-channel`     | JWT  | Create channel    |
| `GET`    | `/admin/whatsapp-channel`     | JWT  | List channels     |
| `GET`    | `/admin/whatsapp-channel/:id` | JWT  | Get channel by ID |
| `PUT`    | `/admin/whatsapp-channel/:id` | JWT  | Update channel    |
| `DELETE` | `/admin/whatsapp-channel/:id` | JWT  | Delete channel    |

---

## Socket Room Model

All socket events are room-scoped to `account:<accountId>`.

- When admin connects to `/admin`, server auto-joins all active account rooms.
- Frontend should emit `admin:join` with `{ accountId }` to explicitly join and receive current state.

```ts
// Join specific account room
socket.emit("admin:join", { accountId: "<ACCOUNT_ID>" });

// Leave account room
socket.emit("admin:leave", { accountId: "<ACCOUNT_ID>" });

// Request QR refresh for an account
socket.emit("refresh-qr", { accountId: "<ACCOUNT_ID>" });
```

---

## Complete Sequence Diagrams

### Create Account

```
Frontend               API                    Backend                Baileys                 Socket
  |                     |                       |                       |                       |
  |-- POST /baileys/create ---------------------->|                       |                       |
  |                     |-- create account ----->|                       |                       |
  |                     |                       |-- save MongoDB ------->|                       |
  |                     |                       |-- startSession ------->|                       |
  |                     |                       |                       |-- connect ------------>|
  |<-- {accountId, sessionId} -------------------|                       |                       |
  |                     |                       |                       |<-- QR generated -------|
  |                     |                       |<-- sendQr -------------|<----------------------|
  |                     |                       |                       |                       |-- qr {accountId, qr}
  |-- emit admin:join --------------------------->|                       |                       |
  |                     |                       |                       |                       |-- qr OR ready
  |                     |                       |                       |<-- connection open ----|
  |                     |                       |<-- sendReady ----------|<----------------------|
  |                     |                       |                       |                       |-- ready {accountId, phone, jid}
```

### Reload Page

```
Frontend               API                    Backend                Baileys                 Socket
  |                     |                       |                       |                       |
  |-- connect /admin --------------------------->|                       |                       |
  |                     |                       |-- authenticate ------->|                       |
  |                     |                       |-- autoJoinAll -------->|                       |
  |<-- connected ---------------------------------|                       |                       |
  |                     |                       |                       |                       |
  |-- emit admin:join --------------------------->|                       |                       |
  |                     |                       |-- emitRoomState ------>|                       |
  |                     |                       |                       |                       |-- qr OR ready OR nothing
```

### Refresh QR

```
Frontend               API                    Backend                Baileys                 Socket
  |                     |                       |                       |                       |
  |-- emit refresh-qr -------------------------->|                       |                       |
  |                     |                       |-- refreshQr ---------->|                       |
  |                     |                       |-- restartSession ----->|                       |
  |                     |                       |                       |-- close --------------->|
  |                     |                       |                       |-- connect ------------>|
  |                     |                       |                       |<-- QR generated -------|
  |                     |                       |<-- sendQr -------------|<----------------------|
  |                     |                       |                       |                       |-- qr {accountId, qr}
```

### Connected

```
Frontend               API                    Backend                Baileys                 Socket
  |                     |                       |                       |                       |
  |                     |                       |                       |<-- connection open ----|
  |                     |                       |-- sendReady ---------->|                       |
  |                     |                       |                       |                       |-- ready {accountId, phone, jid}
  |                     |                       |-- sendStatus --------->|                       |
  |                     |                       |                       |                       |-- status {accountId, "connected"}
```

### Disconnect (not logout)

```
Frontend               API                    Backend                Baileys                 Socket
  |                     |                       |                       |                       |
  |                     |                       |                       |<-- connection close ----|
  |                     |                       |-- sendDisconnected --->|                       |
  |                     |                       |                       |                       |-- disconnected {accountId, reason}
  |                     |                       |-- startReconnect ----->|                       |
  |                     |                       |                       |-- connect ------------>|
```

### Logout

```
Frontend               API                    Backend                Baileys                 Socket
  |                     |                       |                       |                       |
  |-- POST /baileys/logout/:sessionId --------->|                       |                       |
  |                     |                       |-- logout ------------->|                       |
  |                     |                       |                       |-- close --------------->|
  |                     |                       |-- sendLogout --------->|                       |
  |                     |                       |                       |                       |-- logout {accountId}
```

### Incoming Message

```
Frontend               API                    Backend                Baileys                 Socket
  |                     |                       |                       |                       |
  |                     |                       |                       |<-- message upsert -----|
  |                     |                       |-- persist to DB ------>|                       |
  |                     |                       |-- sendMessage ------->|                       |
  |                     |                       |                       |                       |-- message {accountId, channelId, messageId, fromMe, type, text, timestamp}
```

---

## React / Next.js Example

```tsx
// hooks/useWhatsAppSocket.ts
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type WhatsAppStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnected"
  | "logged_out";

export function useWhatsAppSocket(jwt: string, accountId?: string) {
  const socketRef = useRef<Socket | null>(null);
  const [qr, setQr] = useState<string | null>(null);
  const [status, setStatus] = useState<WhatsAppStatus>("idle");
  const [phone, setPhone] = useState<string | null>(null);
  const [jid, setJid] = useState<string | null>(null);

  useEffect(() => {
    if (!jwt) return;

    const socket = io(`${BASE_URL}/admin`, {
      auth: { token: jwt },
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket connected");
      if (accountId) {
        socket.emit("admin:join", { accountId });
      }
    });

    socket.on("qr", (payload: { accountId: string; qr: string }) => {
      if (!accountId || payload.accountId === accountId) {
        setQr(payload.qr);
        setStatus("connecting");
      }
    });

    socket.on(
      "ready",
      (payload: { accountId: string; phone: string; jid: string }) => {
        if (!accountId || payload.accountId === accountId) {
          setQr(null);
          setPhone(payload.phone);
          setJid(payload.jid);
          setStatus("connected");
        }
      },
    );

    socket.on(
      "disconnected",
      (payload: { accountId: string; reason?: string }) => {
        if (!accountId || payload.accountId === accountId) {
          setQr(null);
          setStatus("disconnected");
        }
      },
    );

    socket.on("logout", (payload: { accountId: string }) => {
      if (!accountId || payload.accountId === accountId) {
        setQr(null);
        setPhone(null);
        setJid(null);
        setStatus("logged_out");
      }
    });

    socket.on("message", (payload: any) => {
      if (!accountId || payload.accountId === accountId) {
        // handle new message in chat UI
      }
    });

    socket.on("error", (payload: any) => {
      console.error("Socket error:", payload);
    });

    socket.on("disconnect", () => {
      setStatus("disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, [jwt, accountId]);

  const refreshQr = () => {
    if (accountId && socketRef.current) {
      socketRef.current.emit("refresh-qr", { accountId });
    }
  };

  return { socket: socketRef.current, qr, status, phone, jid, refreshQr };
}
```

---

## Quick Start Checklist

- [ ] Get admin JWT via `POST /api/v1/admin/auth/login`
- [ ] Connect to Socket.IO `/admin` with `auth: { token: jwt }`
- [ ] Listen for `qr`, `ready`, `disconnected`, `logout`, `message`, `error`, `sync`, `history`
- [ ] Create account via `POST /admin/baileys/create`
- [ ] Emit `admin:join` with `accountId`
- [ ] Display QR when received
- [ ] Update UI on `ready`, `disconnected`, `logout`
- [ ] Handle incoming `message` events for chat UI
