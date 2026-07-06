import mongoose, { Document, Schema } from "mongoose";

export interface ITopic extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
  icon?: string;
}

const TopicSchema = new Schema<ITopic>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    icon: {
      type: String,
      default: null,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const Topic =
  mongoose.models.Topic || mongoose.model<ITopic>("Topic", TopicSchema);
