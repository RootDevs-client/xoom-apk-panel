// app/api/public/subscribe/check/route.ts
import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { Subscribe } from "@/model/Subscribe";
import { NextRequest } from "next/server";

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const phone = searchParams.get("phone")?.trim();

  if (!phone) {
    return apiResponse(false, 400, "Phone number is required!");
  }

  const subscriber = await Subscribe.findOne({ phone });

  if (!subscriber) {
    return apiResponse(true, 200, "User is not subscribed!", {
      phone,
      isSubscribed: false,
      subscriber: null,
    });
  }

  return apiResponse(true, 200, "User is subscribed!", {
    isSubscribed: true,
    subscriber: {
      id: subscriber._id,
      phone: subscriber.phone,
      isActive: subscriber.isActive,
      createdAt: subscriber.createdAt,
      updatedAt: subscriber.updatedAt,
    },
  });
});
