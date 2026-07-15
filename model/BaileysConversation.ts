import mongoose, { Document, Schema, Types } from "mongoose";

export interface IBaileysConversation extends Document {
  session: Types.ObjectId;
  remoteJid: string;
  contactName?: string;
  contactPhone?: string;
  profilePicUrl?: string;
  lastMessage: {
    body: string;
    type: string;
    timestamp: Date;
    fromMe: boolean;
  };
  unreadCount: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BaileysConversationSchema = new Schema<IBaileysConversation>(
  {
    session: {
      type: Schema.Types.ObjectId,
      ref: "WhatsAppSession",
      required: true,
      index: true,
    },
    remoteJid: { type: String, required: true },
    contactName: { type: String, default: null },
    contactPhone: { type: String, default: null },
    profilePicUrl: { type: String, default: null },
    lastMessage: {
      type: new Schema(
        {
          body: { type: String, default: "" },
          type: { type: String, default: "conversation" },
          timestamp: { type: Date, required: true },
          fromMe: { type: Boolean, default: false },
        },
        { _id: false }
      ),
      default: { body: "", type: "conversation", timestamp: new Date(), fromMe: false },
    },
    unreadCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false, collection: "baileysconversations" }
);

BaileysConversationSchema.index({ session: 1, remoteJid: 1 }, { unique: true });

export const BaileysConversation =
  mongoose.models.BaileysConversation ||
  mongoose.model<IBaileysConversation>("BaileysConversation", BaileysConversationSchema);
