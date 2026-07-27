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

    const res = await apiClient(`/admin/whatsapp-account`, {
      method: "GET",
      tags: ["whatsapp-sessions"],
    });

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

export async function getWhatsAppChannels(
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

    const res = await apiClient(`/admin/whatsapp-channel`, {
      method: "GET",
      tags: ["whatsapp-channel"],
    });
    console.log("response====", res);

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

export async function getWhatsAppChannelList(
  page: number,
  limit: number,
  search: string,
  accountId?: string,
) {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      search: search || "",
    });
    if (accountId) params.set("accountId", accountId);

    const res = await apiClient(`/admin/whatsapp-channel?${params}`, {
      method: "GET",
      tags: ["whatsapp-channel-list"],
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to fetch channel list",
      data: [],
      pagination: {},
    };
  }
}

export async function createWhatsAccount(data: {
  name: string;
  phone: string;
}) {
  try {
    const res = await apiClient("/admin/whatsapp-account", {
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
    const res = await apiClient(`/admin/whatsapp-account/${id}`, {
      method: "PUT",
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
    const res = await apiClient(`/admin/whatsapp-account/${id}`, {
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
      `/admin/whatsapp-message?${params.toString()}`,
      { method: "GET", tags: ["whatsapp-messages"] },
    );

    console.log(res);
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

export async function getWhatsAppChannelMessages(
  channelId: string,
  page: number,
  limit: number,
) {
  try {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      channelId: channelId || "",
    });

    const res = await apiClient(
      `/admin/whatsapp-message?${params.toString()}`,
      { method: "GET", tags: ["whatsapp-channel-messages"] },
    );

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch channel messages",
      data: { messages: [], pagination: {} },
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
      `/admin/whatsapp/conversations?${params.toString()}`,
      { method: "GET", tags: ["whatsapp-conversations"] },
    );

    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch conversations",
      data: { conversations: [], pagination: {} },
    };
  }
}

export async function disconnectWhatsAppChannel(id: string) {
  try {
    const res = await apiClient(`/admin/whatsapp/sessions/${id}/disconnect`, {
      method: "POST",
    });
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
    const res = await apiClient(`/admin/whatsapp/sessions/${id}/reconnect`, {
      method: "POST",
    });
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

export async function deleteWhatsAppMessage(id: string) {
  try {
    const res = await apiClient(`/admin/whatsapp-message/${id}`, {
      method: "DELETE",
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error ? error.message : "Failed to delete message",
    };
  }
}

export async function updateWhatsAppChannelName(
  id: string,
  displayName: string,
) {
  try {
    const res = await apiClient(`/admin/whatsapp-channel/${id}`, {
      method: "PATCH",
      body: { displayName },
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update channel name",
    };
  }
}

export async function sendWhatsAppMessage(data: {
  sessionId: string;
  remoteJid: string;
  body: string;
  mediaType?: "image" | "video" | "document" | "audio";
  mediaUrl?: string;
  fileName?: string;
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

export async function deleteWhatsAppConversation(id: string) {
  try {
    const res = await apiClient(`/api/admin/whatsapp/conversations/${id}`, {
      method: "DELETE",
    });
    return res;
  } catch (error: any) {
    if (error?.digest?.startsWith("NEXT_REDIRECT")) throw error;
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete conversation",
    };
  }
}
