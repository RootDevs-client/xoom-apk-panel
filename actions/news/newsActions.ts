"use server";

import { apiClient } from "@/lib/api-client";

export interface NewsFormData {
  title: string;
  description: string;
  image?: string;
  icon?: string;
  categories: string[];
  topics: string[];
  publishedDate: string;
}

export async function getNewsList(
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

    const res = await apiClient(`/api/admin/news?${params.toString()}`, {
      method: "GET",
      tags: ["news"],
    });

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to get news list",
      data: { news: [], pagination: {} },
    };
  }
}

export async function createNews(data: NewsFormData) {
  try {
    const res = await apiClient("/api/admin/news", {
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
        error instanceof Error ? error.message : "Failed to create news",
    };
  }
}

export async function updateNews(id: string, data: Partial<NewsFormData>) {
  try {
    const res = await apiClient(`/api/admin/news/${id}`, {
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
        error instanceof Error ? error.message : "Failed to update news",
    };
  }
}

export async function getNewsById(id: string) {
  try {
    const res = await apiClient(`/api/admin/news/${id}`, {
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
        error instanceof Error ? error.message : "Failed to get news",
    };
  }
}

export async function deleteNews(id: string) {
  try {
    const res = await apiClient(`/api/admin/news/${id}`, {
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
        error instanceof Error ? error.message : "Failed to delete news",
    };
  }
}
