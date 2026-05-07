import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { createSubscribeSchema } from "@/lib/validation-schema";
import { Subscribe } from "@/model/Subscribe";

export const POST = asyncHandler(createSubscribeSchema, async (req, data) => {
  // Normalize phone number
  data.phone = data.phone.trim().replace(/^\+/, "");

  const result = await Subscribe.create({
    ...data,
  });

  return apiResponse(true, 201, "Contact created successfully!", result);
});
