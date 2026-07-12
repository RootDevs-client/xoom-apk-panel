# Xoom Sports — Admin Panel & Public API

A full-stack sports news and subscription management platform with an admin dashboard, public REST APIs for mobile apps, and telecom PIN-based subscriber onboarding (Evina).

## Tech Stack

**Core:** Next.js 16 (Turbopack), React 19, TypeScript (strict)  
**Styling:** Tailwind CSS v4, shadcn/ui (New York), Lucide icons  
**Database:** MongoDB + Mongoose 9  
**Auth:** NextAuth v5 (Credentials + JWT), JSON Web Tokens  
**Validation:** Zod 4, react-hook-form  
**State:** Zustand  
**Rich Text:** TipTap 3  
**File Storage:** Cloudinary (primary), AWS S3 (fallback)  
**Charts:** Recharts, TanStack Table  
**OCR:** Groq AI, Google Vision API, Tesseract.js  

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm
- MongoDB instance

### Environment Variables

Copy `.env.example` to `.env.local` and fill in:

| Variable | Description |
|---|---|
| `MONGODB_URI` | MongoDB connection string |
| `NEXTAUTH_SECRET` | JWT signing secret |
| `NEXTAUTH_URL` | Application URL |
| `NEXT_PUBLIC_BASE_URL` | Public-facing base URL |
| `PUBLIC_API_KEY` | API key for public endpoints (`x-api-key` header) |
| `GROQ_API_KEY` | Groq AI API key (OCR) |
| `GOOGLE_VISION_API_KEY` | Google Vision API key (OCR) |
| `AWS_ACCESS_KEY_ID` | AWS S3 access key |
| `AWS_SECRET_ACCESS_KEY` | AWS S3 secret key |
| `AWS_REGION` | AWS region (default: `ap-south-1`) |
| `AWS_BUCKET_NAME` | S3 bucket name |
| `AWS_BASE_URL` | S3 base URL |

### Install & Run

```bash
pnpm install
pnpm dev          # Dev server (Turbopack, HMR)
pnpm build        # Production build
pnpm start        # Production server
```

### Default Admin

On first startup, the app seeds an admin account:

- **Email:** `admin@example.com`
- **Password:** `ChangeMe123!`

Login at `/admin/login`.

## Commands

| Command | Action |
|---|---|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm lint:fix` | ESLint fix (`--max-warnings=0`) |
| `pnpm format` | Prettier write |
| `pnpm format:check` | Prettier check |
| `pnpm type-check` | `tsc --noEmit` |
| `pnpm precommit` | lint-staged |

**Run order:** `pnpm lint:fix` → `pnpm type-check` → `pnpm build`

## Project Structure

```
app/
├── (admin)/           Admin login route group
├── (private)/         Protected dashboard (analytics, CRUD, settings)
├── (public)/          Public pages (landing, privacy, terms, subscription)
└── api/               API routes (admin, public, auth)
actions/               Server actions by domain
components/            UI (shadcn/ui), custom, form, evina components
config/                DB connection, routes, cloudinary, constants
lib/                   Utilities, types, validation schemas, API client
model/                 Mongoose models (User, News, Category, Topic, etc.)
providers/             React context providers
store/                 Zustand stores
```

## API Patterns

All endpoints return `{ status: boolean, message: string, data?, pagination? }`.

- **Admin routes:** JWT Bearer token via `asyncHandler(schema, handler, checkAuth=true)`
- **Public routes:** `x-api-key` header via `asyncHandler(schema, handler)` — auto-validates API key
- **File uploads:** `asyncFormDataHandler(schema, handler)` for multipart FormData

## Routes

### Public Pages

| Route | Description |
|---|---|
| `/` | Landing page |
| `/privacy-policy` | Privacy policy |
| `/terms` | Terms of service |
| `/[phoneNumber]` | Mobile subscription (Evina PIN flow) |

### Admin Pages

| Route | Description |
|---|---|
| `/admin/login` | Login |
| `/admin/dashboard` | Dashboard stats |
| `/admin/dashboard/categories` | Category CRUD |
| `/admin/dashboard/topics` | Topic CRUD |
| `/admin/dashboard/news` | News articles CRUD |
| `/admin/dashboard/subscription` | Subscription management |
| `/admin/dashboard/analytics` | Event analytics |
| `/admin/dashboard/settings` | App settings |
| `/admin/dashboard/promotion-methods` | Operator promo config |

### Public API (requires `x-api-key`)

- `GET /api/public/news` — Published news
- `GET /api/public/categories` — Categories
- `GET /api/public/topics` — Topics
- `POST /api/public/subscribe` — Create subscription
- `POST /api/public/subscribe/check` — Check subscription status
- `POST /api/public/unsubscribe` — Unsubscribe
- `GET /api/public/settings` — Public settings
- `POST /api/public/event` — Record analytics event
- `POST /api/public/ocr/groq` — OCR via Groq
- `POST /api/public/ocr/google` — OCR via Google Vision
- `POST /api/public/kuwait/pin-request` — Request Evina PIN
- `POST /api/public/kuwait/pin-verify` — Verify Evina PIN

### Admin API (requires JWT Bearer)

- `POST /api/admin/auth/login` — Login
- `GET /api/admin/auth/me` — Get profile
- `PATCH /api/admin/auth/password` — Change password
- Full CRUD for categories, topics, news, subscriptions, settings, promotion methods
- `GET /api/admin/dashboard/stats` — Dashboard stats
- `GET /api/admin/event/analytics` — Event analytics
- `POST /api/admin/upload` — File upload

## Models

- **users** — Admin accounts (bcrypt)
- **events** — App analytics (firstopen, appopen, appclose)
- **categories** — News categories (name, slug, icon)
- **topics** — News topics (name, slug, icon)
- **news** — Articles with category/topic refs
- **subscribes** — Subscriber records
- **promotionmethods** — Operator promotion config
- **settings** — Singleton (general, privacyPolicy, termsOfService)

## Evina PIN Flow

Subscriber onboarding uses Evina telecom PIN verification:

1. User enters phone number → `phone` step
2. PIN request sent → `pin` step
3. PIN verified → `success` step

Implemented as React components (`components/evina-components/`) and a standalone HTML template (`templates/kuwait.html`).
