import { asyncHandler } from "@/lib/async-handler";
import { apiResponse, prependAwsBaseUrl } from "@/lib/server.utils";
import { Topic } from "@/model/Topic";
import { NextRequest } from "next/server";

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const slug = searchParams.get("slug");

  const filter: Record<string, any> = {};

  if (id) {
    filter._id = id;
  }

  if (slug) {
    filter.slug = slug;
  }

  const topics = await Topic.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  const formattedTopics = topics.map((item: Record<string, any>) => ({
    ...item,
    icon: prependAwsBaseUrl(item.icon),
  }));

  return apiResponse(true, 200, "Topics fetched successfully.", {
    topics: formattedTopics,
  });
});
