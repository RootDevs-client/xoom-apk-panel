import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import "@/model/Category";
import { News } from "@/model/News";
import { NextRequest } from "next/server";

export const PATCH = asyncHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const { title, description, image, categories, topics, publishedDate } =
      await req.json();

    const updateData: Record<string, any> = {};

    if (title?.trim()) updateData.title = title.trim();
    if (description?.trim()) updateData.description = description.trim();
    if (image !== undefined) updateData.image = image || null;
    if (categories !== undefined) {
      if (!Array.isArray(categories) || categories.length === 0) {
        return apiResponse(false, 400, "At least one category is required.");
      }
      updateData.categories = categories;
    }
    if (topics !== undefined) {
      updateData.topics = Array.isArray(topics)
        ? [...new Set(topics.map((t: string) => t.trim()).filter(Boolean))]
        : [];
    }
    if (publishedDate !== undefined) updateData.publishedDate = publishedDate;

    const news = await News.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    }).populate("categories");

    if (!news) {
      return apiResponse(false, 404, "News not found.");
    }

    return apiResponse(true, 200, "News updated successfully.", news);
  },
  true,
);

export const DELETE = asyncHandler(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const news = await News.findByIdAndDelete(id);

    if (!news) {
      return apiResponse(false, 404, "News not found.");
    }

    return apiResponse(true, 200, "News deleted successfully.");
  },
  true,
);
