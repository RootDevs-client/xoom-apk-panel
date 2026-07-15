import type { BaileysEventMap } from "@whiskeysockets/baileys";

export interface ServerToClientEvents {
  "baileys:qr": (data: { sessionId: string; qrCode: string }) => void;
  "baileys:connecting": (data: { sessionId: string }) => void;
  "baileys:connected": (
    data: {
      sessionId: string;
      phoneNumber: string;
      displayName: string;
      profilePicUrl?: string;
    }
  ) => void;
  "baileys:disconnected": (data: { sessionId: string; reason: string }) => void;
  "baileys:reconnecting": (data: { sessionId: string }) => void;
  "baileys:loggedOut": (data: { sessionId: string }) => void;
  "baileys:message:new": (
    data: {
      sessionId: string;
      conversationId: string;
      message: Record<string, unknown>;
    }
  ) => void;
  "baileys:message:status": (
    data: { messageId: string; status: string }
  ) => void;
  "baileys:conversation:update": (
    data: { sessionId: string; conversation: Record<string, unknown> }
  ) => void;
  "baileys:error": (data: { sessionId: string; error: string }) => void;
}

export interface ClientToServerEvents {
  "join:session": (data: { sessionId: string }) => void;
  "leave:session": (data: { sessionId: string }) => void;
}

export type BaileysEvent =
  BaileysEventMap[keyof BaileysEventMap];
