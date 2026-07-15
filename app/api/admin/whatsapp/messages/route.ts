import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { WhatsAppMessage } from "@/model/WhatsAppMessage";
import { NextRequest } from "next/server";

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.max(Number(searchParams.get("limit")) || 50, 1);
  const conversationId = searchParams.get("conversationId")?.trim() || "";
  const sessionId = searchParams.get("sessionId")?.trim() || "";

  const filter: Record<string, any> = {};
  if (conversationId) filter.conversation = conversationId;
  if (sessionId) filter.session = sessionId;

  const [messages, total] = await Promise.all([
    WhatsAppMessage.find(filter)
      .sort({ timestamp: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    WhatsAppMessage.countDocuments(filter),
  ]);

  return apiResponse(true, 200, "Messages fetched successfully.", {
    messages,
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
