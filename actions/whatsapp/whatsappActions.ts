"use server";

import { apiClient } from "@/lib/api-client";

export async function getWhatsAppSessions(
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
      `/api/admin/whatsapp/sessions?${params.toString()}`,
      { method: "GET", tags: ["whatsapp-sessions"] },
    );

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch channels",
      data: { sessions: [], pagination: {} },
    };
  }
}

export async function createWhatsAppSession(data: { name: string }) {
  try {
    const res = await apiClient("/api/admin/whatsapp/sessions", {
      method: "POST",
      body: data,
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to create channel",
    };
  }
}

export async function updateWhatsAppSession(
  id: string,
  data: { name?: string },
) {
  try {
    const res = await apiClient(`/api/admin/whatsapp/sessions/${id}`, {
      method: "PATCH",
      body: data,
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to update channel",
    };
  }
}

export async function deleteWhatsAppSession(id: string) {
  try {
    const res = await apiClient(`/api/admin/whatsapp/sessions/${id}`, {
      method: "DELETE",
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to delete channel",
    };
  }
}

export async function getWhatsAppMessages(
  page: number,
  limit: number,
  conversationId: string,
) {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      conversationId: conversationId || "",
    });

    const res = await apiClient(
      `/api/admin/whatsapp/messages?${params.toString()}`,
      { method: "GET", tags: ["whatsapp-messages"] },
    );

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch messages",
      data: { messages: [], pagination: {} },
    };
  }
}

export async function sendWhatsAppMessage(data: {
  sessionId: string;
  remoteJid: string;
  body: string;
}) {
  try {
    const res = await apiClient("/api/admin/whatsapp/send", {
      method: "POST",
      body: data,
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

export async function getWhatsAppConversations(
  sessionId: string,
  page: number,
  limit: number,
  search: string,
) {
  try {
    const params = new URLSearchParams({
      sessionId: sessionId || "",
      page: String(page),
      limit: String(limit),
      search: search || "",
    });

    const res = await apiClient(
      `/api/admin/whatsapp/conversations?${params.toString()}`,
      { method: "GET", tags: ["whatsapp-conversations"] },
    );

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch conversations",
      data: { conversations: [], pagination: {} },
    };
  }
}

export async function disconnectWhatsAppChannel(id: string) {
  try {
    const res = await apiClient(
      `/api/admin/whatsapp/sessions/${id}/disconnect`,
      { method: "POST" },
    );
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to disconnect channel",
    };
  }
}

export async function reconnectWhatsAppChannel(id: string) {
  try {
    const res = await apiClient(
      `/api/admin/whatsapp/sessions/${id}/reconnect`,
      { method: "POST" },
    );
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to reconnect channel",
    };
  }
}
