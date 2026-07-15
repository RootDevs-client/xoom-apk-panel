import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { updateBaileysChannelSchema } from "@/lib/validation-schema";
import { WhatsAppSession } from "@/model/WhatsAppSession";
import { NextRequest } from "next/server";

export const GET = asyncHandler(
  async (_req: NextRequest, { id }: { id: string }) => {
    const session = await WhatsAppSession.findById(id)
      .select("-authCreds -authKeys")
      .lean();
    if (!session) {
      return apiResponse(false, 404, "Channel not found.");
    }
    return apiResponse(true, 200, "Channel fetched.", session);
  },
  true,
);

export const PATCH = asyncHandler(
  updateBaileysChannelSchema,
  async (_req: NextRequest, data, { id }: { id: string }) => {
    const updateData: Record<string, any> = {};
    if (data.name) updateData.name = data.name.trim();

    const session = await WhatsAppSession.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    )
      .select("-authCreds -authKeys")
      .lean();

    if (!session) {
      return apiResponse(false, 404, "Channel not found.");
    }

    return apiResponse(true, 200, "Channel updated.", session);
  },
  true,
);

export const DELETE = asyncHandler(
  async (_req: NextRequest, { id }: { id: string }) => {
    const session = await WhatsAppSession.findByIdAndDelete(id);
    if (!session) {
      return apiResponse(false, 404, "Channel not found.");
    }

    await Promise.all([
      import("@/model/WhatsAppMessage").then((m) =>
        m.WhatsAppMessage.deleteMany({ session: id }),
      ),
      import("@/model/BaileysConversation").then((c) =>
        c.BaileysConversation.deleteMany({ session: id }),
      ),
    ]);

    return apiResponse(true, 200, "Channel and associated data deleted.");
  },
  true,
);
