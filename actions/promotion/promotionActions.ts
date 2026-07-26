"use server";

import { apiClient } from "@/lib/api-client";

export interface PromotionFormData {
  name: string;
  icon?: string | null;
  slug?: string;
}

export async function getPromotionList(
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

    const res = await apiClient(
      `/admin/promotion-category?${params.toString()}`,
      {
        method: "GET",
        tags: ["promotion"],
      },
    );

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to get promotion list",
      data: [],
    };
  }
}

export async function createPromotion(data: PromotionFormData) {
  try {
    const res = await apiClient("/admin/promotion-category", {
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
      message: error instanceof Error ? error.message : "Failed to create promotion",
    };
  }
}

export async function updatePromotion(
  id: string,
  data: Partial<PromotionFormData>,
) {
  try {
    const res = await apiClient(`/admin/promotion-category/${id}`, {
      method: "PUT",
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
        error instanceof Error ? error.message : "Failed to update promotion",
    };
  }
}

export async function getPromotionById(id: string) {
  try {
    const res = await apiClient(`/admin/promotion-category/${id}`, {
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
        error instanceof Error ? error.message : "Failed to get promotion",
    };
  }
}

export async function deletePromotion(id: string) {
  try {
    const res = await apiClient(`/admin/promotion-category/${id}`, {
      method: "DELETE",
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to delete promotion",
    };
  }
}
