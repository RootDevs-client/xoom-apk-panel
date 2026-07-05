import { asyncHandler } from "@/lib/async-handler";
import { apiResponse, prependAwsBaseUrl } from "@/lib/server.utils";
import { Category } from "@/model/Category";
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

  const categories = await Category.find(filter).sort({ createdAt: -1 }).lean();

  const mappedCategories = categories.map((item: Record<string, any>) => ({
    ...item,
    icon: prependAwsBaseUrl(item.icon),
  }));

  return apiResponse(true, 200, "Categories fetched successfully.", {
    categories: mappedCategories,
  });
});
