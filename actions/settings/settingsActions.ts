"use server";
import { apiClient } from "@/lib/api-client";
import { updateTag } from "next/cache";

// general settings
export async function getGeneralSettings() {
  try {
    const res = await apiClient(`/admin/settings`, {
      method: "GET",
      tags: ["settings"],
      cache: "force-cache",
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
          : "Failed to get general settings list",
      data: null,
    };
  }
}

export async function updateGeneralSettings(data: any) {
  try {
    // Both create and update use PUT method
    const endpoint = `/admin/settings/general`;

    const res = await apiClient(endpoint, {
      method: "PUT",
      body: data,
      // isFormData: false,
    });

    if (res?.status) {
      updateTag("settings");
    }

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      status: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to save generalSettings",
      data: null,
    };
  }
}

export async function getAllSettingsDetails(context: string) {
  try {
    const res = await apiClient(`/settings?context=${context}`, {
      method: "GET",
      tags: ["settings"],
      cache: "force-cache",
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
          : "Failed to get general setting data",
      data: null,
    };
  }
}
