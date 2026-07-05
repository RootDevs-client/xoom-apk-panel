"use server";

import { apiClient } from "@/lib/api-client";

export interface CategoryFormData {
  name: string;
  icon?: string | null;
}

export async function getCategoryList(
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

    const res = await apiClient(`/api/admin/categories?${params.toString()}`, {
      method: "GET",
      tags: ["categories"],
    });

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to get category list",
      data: { categories: [], pagination: {} },
    };
  }
}

export async function createCategory(data: CategoryFormData) {
  try {
    const res = await apiClient("/api/admin/categories", {
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
        error instanceof Error ? error.message : "Failed to create category",
    };
  }
}

export async function updateCategory(id: string, data: CategoryFormData) {
  try {
    const res = await apiClient(`/api/admin/categories/${id}`, {
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
        error instanceof Error ? error.message : "Failed to update category",
    };
  }
}

export async function deleteCategory(id: string) {
  try {
    const res = await apiClient(`/api/admin/categories/${id}`, {
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
        error instanceof Error ? error.message : "Failed to delete category",
    };
  }
}
