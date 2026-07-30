"use server";

import { apiClient } from "@/lib/api-client";

export async function getDeviceList(
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

    const res = await apiClient(`/admin/device?${params.toString()}`, {
      method: "GET",
      tags: ["devices"],
    });

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to get device list",
      data: { devices: [], pagination: {} },
    };
  }
}
