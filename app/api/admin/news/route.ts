import { asyncHandler } from "@/lib/async-handler";
import { apiResponse, prependAwsBaseUrl } from "@/lib/server.utils";
import { Category } from "@/model/Category";
import { News } from "@/model/News";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();

  const { title, description, image, icon, categories, topics, publishedDate } = body;

  if (!title?.trim()) {
    return apiResponse(false, 400, "Title is required.");
  }

  if (!description?.trim()) {
    return apiResponse(false, 400, "Description is required.");
  }

  if (!Array.isArray(categories) || categories.length === 0) {
    return apiResponse(false, 400, "At least one category is required.");
  }

  if (!publishedDate) {
    return apiResponse(false, 400, "Published date is required.");
  }

  const normalizedTopics = Array.isArray(topics)
    ? [...new Set(topics.map((t: string) => t.trim()).filter(Boolean))]
    : [];

  const news = await News.create({
    title: title.trim(),
    description: description.trim(),
    image: image || null,
    icon: icon || null,
    categories,
    topics: normalizedTopics,
    publishedDate,
  });

  const createdNews = {
    ...(news.toObject ? news.toObject() : news),
    icon: prependAwsBaseUrl(news.icon),
    image: prependAwsBaseUrl(news.image),
  };

  return apiResponse(true, 201, "News created successfully.", createdNews);
}, true);

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.max(Number(searchParams.get("limit")) || 10, 1);
  const search = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category");
  const topic = searchParams.get("topic");
  const sort = searchParams.get("sort") || "newest";

  const filter: Record<string, any> = {};

  if (search) {
    filter.title = {
      $regex: search,
      $options: "i",
    };
  }

  if (category) {
    if (mongoose.Types.ObjectId.isValid(category)) {
      filter.categories = category;
    } else {
      const cat = await Category.findOne({ slug: category }).select("_id").lean();
      if (!cat) {
        return apiResponse(true, 200, "News fetched successfully.", {
          news: [],
          pagination: { total: 0, page, limit, totalPages: 0, hasNextPage: false, hasPrevPage: false },
        });
      }
      filter.categories = cat._id;
    }
  }

  if (topic) {
    filter.topics = {
      $regex: `^${topic.trim()}$`,
      $options: "i",
    };
  }

  const sortOption =
    sort === "oldest" ? { createdAt: 1 as const } : { createdAt: -1 as const };

  const [news, total] = await Promise.all([
    News.find(filter)
      .populate("categories")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    News.countDocuments(filter),
  ]);

  const mappedNews = news.map((item: Record<string, any>) => ({
    ...item,
    icon: prependAwsBaseUrl(item.icon),
    image: prependAwsBaseUrl(item.image),
  }));

  return apiResponse(true, 200, "News fetched successfully.", {
    news: mappedNews,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
}, true);
