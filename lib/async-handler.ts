import dbConnect from "@/config/database";
import { JsonWebTokenError } from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authenticate } from "./authenticate";
import { apiResponse } from "./utils";
import { validateApiKey } from "./validate-api-key";

// Updated handler types with params
export type ApiHandler<T, P = Record<string, string>> = (
  req: NextRequest,
  data: T,
  params: P,
) => Promise<NextResponse>;

export type SimpleHandler<P = Record<string, string>> = (
  req: NextRequest,
  params: P,
) => Promise<NextResponse>;

// Overload 1: With validation
export function asyncHandler<T, P = Record<string, string>>(
  schema: z.ZodSchema<T>,
  handler: ApiHandler<T, P>,
  checkAuth?: boolean,
): (req: NextRequest, context: { params: Promise<P> }) => Promise<NextResponse>;

// Overload 2: Without validation
export function asyncHandler<P = Record<string, string>>(
  handler: SimpleHandler<P>,
  checkAuth?: boolean,
): (req: NextRequest, context: { params: Promise<P> }) => Promise<NextResponse>;

// Implementation
export function asyncHandler<T, P = Record<string, string>>(
  schemaOrHandler: z.ZodSchema<T> | SimpleHandler<P>,
  handlerOrCheckAuth?: ApiHandler<T, P> | boolean,
  checkAuth?: boolean,
): (
  req: NextRequest,
  context: { params: Promise<P> },
) => Promise<NextResponse> {
  // Determine which overload is being used
  const isValidationCase =
    handlerOrCheckAuth !== undefined && typeof handlerOrCheckAuth !== "boolean";

  // Case 1: With validation (schema + handler + optional checkAuth)
  if (isValidationCase && schemaOrHandler instanceof z.ZodType) {
    const schema = schemaOrHandler;
    const handler = handlerOrCheckAuth as ApiHandler<T, P>;
    const shouldCheckAuth = checkAuth ?? false;

    return async (req: NextRequest, context: { params: Promise<P> }) => {
      try {
        await dbConnect();

        //  API key check — public routes only
        const apiKeyError = validateApiKey(req);
        if (apiKeyError) return apiKeyError;

        // JWT check — protected routes only
        if (shouldCheckAuth) {
          const { error, data } = await authenticate(req);
          if (error) return error;
          req.user = data;
        }

        // Await params from context
        const params = await context.params;

        const body = await req.json();
        const data = schema.parse(body);

        return await handler(req, data, params);
      } catch (error) {
        if (error instanceof z.ZodError) {
          const details = error.issues.reduce(
            (acc, issue) => {
              const field = issue.path.join(".") || "general";
              acc[field] = issue.message;
              return acc;
            },
            {} as Record<string, string>,
          );

          return apiResponse(false, 400, "Request validation failed!", details);
        }

        if (error instanceof JsonWebTokenError) {
          return apiResponse(false, 401, "Unauthorized Token!");
        }

        console.error(error);
        return apiResponse(false, 500, "Something went wrong!");
      }
    };
  }

  // Case 2: Without validation (just handler + optional checkAuth)
  const simpleHandler = schemaOrHandler as SimpleHandler<P>;
  const shouldCheckAuth =
    typeof handlerOrCheckAuth === "boolean" ? handlerOrCheckAuth : false;

  return async (req: NextRequest, context: { params: Promise<P> }) => {
    try {
      await dbConnect();

      // API key check — public routes only
      const apiKeyError = validateApiKey(req);
      if (apiKeyError) return apiKeyError;

      // JWT check — protected routes only
      if (shouldCheckAuth) {
        const { error, data } = await authenticate(req);
        if (error) return error;
        req.user = data;
      }

      // Await params from context
      const params = await context.params;

      return await simpleHandler(req, params);
    } catch (err) {
      if (err instanceof JsonWebTokenError) {
        return apiResponse(false, 401, "Unauthorized Token!");
      }
      console.error(err);
      return apiResponse(false, 500, "Something went wrong!");
    }
  };
}
