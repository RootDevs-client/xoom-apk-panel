import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { WhatsAppSession } from "@/model/WhatsAppSession";
import { NextRequest } from "next/server";

export const GET = asyncHandler(
  async (_req: NextRequest, { id }: { id: string }) => {
    const session = await WhatsAppSession.findById(id).lean();
    if (!session) {
      return apiResponse(false, 404, "Channel not found.");
    }

    if (session.connectionStatus === "qr") {
      return apiResponse(true, 200, "QR code is being generated. Check real-time events for the QR code.", {
        sessionId: id,
        status: session.connectionStatus,
      });
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

    return apiResponse(true, 200, "Channel reset. QR code will appear shortly.", {
      sessionId: id,
      status: "idle",
    });
  },
  true,
);
