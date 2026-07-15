import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { BaileysConversation } from "@/model/BaileysConversation";
import { NextRequest } from "next/server";

export const DELETE = asyncHandler(
  async (_req: NextRequest, { id }: { id: string }) => {
    const conversation = await BaileysConversation.findByIdAndDelete(id);
    if (!conversation) {
      return apiResponse(false, 404, "Conversation not found.");
    }

    // Also delete all messages in this conversation
    await import("@/model/WhatsAppMessage").then((m) =>
      m.WhatsAppMessage.deleteMany({ conversation: id }),
    );

    return apiResponse(
      true,
      200,
      "Conversation and its messages deleted successfully.",
    );
  },
  true,
);
