import { asyncHandler } from "@/lib/async-handler";
import { checkExternalSubscription } from "@/lib/check-external-subscription";
import { apiResponse } from "@/lib/server.utils";
import { Subscribe } from "@/model/Subscribe";
import { NextRequest } from "next/server";

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  let phone = searchParams.get("phone");

  if (!phone) {
    return apiResponse(false, 400, "Phone number is required!");
  }

  phone = decodeURIComponent(phone)
    .trim()
    .replace(/\s/g, "")
    .replace(/^\+/, "");

  const subscriber = await Subscribe.findOne({ phone });

  if (!subscriber) {
    return apiResponse(true, 200, "User is not subscribed!", {
      phone,
      isSubscribed: false,
      subscriber: null,
    });
  }

  const userIP =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    undefined;

  const externalRes = await checkExternalSubscription({
    phone,
    adAgencyCampaignTransactionId: subscriber.reference,
    userIP,
  });

  if (!externalRes) {
    return apiResponse(false, 503, "External service unavailable!");
  }

  const isExtActive = externalRes.responseMessage === "Active";

  if (!isExtActive) {
    await Subscribe.findOneAndUpdate(
      { phone },
      { $set: { status: false } },
      { returnDocument: "after" },
    );

    return apiResponse(true, 200, "User is not subscribed!", {
      phone,
      isSubscribed: false,
      externalStatus: externalRes.responseMessage,
      subscriber: null,
    });
  }

  if (subscriber.status === false) {
    await Subscribe.findOneAndUpdate(
      { phone },
      { $set: { status: true } },
      { returnDocument: "after" },
    );
  }

  return apiResponse(true, 200, "User is subscribed!", {
    isSubscribed: true,
    externalStatus: externalRes.responseMessage,
    subscriber: {
      id: subscriber._id,
      phone: subscriber.phone,
      isSubscribe: true,
      createdAt: subscriber.createdAt,
      updatedAt: subscriber.updatedAt,
    },
  });
});
