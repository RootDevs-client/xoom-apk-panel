import mongoose, { Document, Schema } from "mongoose";

export type ConnectionStatus =
  | "idle"
  | "qr"
  | "connecting"
  | "connected"
  | "reconnecting"
  | "disconnected"
  | "loggedOut"
  | "error";

export interface IWhatsAppSession extends Document {
  name: string;
  phoneNumber?: string;
  waDisplayName?: string;
  profilePicUrl?: string;
  connectionStatus: ConnectionStatus;
  errorMessage?: string;
  authCreds?: mongoose.Mixed;
  authKeys?: mongoose.Mixed;
  baileysJid?: string;
  lastConnectedAt?: Date;
  qrCodeRetries: number;
  createdAt: Date;
  updatedAt: Date;
}

const WhatsAppSessionSchema = new Schema<IWhatsAppSession>(
  {
    name: { type: String, required: true, trim: true },
    phoneNumber: { type: String, default: null },
    waDisplayName: { type: String, default: null },
    profilePicUrl: { type: String, default: null },
    connectionStatus: {
      type: String,
      enum: [
        "idle", "qr", "connecting", "connected",
        "reconnecting", "disconnected", "loggedOut", "error",
      ],
      default: "idle",
    },
    errorMessage: { type: String, default: null },
    authCreds: { type: Schema.Types.Mixed, default: null },
    authKeys: { type: Schema.Types.Mixed, default: null },
    baileysJid: { type: String, default: null },
    lastConnectedAt: { type: Date, default: null },
    qrCodeRetries: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false, collection: "whatsappsessions" }
);

export const WhatsAppSession =
  mongoose.models.WhatsAppSession ||
  mongoose.model<IWhatsAppSession>("WhatsAppSession", WhatsAppSessionSchema);
