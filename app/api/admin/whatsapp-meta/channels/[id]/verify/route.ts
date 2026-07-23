import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { MetaChannel } from "@/model/MetaChannel";
import { verifyCredentials } from "@/lib/whatsapp-meta/client";
import { NextRequest } from "next/server";

export const POST = asyncHandler(async (_req: NextRequest, params: { id: string }) => {
  const channel = await MetaChannel.findById(params.id);
  if (!channel) {
    return apiResponse(false, 404, "Meta channel not found.");
  }
  try {
    const result = await verifyCredentials(channel.accessToken, channel.phoneNumberId);
    channel.phoneNumber = result.display_phone_number;
    channel.displayName = result.verified_name;
    channel.isActive = true;
    channel.isWebhookVerified = true;
    channel.errorMessage = undefined;
    channel.lastVerifiedAt = new Date();
    await channel.save();
    return apiResponse(true, 200, "Credentials verified successfully.", {
      displayName: result.verified_name,
      phoneNumber: result.display_phone_number,
    });
  } catch (error: any) {
    const tokenPreview = channel.accessToken.length > 20
      ? channel.accessToken.slice(0, 10) + "..." + channel.accessToken.slice(-10)
      : channel.accessToken;
    console.error("[Meta-WA] Verify failed:", {
      channel: channel.name,
      phoneNumberId: channel.phoneNumberId,
      tokenLength: channel.accessToken.length,
      tokenPreview,
      error: error.message,
    });
    channel.isActive = false;
    channel.errorMessage = error.message;
    await channel.save();
    return apiResponse(false, 400, `Verification failed: ${error.message}`);
  }
}, true);
