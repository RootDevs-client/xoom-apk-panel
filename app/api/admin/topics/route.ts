import { asyncHandler } from "@/lib/async-handler";
import { apiResponse, prependAwsBaseUrl } from "@/lib/server.utils";
import { Topic } from "@/model/Topic";
import { NextRequest } from "next/server";

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();
  const { name, icon } = body;

  if (!name?.trim()) {
    return apiResponse(false, 400, "Topic name is required.");
  }

  const slug = generateSlug(name);
  const exists = await Topic.findOne({
    $or: [{ name: name.trim() }, { slug }],
  });

  if (exists) {
    return apiResponse(false, 409, "Topic already exists.");
  }

  const topic = await Topic.create({
    name: name.trim(),
    slug,
    icon: icon || null,
  });
  const createdTopic = {
    ...(topic.toObject ? topic.toObject() : topic),
    icon: prependAwsBaseUrl(topic.icon),
  };

  return apiResponse(true, 201, "Topic created successfully.", createdTopic);
}, true);

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.max(Number(searchParams.get("limit")) || 10, 1);
  const search = searchParams.get("search")?.trim() || "";

  const filter: Record<string, any> = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { slug: { $regex: search, $options: "i" } },
    ];
  }

  const [topics, total] = await Promise.all([
    Topic.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    Topic.countDocuments(filter),
  ]);
  const formattedTopics = topics.map((item: Record<string, any>) => ({
    ...item,
    icon: prependAwsBaseUrl(item.icon),
  }));
  return apiResponse(true, 200, "Topics fetched successfully.", {
    topics: formattedTopics,
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
