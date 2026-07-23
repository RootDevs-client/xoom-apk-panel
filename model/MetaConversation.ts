import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMetaConversation extends Document {
  channel: Types.ObjectId;
  remoteJid: string;
  contactName?: string;
  contactPhone?: string;
  displayName?: string;
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

const MetaConversationSchema = new Schema<IMetaConversation>(
  {
    channel: {
      type: Schema.Types.ObjectId,
      ref: "MetaChannel",
      required: true,
      index: true,
    },
    remoteJid: { type: String, required: true },
    contactName: { type: String, default: null },
    contactPhone: { type: String, default: null },
    displayName: { type: String, default: null },
    lastMessage: {
      type: new Schema(
        {
          body: { type: String, default: "" },
          type: { type: String, default: "text" },
          timestamp: { type: Date, required: true },
          fromMe: { type: Boolean, default: false },
        },
        { _id: false }
      ),
      default: { body: "", type: "text", timestamp: new Date(), fromMe: false },
    },
    unreadCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false, collection: "metaconversations" }
);

MetaConversationSchema.index({ channel: 1, remoteJid: 1 }, { unique: true });

export const MetaConversation =
  mongoose.models.MetaConversation ||
  mongoose.model<IMetaConversation>("MetaConversation", MetaConversationSchema);
