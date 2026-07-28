import { apiClient } from "@/lib/api-client";

export async function getEvinaSession() {
  try {
    const res = await apiClient(`/public/subscription/session/`, {
      method: "GET",
      isPublic: true,
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to get evina session",
      data: null,
    };
  }
}

export async function getSubscriptionBySession(sessionId: string) {
  try {
    const res = await apiClient(`/public/subscription/session/${sessionId}`, {
      method: "GET",
      isPublic: true,
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
          : "Failed to get subscription by session",
      data: null,
    };
  }
}

export async function initiateTelcoPin(payload: {
  msisdn: string;
  userTelcoServiceId: string;
  adAgencyCampaignId: string;
  adAgencyCampaignTransactionId: string;
  ua: string;
}) {
  try {
    const res = await apiClient(`/public/telco-pin/initiate`, {
      method: "POST",
      body: payload,
      isPublic: true,
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to initiate telco pin",
      data: null,
    };
  }
}

export async function submitTelcoOtp(payload: {
  otp: string;
  transactionId: string;
}) {
  try {
    const res = await apiClient(`/public/telco-pin/submit-otp`, {
      method: "POST",
      body: payload,
      isPublic: true,
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to submit telco otp",
      data: null,
    };
  }
}
