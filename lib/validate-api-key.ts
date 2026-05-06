// lib/validate-api-key.ts
import { NextRequest, NextResponse } from "next/server";
import { apiResponse } from "./server.utils";

const PUBLIC_ROUTES = ["/api/public"];

const SKIP_ROUTES = [
  "/api/auth",
  "/api/admin", // skip ALL admin routes — not just login
];

export function shouldCheckApiKey(pathname: string): boolean {
  // ── skip routes — no API key check ──
  const isSkipped = SKIP_ROUTES.some((route) => pathname.startsWith(route));
  if (isSkipped) return false;

  // ── public routes — need API key ──
  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  return isPublic;
}

export function validateApiKey(req: NextRequest): NextResponse | null {
  const pathname = req.nextUrl.pathname;
  const shouldCheck = shouldCheckApiKey(pathname);
  // ── add this temporarily to debug ──

  if (!shouldCheck) return null;

  const apiKey = req.headers.get("x-api-key");

  if (!apiKey) {
    return apiResponse(false, 401, "API key is required!");
  }

  if (apiKey !== process.env.PUBLIC_API_KEY) {
    return apiResponse(false, 403, "Invalid API key!");
  }

  return null; // ✅ valid
}
