import mongoose, { Document, Schema, Types } from "mongoose";

export interface IMetaMessage extends Document {
  channel: Types.ObjectId;
  conversation: Types.ObjectId;
  from: string;
  to: string;
  fromMe: boolean;
  body: string;
  type: "text" | "image" | "video" | "audio" | "document" | "unknown";
  mediaUrl?: string;
  mimeType?: string;
  fileName?: string;
  fileSize?: number;
  status: "sent" | "delivered" | "read" | "failed";
  metaMessageId?: string;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MetaMessageSchema = new Schema<IMetaMessage>(
  {
    channel: {
      type: Schema.Types.ObjectId,
      ref: "MetaChannel",
      required: true,
      index: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      ref: "MetaConversation",
      required: true,
      index: true,
    },
    from: { type: String, required: true },
    to: { type: String, required: true },
    fromMe: { type: Boolean, required: true },
    body: { type: String, default: "" },
    type: {
      type: String,
      enum: ["text", "image", "video", "audio", "document", "unknown"],
      default: "text",
    },
    mediaUrl: { type: String, default: null },
    mimeType: { type: String, default: null },
    fileName: { type: String, default: null },
    fileSize: { type: Number, default: null },
    status: {
      type: String,
      enum: ["sent", "delivered", "read", "failed"],
      default: "sent",
    },
    metaMessageId: { type: String, default: null },
    timestamp: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false, collection: "metamessages" }
);

MetaMessageSchema.index({ channel: 1, metaMessageId: 1 }, { unique: true, sparse: true });

export const MetaMessage =
  mongoose.models.MetaMessage ||
  mongoose.model<IMetaMessage>("MetaMessage", MetaMessageSchema);
