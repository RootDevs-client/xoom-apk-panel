import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { unsubscribeExternal } from "@/lib/unsubscribe-external";
import { Subscribe } from "@/model/Subscribe";
import { Types } from "mongoose";

export const POST = asyncHandler(async (_req, params) => {
  const { id } = params;

  if (!id || !Types.ObjectId.isValid(id)) {
    return apiResponse(false, 400, "Invalid or missing subscribe id!");
  }

  const subscriber = await Subscribe.findById(id);
  if (!subscriber) {
    return apiResponse(false, 404, "Subscriber not found!");
  }

  if (!subscriber.status) {
    return apiResponse(false, 400, "Subscriber is already inactive!");
  }

  const externalRes = await unsubscribeExternal(
    subscriber.phone,
    subscriber.reference,
    subscriber.platform,
  );

  await Subscribe.findByIdAndUpdate(id, { $set: { status: false } });

  return apiResponse(true, 200, "Unsubscribed successfully!", {
    externalResponse: externalRes,
  });
}, true);
