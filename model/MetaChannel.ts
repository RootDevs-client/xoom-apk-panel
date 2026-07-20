import mongoose, { Document, Schema } from "mongoose";

export interface IMetaChannel extends Document {
  name: string;
  phoneNumberId: string;
  accessToken: string;
  webhookSecret?: string;
  phoneNumber?: string;
  displayName?: string;
  isActive: boolean;
  isWebhookVerified: boolean;
  errorMessage?: string;
  lastVerifiedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MetaChannelSchema = new Schema<IMetaChannel>(
  {
    name: { type: String, required: true, trim: true },
    phoneNumberId: { type: String, required: true, trim: true },
    accessToken: { type: String, required: true },
    webhookSecret: { type: String, default: null },
    phoneNumber: { type: String, default: null },
    displayName: { type: String, default: null },
    isActive: { type: Boolean, default: false },
    isWebhookVerified: { type: Boolean, default: false },
    errorMessage: { type: String, default: null },
    lastVerifiedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false, collection: "metachannels" }
);

export const MetaChannel =
  mongoose.models.MetaChannel ||
  mongoose.model<IMetaChannel>("MetaChannel", MetaChannelSchema);
