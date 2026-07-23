import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { MetaMessage } from "@/model/MetaMessage";
import { NextRequest } from "next/server";

export const DELETE = asyncHandler(async (_req: NextRequest, params: { id: string }) => {
  const message = await MetaMessage.findByIdAndDelete(params.id).lean();
  if (!message) {
    return apiResponse(false, 404, "Message not found.");
  }
  return apiResponse(true, 200, "Message deleted.");
}, true);
