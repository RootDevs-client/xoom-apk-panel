import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { MetaConversation } from "@/model/MetaConversation";
import { MetaMessage } from "@/model/MetaMessage";
import { NextRequest } from "next/server";

export const PATCH = asyncHandler(async (_req: NextRequest, params: { id: string }) => {
  const data = await _req.json().catch(() => ({}));
  const conversation = await MetaConversation.findByIdAndUpdate(
    params.id,
    { $set: { displayName: data.displayName } },
    { new: true },
  ).lean();
  if (!conversation) {
    return apiResponse(false, 404, "Conversation not found.");
  }
  return apiResponse(true, 200, "Conversation updated.", { conversation });
}, true);

export const DELETE = asyncHandler(async (_req: NextRequest, params: { id: string }) => {
  const conversation = await MetaConversation.findById(params.id).lean();
  if (!conversation) {
    return apiResponse(false, 404, "Conversation not found.");
  }
  await Promise.all([
    MetaMessage.deleteMany({ conversation: params.id }),
    MetaConversation.findByIdAndDelete(params.id),
  ]);
  return apiResponse(true, 200, "Conversation deleted.");
}, true);
