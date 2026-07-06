"use server";

import { apiClient } from "@/lib/api-client";
export interface TopicsFormData {
  name: string;
  icon?: string | null;
}

export async function getTopicList(
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

    const res = await apiClient(`/api/admin/topics?${params.toString()}`, {
      method: "GET",
      tags: ["topics"],
    });

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to get topic list",
      data: { topics: [], pagination: {} },
    };
  }
}

export async function createTopic(data: TopicsFormData) {
  try {
    const res = await apiClient("/api/admin/topics", {
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
        error instanceof Error ? error.message : "Failed to create topic",
    };
  }
}

export async function updateTopic(id: string, data: TopicsFormData) {
  try {
    const res = await apiClient(`/api/admin/topics/${id}`, {
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
        error instanceof Error ? error.message : "Failed to update topic",
    };
  }
}

export async function deleteTopic(id: string) {
  try {
    const res = await apiClient(`/api/admin/topics/${id}`, {
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
        error instanceof Error ? error.message : "Failed to delete topic",
    };
  }
}
