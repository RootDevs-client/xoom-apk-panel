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

    if (!session.authCreds) {
      return apiResponse(
        false,
        400,
        "No saved auth data found. Please scan the QR code to connect.",
      );
    }

    await WhatsAppSession.findByIdAndUpdate(id, {
      $set: { connectionStatus: "connecting", errorMessage: null },
    });

    return apiResponse(true, 200, "Reconnection requested.", {
      sessionId: id,
      status: "connecting",
    });
  },
  true,
);
