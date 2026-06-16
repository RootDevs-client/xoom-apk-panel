import mongoose, { Document, Schema } from "mongoose";

export interface IEvent extends Document {
  deviceId: string;
  userId?: mongoose.Types.ObjectId | null;
  sessionId?: string;
  event: string;
  eventData?: Record<string, any>;
  ip?: string;
  country?: string;
  city?: string;
  appVersion?: string;
  os?: string;
  osVersion?: string;
  deviceBrand?: string;
  deviceModel?: string;
  createdAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    deviceId: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    sessionId: {
      type: String,
    },
    event: {
      type: String,
      required: true,
      enum: ["firstopen", "appopen", "appclose"],
    },
    eventData: {
      type: Schema.Types.Mixed,
    },
    ip: {
      type: String,
    },
    country: {
      type: String,
    },
    city: {
      type: String,
    },
    appVersion: {
      type: String,
    },
    os: {
      type: String,
    },
    osVersion: {
      type: String,
    },
    deviceBrand: {
      type: String,
    },
    deviceModel: {
      type: String,
    },
  },
  {
    versionKey: false,
    timestamps: { createdAt: true, updatedAt: false },
  },
);

export const Event =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);
