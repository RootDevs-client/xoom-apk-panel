"use server";

import { apiClient } from "@/lib/api-client";

export type ConfigItemInput = {
  key: string;
  label: string;
  type: "string" | "number" | "boolean";
  value: any;
  required: boolean;
};

export type CreateTelcoOperatorInput = {
  name: string;
  code: string;
  country: string;
  evinaEnabled?: boolean;
  telcoParameterValues?: string;
  variant?: "STANDARD" | "EVINA" | "CG_CALLBACK";
  pinLocation?: "TELCO_PAGE" | "OUR_PAGE";
  configs?: ConfigItemInput[];
  is_active?: boolean;
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

    const res = await apiClient(`/api/admin/telco-operators?${params.toString()}`, {
      method: "GET",
      tags: ["telco-operators"],
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
    const res = await apiClient("/api/admin/telco-operators", {
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
        error instanceof Error ? error.message : "Failed to create operator",
    };
  }
}

export async function updateTelcoOperator(
  id: string,
  data: UpdateTelcoOperatorInput,
) {
  try {
    const res = await apiClient(`/api/admin/telco-operators/${id}`, {
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
        error instanceof Error ? error.message : "Failed to update operator",
    };
  }
}

export async function deleteTelcoOperator(id: string) {
  try {
    const res = await apiClient(`/api/admin/telco-operators/${id}`, {
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
        error instanceof Error ? error.message : "Failed to delete operator",
    };
  }
}
