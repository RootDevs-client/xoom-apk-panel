import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { MetaChannel } from "@/model/MetaChannel";
import { MetaConversation } from "@/model/MetaConversation";
import { MetaMessage } from "@/model/MetaMessage";
import { sendTextMessage, sendMediaMessage } from "@/lib/whatsapp-meta/client";
import { NextRequest } from "next/server";
import { z } from "zod";

const sendSchema = z.object({
  channelId: z.string().min(1, "Channel ID is required!"),
  remoteJid: z.string().min(1, "Recipient is required!"),
  body: z.string().optional(),
  mediaType: z.enum(["image", "video", "document", "audio"]).optional(),
  mediaUrl: z.string().url("Invalid media URL!").optional(),
  fileName: z.string().optional(),
});

export const POST = asyncHandler(
  sendSchema,
  async (_req, data) => {
    const channel = await MetaChannel.findById(data.channelId);
    if (!channel) {
      return apiResponse(false, 404, "Meta channel not found.");
    }

    if (!channel.isActive) {
      return apiResponse(false, 400, "Channel is not active. Verify credentials first.");
    }

    const now = new Date();
    const isMedia = !!data.mediaType && !!data.mediaUrl;
    const body = data.body || "";
    const messageType = isMedia ? data.mediaType! : "text";

    let conversation = await MetaConversation.findOne({
      channel: channel._id,
      remoteJid: data.remoteJid,
    });

    const displayBody = body || `[${messageType}]`;

    if (!conversation) {
      conversation = await MetaConversation.create({
        channel: channel._id,
        remoteJid: data.remoteJid,
        contactName: data.remoteJid,
        contactPhone: data.remoteJid,
        lastMessage: {
          body: displayBody,
          type: messageType,
          timestamp: now,
          fromMe: true,
        },
        unreadCount: 0,
        lastMessageAt: now,
      });
    } else {
      conversation.lastMessage = {
        body: displayBody,
        type: messageType,
        timestamp: now,
        fromMe: true,
      };
      conversation.lastMessageAt = now;
      await conversation.save();
    }

    const metaMessageId = `pending_${Date.now()}`;

    const message = await MetaMessage.create({
      channel: channel._id,
      conversation: conversation._id,
      from: channel.phoneNumberId || "",
      to: data.remoteJid,
      fromMe: true,
      body,
      type: messageType as any,
      mediaUrl: data.mediaUrl || undefined,
      mimeType: isMedia
        ? data.mediaType === "image"
          ? "image/jpeg"
          : data.mediaType === "video"
            ? "video/mp4"
            : data.mediaType === "audio"
              ? "audio/ogg"
              : "application/octet-stream"
        : undefined,
      fileName: data.fileName || undefined,
      status: "sent",
      metaMessageId,
      timestamp: now,
    });

    try {
      if (isMedia) {
        const result = await sendMediaMessage(
          channel.accessToken,
          channel.phoneNumberId,
          data.remoteJid,
          data.mediaType!,
          data.mediaUrl!,
          body || undefined,
          data.fileName,
        );
        const apiMsgId = result.messages?.[0]?.id;
        if (apiMsgId) {
          message.metaMessageId = apiMsgId;
          await message.save();
        }
      } else if (body) {
        const result = await sendTextMessage(
          channel.accessToken,
          channel.phoneNumberId,
          data.remoteJid,
          body,
        );
        const apiMsgId = result.messages?.[0]?.id;
        if (apiMsgId) {
          message.metaMessageId = apiMsgId;
          await message.save();
        }
      }
    } catch (error: any) {
      message.status = "failed";
      await message.save();

      return apiResponse(false, 400, `Failed to send: ${error.message}`, {
        message: message.toObject(),
      });
    }

    return apiResponse(true, 200, "Message sent successfully.", {
      message: message.toObject(),
      conversationId: conversation._id,
    });
  },
  true,
);
