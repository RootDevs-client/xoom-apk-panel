"use server";

import { apiClient } from "@/lib/api-client";

export async function getPromotionMethodList(
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

    const res = await apiClient(`/api/admin/promotion-methods?${params.toString()}`, {
      method: "GET",
      tags: ["promotion-methods"],
    });

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to get promotion method list",
      data: { promotionMethods: [], pagination: {} },
    };
  }
}

export async function createPromotionMethod(data: {
  operator: string;
  promotional?: boolean;
  non_promotional?: boolean;
  is_active?: boolean;
}) {
  try {
    const res = await apiClient("/api/admin/promotion-methods", {
      method: "POST",
      body: data,
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to create promotion method",
    };
  }
}

export async function updatePromotionMethod(
  id: string,
  data: {
    operator?: string;
    promotional?: boolean;
    non_promotional?: boolean;
    is_active?: boolean;
  },
) {
  try {
    const res = await apiClient(`/api/admin/promotion-methods/${id}`, {
      method: "PATCH",
      body: data,
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to update promotion method",
    };
  }
}

export async function deletePromotionMethod(id: string) {
  try {
    const res = await apiClient(`/api/admin/promotion-methods/${id}`, {
      method: "DELETE",
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to delete promotion method",
    };
  }
}
