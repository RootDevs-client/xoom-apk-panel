import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { MetaChannel } from "@/model/MetaChannel";
import { NextRequest } from "next/server";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1, "Name is required!").trim(),
  phoneNumberId: z.string().min(1, "Phone Number ID is required!").trim(),
  accessToken: z.string().min(1, "Access token is required!").trim(),
  webhookSecret: z.string().optional(),
});

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.max(Number(searchParams.get("limit")) || 10, 1);
  const search = searchParams.get("search")?.trim() || "";

  const filter: Record<string, any> = {};
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const [channels, total] = await Promise.all([
    MetaChannel.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    MetaChannel.countDocuments(filter),
  ]);

  const sanitized = channels.map((c: any) => ({
    _id: c._id,
    name: c.name,
    phoneNumberId: c.phoneNumberId,
    phoneNumber: c.phoneNumber || null,
    displayName: c.displayName || null,
    isActive: c.isActive,
    isWebhookVerified: c.isWebhookVerified,
    errorMessage: c.errorMessage || null,
    lastVerifiedAt: c.lastVerifiedAt || null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));

  return apiResponse(true, 200, "Meta channels fetched successfully.", {
    channels: sanitized,
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
  createSchema,
  async (_req, data) => {
    const channel = await MetaChannel.create({
      name: data.name.trim(),
      phoneNumberId: data.phoneNumberId.trim(),
      accessToken: data.accessToken,
      webhookSecret: data.webhookSecret || null,
      isActive: true,
    });

    const created = channel.toObject();

    return apiResponse(true, 201, "Meta channel created.", {
      _id: created._id,
      name: created.name,
      phoneNumberId: created.phoneNumberId,
      isActive: created.isActive,
      createdAt: created.createdAt,
    });
  },
  true,
);
