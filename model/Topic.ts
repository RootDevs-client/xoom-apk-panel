import mongoose, { Document, Schema } from "mongoose";

export interface ITopic extends Document {
  name: string;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
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
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const Topic =
  mongoose.models.Topic ||
  mongoose.model<ITopic>("Topic", TopicSchema);
