import mongoose, { Document, Schema } from "mongoose";

export interface ISubscribe extends Document {
  phone: string;
  status: boolean;
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
    status: {
      type: Boolean,
      default: true,
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
