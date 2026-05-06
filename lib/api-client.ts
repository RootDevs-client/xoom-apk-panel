import { auth, signOut } from "@/app/api/auth/[...nextauth]/auth";
import { routes } from "@/config/routes";
import { redirect } from "next/navigation";

type FetchOptions<TBody> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  tags?: string[];
  cache?: "force-cache" | "no-store";
  isFormData?: boolean;
  revalidate?: number | false;
  isPublic?: boolean;
};

export async function apiClient<TResponse = any, TBody = undefined>(
  url: string,
  options: FetchOptions<TBody> = {},
): Promise<TResponse> {
  const {
    method = "GET",
    body,
    tags,
    cache,
    isFormData = false,
    revalidate,
    isPublic = false,
  } = options;

  try {
    const session = await auth();
    const token = session?.token;

    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const headers: HeadersInit = {};

    // ── Admin routes → send JWT ──
    if (!isPublic) {
      const session = await auth();
      const token = session?.token;
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    // ── Public routes → send API key ──
    if (isPublic) {
      headers["x-api-key"] = process.env.NEXT_PUBLIC_API_KEY || "";
    }

    if (!isFormData && body) {
      headers["Content-Type"] = "application/json";
    }

    const isMutation =
      method === "POST" ||
      method === "PUT" ||
      method === "PATCH" ||
      method === "DELETE";

    const fetchOptions: RequestInit = {
      method,
      headers,
      body: isFormData
        ? (body as any)
        : body
          ? JSON.stringify(body)
          : undefined,
    };

    if (isMutation) {
      fetchOptions.cache = "no-store";
    } else {
      if (cache) {
        fetchOptions.cache = cache;
      }
      if (tags || revalidate !== undefined) {
        fetchOptions.next = {
          ...(tags && { tags }),
          ...(revalidate !== undefined && { revalidate }),
        };
      }
    }

    const res = await fetch(`${baseURL}${url}`, fetchOptions);

    if (!res.ok) {
      if (res?.status === 401 && !isPublic) {
        await signOut({ redirect: false });
        redirect(routes.publicRoutes.adminLogin);
      }

      let errorMessage = `HTTP error! status: ${res.status}`;
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        const errorText = await res.text();
        errorMessage = errorText || errorMessage;
      }

      throw new Error(errorMessage);
    }

    return res.json();
  } catch (error) {
    if ((error as any)?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred!";
    throw new Error(errorMessage);
  }
}
