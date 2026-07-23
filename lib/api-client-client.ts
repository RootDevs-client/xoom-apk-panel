import { getSession, signOut } from "next-auth/react";
import { routes } from "@/config/routes";

type FetchOptions<TBody> = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: TBody;
  isFormData?: boolean;
  isPublic?: boolean;
};

export async function apiClientClient<TResponse = any, TBody = undefined>(
  url: string,
  options: FetchOptions<TBody> = {},
): Promise<TResponse> {
  const { method = "GET", body, isFormData = false, isPublic = false } = options;

  const baseURL =
    process.env.NEXT_PUBLIC_BASE_URL_BACKEND ||
    "http://192.168.66.66:8000/api/v1";

  const headers: Record<string, string> = {};

  if (!isPublic) {
    const session = await getSession();
    const token = (session as any)?.token;
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  if (isPublic) {
    headers["x-api-key"] = process.env.NEXT_PUBLIC_API_KEY || "";
  }

  if (!isFormData && body) {
    headers["Content-Type"] = "application/json";
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    body: isFormData
      ? (body as any)
      : body
        ? JSON.stringify(body)
        : undefined,
  };

  const res = await fetch(`${baseURL}${url}`, fetchOptions);

  if (!res.ok) {
    if (res.status === 401 && !isPublic) {
      await signOut({ redirect: false });
      window.location.href = routes.publicRoutes.adminLogin;
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
}
