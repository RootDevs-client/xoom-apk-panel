import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import "@/model/Category";
import { News } from "@/model/News";
import { NextRequest } from "next/server";

export const GET = asyncHandler(
  async (req: NextRequest, { topic }: { topic: string }) => {
    const { searchParams } = new URL(req.url);

    const page = Math.max(Number(searchParams.get("page")) || 1, 1);
    const limit = Math.max(Number(searchParams.get("limit")) || 10, 1);
    const sort = searchParams.get("sort") || "newest";

    const filter: Record<string, any> = {
      topics: { $regex: `^${topic.trim()}$`, $options: "i" },
    };

    const sortOption =
      sort === "oldest"
        ? { publishedDate: 1 as const }
        : { publishedDate: -1 as const };

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
  },
);
