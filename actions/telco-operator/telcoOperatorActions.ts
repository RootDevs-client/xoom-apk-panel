"use server";

import { apiClient } from "@/lib/api-client";
import { updateTag } from "next/cache";

export type CgElementInput = {
  label: string;
  id: string;
  type:
    | "button"
    | "checkbox"
    | "input"
    | "form"
    | "submit"
    | "link"
    | "div"
    | "custom";
  order: number;
};

export type HoldSettingsInput = {
  duration?: number;
  unit?: "minute" | "hour" | "day";
};

export type ProviderSettingsInput = {
  mode?: "instant" | "hold" | "hold_until_admin_change";
  hold?: HoldSettingsInput;
};

export type CreateTelcoOperatorInput = {
  name: string;
  code: string;
  country: string;
  telcoParameterValues?: string;
  variant?: "STANDARD" | "EVINA" | "CG_CALLBACK";
  configs?: CgElementInput[];
  settings?: ProviderSettingsInput;
  isActive?: boolean;
};

export type UpdateTelcoOperatorInput = Partial<CreateTelcoOperatorInput>;

export async function getTelcoOperatorList(
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

    const res = await apiClient(`/admin/telco-provider?${params.toString()}`, {
      method: "GET",
      tags: ["telco-operators"],
      cache: "force-cache",
    });

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to get operator list",
      data: { telcoOperators: [], pagination: {} },
    };
  }
}

export async function createTelcoOperator(data: CreateTelcoOperatorInput) {
  try {
    const res = await apiClient("/admin/telco-provider", {
      method: "POST",
      body: data,
    });
    if (res?.status) {
      updateTag("telco-operators");
    }
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to create operator",
    };
  }
}

export async function updateTelcoOperator(
  id: string,
  data: UpdateTelcoOperatorInput,
) {
  try {
    const res = await apiClient(`/admin/telco-provider/${id}`, {
      method: "PUT",
      body: data,
    });
    if (res?.status) {
      updateTag("telco-operators");
    }

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to update operator",
    };
  }
}

export async function deleteTelcoOperator(id: string) {
  try {
    const res = await apiClient(`/admin/telco-provider/${id}`, {
      method: "DELETE",
    });
    if (res?.status) {
      updateTag("telco-operators");
    }
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to delete operator",
    };
  }
}
