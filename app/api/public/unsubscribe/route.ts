import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { unsubscribeSchema } from "@/lib/validation-schema";
import { Subscribe } from "@/model/Subscribe";

export const PUT = asyncHandler(unsubscribeSchema, async (req, data) => {
  // Normalize phone
  const normalizedPhone = data.phone.trim().replace(/^\+/, "");

  // Find subscriber
  const subscriber = await Subscribe.findOne({
    phone: normalizedPhone,
  });

  // Not found
  if (!subscriber) {
    return apiResponse(false, 404, "Phone number not found!");
  }

  // Already unsubscribed
  if (!subscriber.status) {
    return apiResponse(false, 400, "Phone number already unsubscribed!");
  }

  // Update status
  subscriber.status = false;

  await subscriber.save();

  return apiResponse(true, 200, "Unsubscribed successfully!", subscriber);
});
