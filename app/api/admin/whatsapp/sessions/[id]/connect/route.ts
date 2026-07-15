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

    if (session.connectionStatus === "connected") {
      return apiResponse(true, 200, "Already connected.", {
        sessionId: id,
        status: "connected",
      });
    }

    await WhatsAppSession.findByIdAndUpdate(id, {
      $set: { connectionStatus: "idle", errorMessage: null },
    });

    return apiResponse(true, 200, "Connection requested. QR code will appear in real-time.", {
      sessionId: id,
      status: "idle",
    });
  },
  true,
);
