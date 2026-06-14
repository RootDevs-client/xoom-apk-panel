import mongoose, { Document, Schema } from "mongoose";

export interface ISubscribe extends Document {
  phone: string;
  reference: string;
  platform: string;
  membershipPlan?: string;
  expiryDate?: string;
  status: boolean;
  deviceInfo: Record<string, any>[];
  createdAt: Date;
  updatedAt: Date;
}
const SubscribeSchema = new Schema<ISubscribe>(
  {
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    reference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    platform: {
      type: String,
      required: false,
      trim: true,
      default: "",
    },
    membershipPlan: {
      type: String,
      trim: true,
    },
    expiryDate: {
      type: String,
      trim: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
    deviceInfo: {
      type: [Object],
      default: [],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const Subscribe =
  mongoose.models.Subscribe ||
  mongoose.model<ISubscribe>("Subscribe", SubscribeSchema);
