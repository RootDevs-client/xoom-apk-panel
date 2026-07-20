import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { MetaConversation } from "@/model/MetaConversation";
import { NextRequest } from "next/server";

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.max(Number(searchParams.get("limit")) || 20, 1);
  const channelId = searchParams.get("channelId")?.trim() || "";
  const search = searchParams.get("search")?.trim() || "";

  const filter: Record<string, any> = {};
  if (channelId) filter.channel = channelId;
  if (search) {
    filter.$or = [
      { contactName: { $regex: search, $options: "i" } },
      { contactPhone: { $regex: search, $options: "i" } },
      { remoteJid: { $regex: search, $options: "i" } },
    ];
  }

  const [conversations, total] = await Promise.all([
    MetaConversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("channel", "name")
      .lean(),
    MetaConversation.countDocuments(filter),
  ]);

  const transformed = (conversations as any[]).map((conv) => ({
    ...conv,
    channelName: (conv.channel as any)?.name || "Unknown",
    channel: (conv.channel as any)?._id || conv.channel,
  }));

  return apiResponse(true, 200, "Conversations fetched.", {
    conversations: transformed,
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
