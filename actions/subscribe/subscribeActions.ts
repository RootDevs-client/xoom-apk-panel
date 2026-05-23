"use server";

import { apiClient } from "@/lib/api-client";

export async function getSubscribeList(
  page: number,
  limit: number,
  search: string,
) {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: search || "",
    });

    const res = await apiClient(`/api/admin/subscribe?${params.toString()}`, {
      method: "GET",
      tags: ["subscribe"],
    });

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to get subscribe list",
      data: [],
    };
  }
}

export async function cancelSubscription(id: string) {
  try {
    const res = await apiClient(`/api/admin/subscribe/${id}/unsubscribe`, {
      method: "POST",
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
          : "Failed to cancel subscription",
    };
  }
}
