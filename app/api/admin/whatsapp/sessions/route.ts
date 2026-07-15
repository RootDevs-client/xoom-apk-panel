import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { createBaileysChannelSchema } from "@/lib/validation-schema";
import { WhatsAppSession } from "@/model/WhatsAppSession";
import { NextRequest } from "next/server";

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.max(Number(searchParams.get("limit")) || 10, 1);
  const search = searchParams.get("search")?.trim() || "";

  const filter: Record<string, any> = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const [sessions, total] = await Promise.all([
    WhatsAppSession.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    WhatsAppSession.countDocuments(filter),
  ]);

  const sanitized = sessions.map((s: any) => ({
    _id: s._id,
    name: s.name,
    phoneNumber: s.phoneNumber || null,
    waDisplayName: s.waDisplayName || null,
    profilePicUrl: s.profilePicUrl || null,
    connectionStatus: s.connectionStatus || "idle",
    errorMessage: s.errorMessage || null,
    baileysJid: s.baileysJid || null,
    lastConnectedAt: s.lastConnectedAt || null,
    qrCodeRetries: s.qrCodeRetries || 0,
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  }));

  return apiResponse(true, 200, "Channels fetched successfully.", {
    sessions: sanitized,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
}, true);

export const POST = asyncHandler(
  createBaileysChannelSchema,
  async (_req, data) => {
    const session = await WhatsAppSession.create({
      name: data.name.trim(),
      connectionStatus: "idle",
      qrCodeRetries: 0,
    });

    const created = session.toObject();

    return apiResponse(
      true,
      201,
      "WhatsApp channel created. Scan the QR code to connect.",
      {
        _id: created._id,
        name: created.name,
        connectionStatus: created.connectionStatus,
        createdAt: created.createdAt,
      },
    );
  },
  true,
);
