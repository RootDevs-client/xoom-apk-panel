"use server";

import { apiClient } from "@/lib/api-client";
import { updateTag } from "next/cache";

export async function getAdminProfile() {
  try {
    const res = await apiClient("/admin/auth/me", {
      method: "GET",
      tags: ["profile"],
      cache: "no-store",
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to get admin profile",
      data: [],
    };
  }
}

export async function updateAdminProfile(data: any) {
  try {
    const res = await apiClient(`/admin/auth/me`, {
      method: "PUT",
      body: data,
    });

    if (res?.status) {
      updateTag("profile");
    }
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
          : "Failed to update updateAdminProfile",
      data: null,
    };
  }
}

export async function updateAdminPassword(data: any) {
  try {
    const res = await apiClient(`/admin/auth/password`, {
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
        error instanceof Error
          ? error.message
          : "Failed to update updateAdminPassword",
      data: null,
    };
  }
}
