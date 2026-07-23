export interface MetaWebhookEntry {
  id: string;
  changes: MetaWebhookChange[];
}

export interface MetaWebhookChange {
  field: string;
  value: {
    messaging_product: string;
    metadata: {
      display_phone_number: string;
      phone_number_id: string;
    };
    contacts?: Array<{
      profile: { name: string };
      wa_id: string;
    }>;
    messages?: MetaIncomingMessage[];
    statuses?: MetaStatusUpdate[];
    errors?: Array<{ code: number; title: string; message?: string }>;
  };
}

export interface MetaIncomingMessage {
  from: string;
  id: string;
  timestamp: string;
  type: "text" | "image" | "video" | "audio" | "document" | "unknown";
  text?: { body: string };
  image?: { id: string; mime_type: string; sha256: string; link?: string };
  video?: { id: string; mime_type: string; sha256: string; link?: string };
  audio?: { id: string; mime_type: string; sha256: string; link?: string };
  document?: {
    id: string;
    mime_type: string;
    sha256: string;
    filename?: string;
    link?: string;
  };
}

export interface MetaStatusUpdate {
  id: string;
  status: "sent" | "delivered" | "read" | "failed";
  timestamp: string;
  recipient_id: string;
  conversation?: { id: string };
  errors?: Array<{ code: number; title: string; message?: string }>;
}

export interface MetaSendResponse {
  messaging_product: "whatsapp";
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string }>;
}

export interface MetaErrorResponse {
  error: {
    message: string;
    type: string;
    code: number;
    fbtrace_id: string;
  };
}

export interface ServerToClientEvents {
  "meta:message:new": (data: {
    channelId: string;
    conversationId: string;
    message: Record<string, unknown>;
  }) => void;
  "meta:message:status": (data: {
    messageId: string;
    status: string;
  }) => void;
  "meta:conversation:update": (data: {
    channelId: string;
    conversation: Record<string, unknown>;
  }) => void;
  "meta:conversation:deleted": (data: {
    channelId: string;
    conversationId: string;
    remoteJid: string;
  }) => void;
}

export interface ClientToServerEvents {
  "join:channel": (data: { channelId: string }) => void;
  "leave:channel": (data: { channelId: string }) => void;
  "server:emit": (data: { channelId: string; event: string; data: any }) => void;
}
