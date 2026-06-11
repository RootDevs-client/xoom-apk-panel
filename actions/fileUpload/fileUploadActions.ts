"use server";

import { apiClient } from "@/lib/api-client";
import { updateTag } from "next/cache";

interface UploadResult {
  imageId: string;
  url: string;
}

interface UploadResponse {
  status: boolean;
  message: string;
  // The API returns uploadImage(file) result directly as data —
  // could be { url, path } or { single: { url, imageId } } depending on the util
  data: any;
}

export async function uploadFile(formData: FormData): Promise<{
  status: boolean;
  message: string;
  data: { path: string } | null;
}> {
  try {
    const res: UploadResponse = await apiClient("/api/admin/upload", {
      method: "POST",
      body: formData,
      isFormData: true,
    });

    if (res.status && res.data) {
      // uploadImage can return { url, path } directly or { single: { url, imageId } }
      const raw =
        res.data?.path ?? // { path: "files/xxx.png" }
        res.data?.url ?? // { url: "https://..." }
        res.data?.single?.url ?? // { single: { url } }
        res.data?.single?.imageId ?? // { single: { imageId } }
        "";

      if (!raw) {
        return {
          status: false,
          message: "Upload succeeded but no path returned",
          data: null,
        };
      }

      // Strip using AWS_BASE_URL env var for a precise match
      const baseUrl = (process.env.AWS_BASE_URL ?? "").replace(/\/$/, "");
      const path =
        baseUrl && raw.startsWith(baseUrl)
          ? raw.slice(baseUrl.length).replace(/^\//, "") // "files/xxx.png"
          : raw.startsWith("http")
            ? raw.replace(/^https?:\/\/[^/]+\//, "") // fallback
            : raw;

      updateTag("settings");
      return { status: true, message: "Uploaded successfully", data: { path } };
    }

    return {
      status: false,
      message: res.message ?? "Upload failed",
      data: null,
    };
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      status: false,
      message: error instanceof Error ? error.message : "Failed to upload file",
      data: null,
    };
  }
}
