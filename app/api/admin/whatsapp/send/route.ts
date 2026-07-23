import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { sendBaileysMediaMessageSchema, sendBaileysMessageSchema } from "@/lib/validation-schema";
import { WhatsAppSession } from "@/model/WhatsAppSession";
import { WhatsAppMessage } from "@/model/WhatsAppMessage";
import { BaileysConversation } from "@/model/BaileysConversation";
import { NextRequest } from "next/server";

// Text message POST handler
export const POST = asyncHandler(
  sendBaileysMediaMessageSchema.or(sendBaileysMessageSchema),
  async (_req, data) => {
    const session = await WhatsAppSession.findById(data.sessionId).lean();
    if (!session) {
      return apiResponse(false, 404, "Channel not found.");
    }

    if (session.connectionStatus !== "connected") {
      return apiResponse(
        false,
        400,
        `Channel is not connected. Current status: ${session.connectionStatus}`,
      );
    }

    const now = new Date();
    const isMedia = "mediaType" in data;
    const mediaData = isMedia
      ? (data as typeof data & { mediaType: string; mediaUrl: string; fileName?: string })
      : null;
    const body = data.body || "";
    const messageType = isMedia
      ? `${mediaData!.mediaType}Message`
      : "conversation";
    const mediaTypeLabel = isMedia ? mediaData!.mediaType : "";

    let conversation = await BaileysConversation.findOne({
      session: data.sessionId,
      remoteJid: data.remoteJid,
    });

    if (!conversation) {
      conversation = await BaileysConversation.create({
        session: data.sessionId,
        remoteJid: data.remoteJid,
        contactName: data.remoteJid.split("@")[0],
        contactPhone: data.remoteJid.split("@")[0],
        lastMessage: {
          body: body || `[${mediaTypeLabel}]`,
          type: messageType,
          timestamp: now,
          fromMe: true,
        },
        unreadCount: 0,
        lastMessageAt: now,
      });
    } else {
      conversation.lastMessage = {
        body: body || `[${mediaTypeLabel}]`,
        type: messageType,
        timestamp: now,
        fromMe: true,
      };
      conversation.lastMessageAt = now;
      await conversation.save();
    }

    const messageData: Record<string, any> = {
      session: data.sessionId,
      conversation: conversation._id,
      remoteJid: data.remoteJid,
      keyId: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      fromMe: true,
      body,
      type: messageType,
      status: "pending",
      timestamp: now,
    };

    // Add media fields if sending media
    if (isMedia && mediaData) {
      messageData.mediaUrl = mediaData.mediaUrl;
      messageData.mimeType = mediaData.mediaType === "image"
        ? "image/jpeg"
        : mediaData.mediaType === "video"
          ? "video/mp4"
          : mediaData.mediaType === "audio"
            ? "audio/ogg"
            : "application/octet-stream";
      if (mediaData.fileName) {
        messageData.fileName = mediaData.fileName;
      }
    }

    const message = await WhatsAppMessage.create(messageData);

    return apiResponse(
      true,
      200,
      "Message queued for sending.",
      {
        message: message.toObject(),
        conversationId: conversation._id,
      },
    );
  },
  true,
);
