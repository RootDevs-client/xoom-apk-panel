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
- `app/(private)/` — protected admin dashboard routes (sidebar, stats, CRUD for categories/topics/news/subscriptions/settings/analytics)
- `app/(public)/` — public landing page, terms, privacy
- `app/api/admin/` — admin API (auth, CRUD endpoints)
- `app/api/public/` — public API (requires `x-api-key` header)
- `app/api/auth/[...nextauth]/` — NextAuth handlers + auth() singleton
- `actions/` — server actions, organized by domain
- `components/` — shadcn/ui + custom components
- `config/` — dbConnect, routes, cloudinary, constants
- `lib/` — utils, types, api-client, async-handler, validation schemas, evina, s3
- `model/` — Mongoose models (User, Event, Category, Topic, News, Subscribe, PromotionMethod, Settings)
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
- `subscribes` — subscriber records (phone unique, reference unique)
- `promotionmethods` — operator promotion config
- `settings` — singleton doc with general, privacyPolicy, termsOfService subdocs

## Key conventions

- `@/*` path alias maps to project root
- API route handlers: `asyncHandler` + Zod schema in `validation-schema.ts`
- API input: zod schemas in `@/lib/validation-schema.ts`
- `cn()` from `@/lib/utils` for class merging
- Tailwind v4: `@theme inline` blocks, `@custom-variant dark`, `@import "tailwindcss"`
- Fonts: DM Sans (body) + Urbanist (headings) via CSS variables
- API authentication: `checkAuth` param on `asyncHandler`. Public routes validated via `x-api-key`.
- `extractFormData()` / `convertToFormData()` helpers parse complex FormData with nested keys like `items[0].name`

## Evina (telecom pin verification)

- `lib/evina/evina.ts` — injects SDK script, polls `window.evina_notify`
- Flow: phone screen → PIN screen → success
- SubscriptionPage orchestrates via step state machine (`phone` → `pin` → `success`)

## Env requirements

See `.env.example`. Key vars: MONGODB_URI, NEXTAUTH_SECRET, cloudinary/S3 credentials, PUBLIC_API_KEY (for public API routes).
