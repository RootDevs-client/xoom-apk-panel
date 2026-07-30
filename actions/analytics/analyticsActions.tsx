"use server";

import { apiClient } from "@/lib/api-client";

export async function getSubscribeAnalytics() {
  try {
    const res = await apiClient(`/admin/subscribe/analytics`, {
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
export async function getAdminDashboardAnalytics() {
  try {
    const res = await apiClient(`/admin/analytics/dashboard`, {
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
          : "Failed to get admin dashboard analytics",
      data: [],
    };
  }
}
export async function getUninstallAnalytics(from?: string, to?: string) {
  try {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const queryString = params.toString();
    const url = `/admin/analytics/uninstall${queryString ? `?${queryString}` : ""}`;

    const res = await apiClient(url, {
      method: "GET",
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
          : "Failed to get uninstall analytics",
      data: { downloads: 0, deleted: 0, uninstallRate: 0 },
    };
  }
}

export async function getEventAnalytics(from?: string, to?: string) {
  try {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const queryString = params.toString();
    const url = `/admin/analytics/events${queryString ? `?${queryString}` : ""}`;

    const res = await apiClient(url, {
      method: "GET",
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
          : "Failed to get event analytics",
      data: [],
    };
  }
}

export async function getDeviceModels(from?: string, to?: string) {
  try {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    const queryString = params.toString();
    const url = `/admin/analytics/models${queryString ? `?${queryString}` : ""}`;

    const res = await apiClient(url, {
      method: "GET",
    });

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to get device models",
      data: [],
    };
  }
}
