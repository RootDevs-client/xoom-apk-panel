"use server";

import { apiClient } from "@/lib/api-client";

export async function getMetaChannels(page: number, limit: number, search: string) {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: search || "",
    });
    const res = await apiClient(
      `/api/admin/whatsapp-meta/channels?${params.toString()}`,
      { method: "GET", tags: ["meta-channels"] },
    );
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to fetch channels",
      data: { channels: [], pagination: {} },
    };
  }
}

export async function createMetaChannel(data: { name: string; phoneNumberId: string; accessToken: string; webhookSecret?: string }) {
  try {
    const res = await apiClient("/api/admin/whatsapp-meta/channels", {
      method: "POST",
      body: data,
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to create channel",
    };
  }
}

export async function updateMetaChannel(id: string, data: { name?: string; phoneNumberId?: string; accessToken?: string; webhookSecret?: string }) {
  try {
    const res = await apiClient(`/api/admin/whatsapp-meta/channels/${id}`, {
      method: "PATCH",
      body: data,
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to update channel",
    };
  }
}

export async function deleteMetaChannel(id: string) {
  try {
    const res = await apiClient(`/api/admin/whatsapp-meta/channels/${id}`, {
      method: "DELETE",
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to delete channel",
    };
  }
}

export async function verifyMetaChannel(id: string) {
  try {
    const res = await apiClient(`/api/admin/whatsapp-meta/channels/${id}/verify`, {
      method: "POST",
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to verify channel",
    };
  }
}

export async function sendMetaMessage(data: {
  channelId: string;
  remoteJid: string;
  body: string;
  mediaType?: string;
  mediaUrl?: string;
  fileName?: string;
}) {
  try {
    const res = await apiClient("/api/admin/whatsapp-meta/send", {
      method: "POST",
      body: data,
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to send message",
    };
  }
}

export async function getMetaConversations(channelId: string, page: number, limit: number, search: string) {
  try {
    const params = new URLSearchParams({
      channelId: channelId || "",
      page: String(page),
      limit: String(limit),
      search: search || "",
    });
    const res = await apiClient(
      `/api/admin/whatsapp-meta/conversations?${params.toString()}`,
      { method: "GET", tags: ["meta-conversations"] },
    );
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to fetch conversations",
      data: { conversations: [], pagination: {} },
    };
  }
}

export async function getMetaMessages(conversationId: string, page: number, limit: number) {
  try {
    const params = new URLSearchParams({
      conversationId: conversationId || "",
      page: String(page),
      limit: String(limit),
    });
    const res = await apiClient(
      `/api/admin/whatsapp-meta/messages?${params.toString()}`,
      { method: "GET", tags: ["meta-messages"] },
    );
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to fetch messages",
      data: { messages: [], pagination: {} },
    };
  }
}

export async function updateMetaConversationName(id: string, displayName: string) {
  try {
    const res = await apiClient(`/api/admin/whatsapp-meta/conversations/${id}`, {
      method: "PATCH",
      body: { displayName },
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to update conversation name",
    };
  }
}

export async function deleteMetaConversation(id: string) {
  try {
    const res = await apiClient(`/api/admin/whatsapp-meta/conversations/${id}`, {
      method: "DELETE",
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to delete conversation",
    };
  }
}

export async function deleteMetaMessage(id: string) {
  try {
    const res = await apiClient(`/api/admin/whatsapp-meta/messages/${id}`, {
      method: "DELETE",
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Failed to delete message",
    };
  }
}
