import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { MetaChannel } from "@/model/MetaChannel";
import { MetaConversation } from "@/model/MetaConversation";
import { MetaMessage } from "@/model/MetaMessage";
import { NextRequest } from "next/server";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).trim().optional(),
  phoneNumberId: z.string().min(1).trim().optional(),
  accessToken: z.string().min(1).trim().optional(),
  webhookSecret: z.string().optional(),
});

export const GET = asyncHandler(async (_req: NextRequest, params: { id: string }) => {
  const channel = await MetaChannel.findById(params.id).lean();
  if (!channel) {
    return apiResponse(false, 404, "Meta channel not found.");
  }
  return apiResponse(true, 200, "Meta channel fetched.", { channel });
}, true);

export const PATCH = asyncHandler(
  updateSchema,
  async (_req, data, params: { id: string }) => {
    const channel = await MetaChannel.findByIdAndUpdate(
      params.id,
      { $set: data },
      { new: true, runValidators: true },
    ).lean();
    if (!channel) {
      return apiResponse(false, 404, "Meta channel not found.");
    }
    return apiResponse(true, 200, "Meta channel updated.", { channel });
  },
  true,
);

export const DELETE = asyncHandler(async (_req: NextRequest, params: { id: string }) => {
  const channel = await MetaChannel.findById(params.id).lean();
  if (!channel) {
    return apiResponse(false, 404, "Meta channel not found.");
  }
  await Promise.all([
    MetaMessage.deleteMany({ channel: params.id }),
    MetaConversation.deleteMany({ channel: params.id }),
    MetaChannel.findByIdAndDelete(params.id),
  ]);
  return apiResponse(true, 200, "Meta channel deleted.");
}, true);
