import { asyncHandler } from "@/lib/async-handler";
import { apiResponse, prependAwsBaseUrl } from "@/lib/server.utils";
import "@/model/Category";
import { News } from "@/model/News";
import { NextRequest } from "next/server";

export const GET = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const news = await News.findOne({
      _id: id,
      publishedDate: { $lte: new Date() },
    }).populate("categories").lean();

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
);
