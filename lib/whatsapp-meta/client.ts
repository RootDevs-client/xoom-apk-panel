const META_API_VERSION = "v21.0";
const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

interface SendMessageResponse {
  messaging_product: "whatsapp";
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

async function graphRequest<T>(
  accessToken: string,
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${META_GRAPH_URL}/${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const error = body?.error?.message || `HTTP ${res.status}`;
    throw new Error(error);
  }

  return res.json();
}

export async function sendTextMessage(
  accessToken: string,
  phoneNumberId: string,
  to: string,
  text: string,
): Promise<SendMessageResponse> {
  return graphRequest<SendMessageResponse>(accessToken, `${phoneNumberId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}

export async function sendMediaMessage(
  accessToken: string,
  phoneNumberId: string,
  to: string,
  mediaType: "image" | "video" | "audio" | "document",
  mediaUrl: string,
  caption?: string,
  fileName?: string,
): Promise<SendMessageResponse> {
  const body: Record<string, unknown> = {
    messaging_product: "whatsapp",
    recipient_type: "individual",
    to,
    type: mediaType,
  };

  body[mediaType] = { link: mediaUrl };
  if (caption) (body[mediaType] as Record<string, unknown>).caption = caption;
  if (fileName && mediaType === "document") {
    (body[mediaType] as Record<string, unknown>).filename = fileName;
  }

  return graphRequest<SendMessageResponse>(accessToken, `${phoneNumberId}/messages`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function markMessageAsRead(
  accessToken: string,
  phoneNumberId: string,
  messageId: string,
): Promise<void> {
  await graphRequest(accessToken, `${phoneNumberId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  });
}

export async function verifyCredentials(
  accessToken: string,
  phoneNumberId: string,
): Promise<{ verified_name: string; display_phone_number: string; id: string }> {
  return graphRequest(accessToken, `${phoneNumberId}`, {
    method: "GET",
  });
}
