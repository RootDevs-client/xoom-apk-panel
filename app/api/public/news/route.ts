import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { Category } from "@/model/Category";
import { News } from "@/model/News";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.max(Number(searchParams.get("limit")) || 10, 1);
  const search = searchParams.get("search")?.trim() || "";
  const category = searchParams.get("category");
  const topic = searchParams.get("topic");
  const sort = searchParams.get("sort") || "newest";

  const filter: Record<string, any> = {
    publishedDate: { $lte: new Date() },
  };

  if (search) {
    filter.title = { $regex: search, $options: "i" };
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
    filter.topics = { $regex: `^${topic.trim()}$`, $options: "i" };
  }

  const sortOption =
    sort === "oldest" ? { publishedDate: 1 as const } : { publishedDate: -1 as const };

  const [news, total] = await Promise.all([
    News.find(filter)
      .populate("categories")
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    News.countDocuments(filter),
  ]);

  return apiResponse(true, 200, "News fetched successfully.", {
    news,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
});
