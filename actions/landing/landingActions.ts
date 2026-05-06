"use server";

import { apiClient } from "@/lib/api-client";

export async function getAllSettingsDetails(context: string) {
  try {
    const res = await apiClient(`/api/public/settings?context=${context}`, {
      method: "GET",
      tags: ["settings"],
      cache: "force-cache",
      isPublic: true,
    });
    return res;
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to get general setting data",
      data: null,
    };
  }
}
