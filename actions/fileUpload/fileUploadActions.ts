"use server";

import { apiClient } from "@/lib/api-client";
import { updateTag } from "next/cache";

interface UploadResponse {
  status: boolean;
  message: string;
  data: any;
}

export async function uploadFile(formData: FormData): Promise<{
  status: boolean;
  message: string;
  data: { url: string } | null;
}> {
  try {
    const res: UploadResponse = await apiClient("/api/admin/upload", {
      method: "POST",
      body: formData,
      isFormData: true,
    });

    if (!res.status || !res.data) {
      return {
        status: false,
        message: res.message ?? "Upload failed",
        data: null,
      };
    }

    //  Directly use backend URL
    const url = res.data?.key;

    if (!url) {
      return {
        status: false,
        message: "Upload succeeded but no url returned",
        data: null,
      };
    }

    updateTag("settings");

    return {
      status: true,
      message: "Uploaded successfully",
      data: { url },
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
