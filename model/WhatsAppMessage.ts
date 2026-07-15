import mongoose, { Document, Schema, Types } from "mongoose";

export interface IWhatsAppMessage extends Document {
  session: Types.ObjectId;
  conversation: Types.ObjectId;
  remoteJid: string;
  keyId: string;
  fromMe: boolean;
  pushName?: string;
  body: string;
  type:
    | "conversation"
    | "imageMessage"
    | "videoMessage"
    | "audioMessage"
    | "documentMessage"
    | "stickerMessage"
    | "locationMessage"
    | "contactsArrayMessage"
    | "extendedTextMessage"
    | "buttonsResponseMessage"
    | "templateButtonReplyMessage"
    | "reactionMessage"
    | "unknown";
  mediaUrl?: string;
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
  duration?: number;
  latitude?: number;
  longitude?: number;
  quotedMessage?: mongoose.Mixed;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppMessageSchema = new Schema<IWhatsAppMessage>(
  {
    session: {
      type: Schema.Types.ObjectId,
      ref: "WhatsAppSession",
      required: true,
      index: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "BaileysConversation",
      required: true,
      index: true,
    },
    remoteJid: { type: String, required: true },
    keyId: { type: String, required: true },
    fromMe: { type: Boolean, required: true },
    pushName: { type: String, default: null },
    body: { type: String, default: "" },
    type: {
      type: String,
      enum: [
        "conversation", "imageMessage", "videoMessage", "audioMessage",
        "documentMessage", "stickerMessage", "locationMessage",
        "contactsArrayMessage", "extendedTextMessage",
        "buttonsResponseMessage", "templateButtonReplyMessage",
        "reactionMessage", "unknown",
      ],
      default: "conversation",
    },
    mediaUrl: { type: String, default: null },
    mimeType: { type: String, default: null },
    fileName: { type: String, default: null },
    fileSize: { type: Number, default: null },
    duration: { type: Number, default: null },
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    quotedMessage: { type: Schema.Types.Mixed, default: null },
    status: {
      type: String,
      enum: ["pending", "sent", "delivered", "read", "failed"],
      default: "pending",
    },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false, collection: "whatsappmessages" }
);

WhatsAppMessageSchema.index({ session: 1, keyId: 1 }, { unique: true });

export const WhatsAppMessage =
  mongoose.models.WhatsAppMessage ||
  mongoose.model<IWhatsAppMessage>("WhatsAppMessage", WhatsAppMessageSchema);
