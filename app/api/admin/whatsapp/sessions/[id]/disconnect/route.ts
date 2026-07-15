import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { WhatsAppSession } from "@/model/WhatsAppSession";
import { NextRequest } from "next/server";

export const POST = asyncHandler(
  async (_req: NextRequest, { id }: { id: string }) => {
    const session = await WhatsAppSession.findById(id).lean();
    if (!session) {
      return apiResponse(false, 404, "Channel not found.");
    }

    await WhatsAppSession.findByIdAndUpdate(id, {
      $set: {
        connectionStatus: "disconnected",
        authCreds: null,
        authKeys: null,
      },
    });

    return apiResponse(true, 200, "Channel disconnected. Auth data cleared.");
  },
  true,
);
