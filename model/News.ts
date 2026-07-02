import mongoose, { Document, Schema } from "mongoose";

export interface INews extends Document {
  title: string;
  description: string;
  image?: string;
  categories: mongoose.Types.ObjectId[];
  topics: string[];
  publishedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NewsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      default: null,
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    topics: [
      {
        type: String,
        trim: true,
      },
    ],
    publishedDate: {
      type: Date,
      required: true,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const News =
  mongoose.models.News || mongoose.model<INews>("News", NewsSchema);
