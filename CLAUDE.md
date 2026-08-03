# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (see `pnpm-workspace.yaml`, `pnpm-lock.yaml`).

| Command            | Action                                    |
| ------------------ | ----------------------------------------- |
| `pnpm dev`         | Dev server (Next 16 + Turbopack)          |
| `pnpm build`       | Production build (Turbopack)              |
| `pnpm start`       | Production server on port **3001**        |
| `pnpm lint`        | ESLint                                    |
| `pnpm lint:fix`    | ESLint fix, `--max-warnings=0`            |
| `pnpm format`      | Prettier write (`format:check` to verify) |
| `pnpm type-check`  | `tsc --noEmit`                            |

Verification order before considering work done: `pnpm lint:fix` → `pnpm type-check` → `pnpm build`.

There is no test framework, no ESLint/Prettier config file checked in, and `lint-staged`/`prettier` are not in `devDependencies` — the `precommit`/`format` scripts will not run as-is. Don't assume tests exist; verify with type-check + build.

## Architecture

Next.js App Router project that is **two applications in one repo**:

1. **Admin dashboard (current, active work)** — server components + server actions in `actions/` that call an **external backend** over HTTP via `lib/api-client.ts`. The base URL is `NEXT_PUBLIC_BASE_URL_BACKEND` (falls back to a hardcoded LAN address). Nothing in `actions/` talks to the local `app/api/*` routes.
2. **Legacy in-repo API + Mongoose models** — `app/api/*`, `model/*`, `config/database.ts`. Self-contained MongoDB implementation of the same domain. Still present and buildable, but the dashboard no longer consumes it. **Before editing `app/api/` or `model/`, confirm the change is actually wanted there rather than on the external backend.**

Because of this split, "add a feature to the dashboard" almost always means: server action in `actions/<domain>/` → `apiClient()` → external backend, plus UI under `app/(private)/admin/dashboard/<feature>/`.

### Route groups

- `app/(admin)/admin/login` — login page
- `app/(private)/admin/dashboard/*` — protected dashboard (analytics, categories, topics, news, subscription, devices, telco-operators, promotion-category, whatsapp, settings)
- `app/(public)/` — landing, terms, privacy-policy, `[phoneNumber]` subscription entry, `evina/`
- `app/api/` — legacy API (`admin/`, `public/`, `auth/[...nextauth]/`)

### Auth

`app/api/auth/[...nextauth]/auth.ts` uses a NextAuth v5 Credentials provider that is a **pass-through** — real credential checking happens on the external backend; the returned `token` is stashed on the JWT and re-exposed as `session.token`.

- `proxy.ts` is the middleware (matcher `/`, `/admin/:path*`): unauthenticated `/admin/*` → `/admin/login`; authenticated user on the login page → dashboard.
- `lib/api-client.ts` (server) attaches `Authorization: Bearer <session.token>`; on 401 it signs out and redirects to login.
- `lib/api-client-client.ts` is the client-component twin (uses `getSession()`); use it only from `"use client"` code.
- `isPublic: true` on either client swaps the Bearer token for an `x-api-key` header.

### Dashboard page pattern

Every CRUD screen follows the same shape — copy an existing one (e.g. `devices/`) rather than inventing:

```
<feature>/
  page.tsx                 # thin: renders the list component
  _components/
    <Feature>Lists.tsx     # "use client": useTableState(tableId) → server action → DataTableWithPagination
    <Feature>Toolbar.tsx   # search / filters / create, driven by the same tableId
    columns.tsx            # TanStack ColumnDef[]
```

- `store/useTableStore.ts` keys pagination/search/filter/refresh state by a **`tableId` string**, so multiple tables coexist. Mutations call `handleRefresh(tableId)`; the list's `useEffect` depends on `[refresh, page, limit, search]`.
- `components/custom/data-table/DataTableWithPagination.tsx` is the shared table (TanStack Table + dnd-kit row reordering + skeleton loading).

### Server action pattern (`actions/<domain>/<domain>Actions.ts`)

`"use server"`, one exported function per endpoint, each wrapping `apiClient()` in try/catch that **re-throws `NEXT_REDIRECT` digests** and otherwise returns a shaped fallback (`{ ok: false, message, data: {...} }`). Preserve that re-throw — swallowing it breaks the 401 sign-out redirect. Pass cache `tags` on GETs.

### Legacy API conventions (when you do work in `app/api/`)

- Responses: `apiResponse(status, statusCode, message, data?, pagination?)` from `@/lib/utils` / `@/lib/server.utils`.
- Handlers wrapped in `asyncHandler` (`lib/async-handler.ts`) or `asyncFormDataHandler`; both overloads exist — `(schema, handler, checkAuth?)` and `(handler, checkAuth?)`. The wrapper does `dbConnect()`, `validateApiKey()`, optional `authenticate()` (sets `req.user`), Zod parse, and maps ZodError/JWT/duplicate-key errors to responses. Don't hand-roll try/catch inside handlers.
- `lib/validate-api-key.ts` enforces `x-api-key` on `/api/public` only; `/api/auth` and **all** `/api/admin` are skipped there (admin is guarded by `checkAuth`).
- Zod schemas live in `lib/validation-schema.ts`; pagination via `makePaginate()`.
- `config/database.ts` caches the Mongoose connection on `global.mongoose` and seeds `admin@example.com` / `ChangeMe123!` when no admin exists.

## Conventions

- `@/*` path alias → project root. TypeScript is strict.
- Tailwind CSS v4 (`@import "tailwindcss"`, `@theme inline`, `@custom-variant dark`) + shadcn/ui (New York) in `components/ui/`; merge classes with `cn()` from `@/lib/utils`.
- Route paths are centralized in `config/routes.ts` — link through `routes.*`, don't hardcode strings.
- Uploads: Cloudinary primary (`config/cloudinary.ts`), S3 fallback (`lib/s3.ts`). Remote image hosts must be added to `next.config.ts` `images.remotePatterns`. Server actions have a 20mb body limit.
- Toasts: `react-hot-toast` via `components/custom/`.

## Domain reference

The telco subscription domain (Evina PIN flows 1–4, GetEvinaJS → PinRequest → PinVerify, webhook `ActionStatus` lifecycle, heartbeat/APP_DELETED rules, Hold-to-Initiate, CG callback error codes −72…−80, operator routing) is specified in `AGENTS.md` and `.opencode/skills/telco-subscription.md`. Read those before touching `lib/evina/`, `components/evina-components/`, or subscription flows.

Caveat: those documents are part spec, part implementation notes. Several paths they mention (`lib/whatsapp/`, `lib/heartbeat.ts`, `lib/webhook.ts`, `lib/cg-callback.ts`, `lib/telco/`, `lib/baileys/`, the `LifecycleStatus` model) **do not exist in this repo** — treat them as intended design, not existing code, and verify before referencing.
