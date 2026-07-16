import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { BaileysConversation } from "@/model/BaileysConversation";
import { NextRequest } from "next/server";

export const PATCH = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const body = await req.json();
    const { displayName } = body;

    if (displayName !== undefined && typeof displayName !== "string") {
      return apiResponse(false, 400, "displayName must be a string.");
    }

    const conversation = await BaileysConversation.findByIdAndUpdate(
      id,
      { displayName: displayName || null },
      { new: true },
    );

    if (!conversation) {
      return apiResponse(false, 404, "Conversation not found.");
    }

    return apiResponse(true, 200, "Display name updated.", {
      conversation,
    });
  },
  true,
);

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
