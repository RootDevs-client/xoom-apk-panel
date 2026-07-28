import mongoose, { Document, Schema } from "mongoose";

export interface IPromotionMethod extends Document {
  operator: string;
  promotional: boolean;
  non_promotional: boolean;
  isActive: boolean;
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
    isActive: {
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
  mongoose.model<IPromotionMethod>(
    "PromotionCategory",
    PromotionMethodSchema,
    "promotioncategories",
  );
