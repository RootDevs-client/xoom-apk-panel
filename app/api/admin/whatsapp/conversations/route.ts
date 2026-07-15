import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { BaileysConversation } from "@/model/BaileysConversation";
import { NextRequest } from "next/server";

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.max(Number(searchParams.get("limit")) || 20, 1);
  const sessionId = searchParams.get("sessionId")?.trim() || "";
  const search = searchParams.get("search")?.trim() || "";

  const filter: Record<string, any> = {};
  if (sessionId) filter.session = sessionId;
  if (search) {
    filter.$or = [
      { contactName: { $regex: search, $options: "i" } },
      { contactPhone: { $regex: search, $options: "i" } },
      { remoteJid: { $regex: search, $options: "i" } },
    ];
  }

  const [conversations, total] = await Promise.all([
    BaileysConversation.find(filter)
      .sort({ lastMessageAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    BaileysConversation.countDocuments(filter),
  ]);

  return apiResponse(true, 200, "Conversations fetched successfully.", {
    conversations,
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
