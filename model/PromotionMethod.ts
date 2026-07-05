import mongoose, { Document, Schema } from "mongoose";

export interface IPromotionMethod extends Document {
  operator: string;
  promotional: boolean;
  non_promotional: boolean;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PromotionMethodSchema = new Schema<IPromotionMethod>(
  {
    operator: {
      type: String,
      required: true,
      trim: true,
    },
    promotional: {
      type: Boolean,
      default: false,
    },
    non_promotional: {
      type: Boolean,
      default: false,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const PromotionMethod =
  mongoose.models.PromotionMethod ||
  mongoose.model<IPromotionMethod>("PromotionMethod", PromotionMethodSchema);
