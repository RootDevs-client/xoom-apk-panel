import { asyncHandler } from "@/lib/async-handler";
import { apiResponse, prependAwsBaseUrl } from "@/lib/server.utils";
import "@/model/Category";
import { News } from "@/model/News";
import { NextRequest } from "next/server";

export const GET = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const news = await News.findById(id).populate("categories").lean();

    if (!news) {
      return apiResponse(false, 404, "News not found.");
    }

    const newsWithUrl = {
      ...news,
      icon: prependAwsBaseUrl(news.icon),
      image: prependAwsBaseUrl(news.image),
    };
    return apiResponse(true, 200, "News fetched successfully.", newsWithUrl);
  },
  true,
);

export const PATCH = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const { title, description, image, icon, categories, topics, publishedDate } =
      await req.json();

    const updateData: Record<string, any> = {};

    if (title?.trim()) updateData.title = title.trim();
    if (description?.trim()) updateData.description = description.trim();
    if (image !== undefined) updateData.image = image || null;
    if (icon !== undefined) updateData.icon = icon || null;
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

    const updatedNews = {
      ...(news.toObject ? news.toObject() : news),
      icon: prependAwsBaseUrl(news.icon),
      image: prependAwsBaseUrl(news.image),
    };
    return apiResponse(true, 200, "News updated successfully.", updatedNews);
  },
  true,
);

export const DELETE = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {

    const news = await News.findByIdAndDelete(id);

    if (!news) {
      return apiResponse(false, 404, "News not found.");
    }

    return apiResponse(true, 200, "News deleted successfully.");
  },
  true,
);
