"use server";

import { apiClient } from "@/lib/api-client";

export async function getSubscribeAnalytics() {
  try {
    const res = await apiClient(`/api/admin/subscribe/analytics`, {
      method: "GET",
      //   tags: ["contact-us"],
      //   cache: "no-store",
    });

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get subscribe analytics",
      data: [],
    };
  }
}
