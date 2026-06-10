"use server";

import { apiClient } from "@/lib/api-client";

export async function handleLogin(formData: FormData) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) {
      return { error: "Email and password are required." };
    }

    const res = await apiClient(`/admin/auth/login`, {
      method: "POST",
      body: { email, password },
    });

    if (!res?.status) {
      return {
        error: res?.message || "Invalid credentials",
      };
    }

    const token = res?.data?.accessToken;

    // Return success result
    return { success: true, token };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return { error: errorMessage };
  }
}
