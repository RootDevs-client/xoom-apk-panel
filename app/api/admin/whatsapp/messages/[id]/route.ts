import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { WhatsAppMessage } from "@/model/WhatsAppMessage";
import { NextRequest } from "next/server";

export const DELETE = asyncHandler(
  async (_req: NextRequest, { id }: { id: string }) => {
    const message = await WhatsAppMessage.findByIdAndDelete(id);
    if (!message) {
      return apiResponse(false, 404, "Message not found.");
    }
    return apiResponse(true, 200, "Message deleted successfully.");
  },
  true,
);
