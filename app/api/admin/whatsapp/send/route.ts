import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { sendBaileysMessageSchema } from "@/lib/validation-schema";
import { WhatsAppSession } from "@/model/WhatsAppSession";
import { WhatsAppMessage } from "@/model/WhatsAppMessage";
import { BaileysConversation } from "@/model/BaileysConversation";
import { NextRequest } from "next/server";

export const POST = asyncHandler(
  sendBaileysMessageSchema,
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
          body: data.body,
          type: "conversation",
          timestamp: now,
          fromMe: true,
        },
        unreadCount: 0,
        lastMessageAt: now,
      });
    } else {
      conversation.lastMessage = {
        body: data.body,
        type: "conversation",
        timestamp: now,
        fromMe: true,
      };
      conversation.lastMessageAt = now;
      await conversation.save();
    }

    const message = await WhatsAppMessage.create({
      session: data.sessionId,
      conversation: conversation._id,
      remoteJid: data.remoteJid,
      keyId: `pending_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      fromMe: true,
      body: data.body,
      type: "conversation",
      status: "pending",
      timestamp: now,
    });

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
