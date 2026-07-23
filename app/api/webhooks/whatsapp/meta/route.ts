import dbConnect from "@/config/database";
import { MetaChannel } from "@/model/MetaChannel";
import { MetaConversation } from "@/model/MetaConversation";
import { MetaMessage } from "@/model/MetaMessage";
import { emitToChannel } from "@/lib/whatsapp-meta/server-emit";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || "";

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Verification failed", { status: 403 });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();

    const signature = req.headers.get("x-hub-signature-256");
    if (signature) {
      const appSecret = process.env.WHATSAPP_APP_SECRET || "";
      const expected = crypto
        .createHmac("sha256", appSecret)
        .update(rawBody)
        .digest("hex");
      const received = signature.replace("sha256=", "");
      if (expected !== received) {
        return NextResponse.json({ status: "invalid signature" }, { status: 403 });
      }
    }

    const body = JSON.parse(rawBody);

    if (body.object !== "whatsapp_business_account") {
      return NextResponse.json({ status: "ok" });
    }

    await dbConnect();

    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value;
        if (!value) continue;

        const phoneNumberId = value.metadata?.phone_number_id;
        if (!phoneNumberId) continue;

        const channel = await MetaChannel.findOne({ phoneNumberId });
        if (!channel) continue;

        if (value.statuses) {
          for (const status of value.statuses) {
            await MetaMessage.findOneAndUpdate(
              { channel: channel._id, metaMessageId: status.id },
              { $set: { status: status.status } },
            );
            emitToChannel(channel._id.toString(), "meta:message:status", {
              messageId: status.id,
              status: status.status,
            });
          }
        }

        if (value.messages) {
          for (const msg of value.messages) {
            const from = msg.from;
            const fromMe = false;
            const bodyText = msg.text?.body || "";
            const messageType: string = msg.type;
            const timestamp = new Date(Number(msg.timestamp) * 1000);

            let mediaUrl: string | undefined;
            let mimeType: string | undefined;
            let fileName: string | undefined;
            const mediaContent = (msg as any)[messageType];
            if (mediaContent?.link) {
              mediaUrl = mediaContent.link;
              mimeType = mediaContent.mime_type;
              fileName = mediaContent.filename;
            }

            let conversation = await MetaConversation.findOne({
              channel: channel._id,
              remoteJid: from,
            });

            const displayBody = bodyText || `[${messageType}]`;

            if (!conversation) {
              const contactName = value.contacts?.[0]?.profile?.name || from;
              conversation = await MetaConversation.create({
                channel: channel._id,
                remoteJid: from,
                contactName,
                contactPhone: from,
                lastMessage: {
                  body: displayBody,
                  type: messageType,
                  timestamp,
                  fromMe,
                },
                unreadCount: 1,
                lastMessageAt: timestamp,
              });
            } else {
              conversation.lastMessage = {
                body: displayBody,
                type: messageType,
                timestamp,
                fromMe,
              };
              conversation.unreadCount += 1;
              conversation.lastMessageAt = timestamp;
              await conversation.save();
            }

            const savedMessage = await MetaMessage.create({
              channel: channel._id,
              conversation: conversation._id,
              from,
              to: channel.phoneNumberId || phoneNumberId,
              fromMe,
              body: bodyText,
              type: messageType === "text" ? "text" : messageType as any,
              mediaUrl: mediaUrl || undefined,
              mimeType: mimeType || undefined,
              fileName: fileName || undefined,
              status: "delivered",
              metaMessageId: msg.id,
              timestamp,
            });

            emitToChannel(channel._id.toString(), "meta:message:new", {
              channelId: channel._id.toString(),
              conversationId: conversation._id.toString(),
              message: savedMessage.toObject() as unknown as Record<string, unknown>,
            });

            emitToChannel(channel._id.toString(), "meta:conversation:update", {
              channelId: channel._id.toString(),
              conversation: conversation.toObject() as unknown as Record<string, unknown>,
            });
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch {
    return NextResponse.json({ status: "ok" });
  }
}
