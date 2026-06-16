import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { createEventSchema } from "@/lib/validation-schema";
import { Event } from "@/model/Event";

export const POST = asyncHandler(createEventSchema, async (req, data) => {
  const event = await Event.create({
    ...data,
    userId: data.userId ?? null,
  });

  return apiResponse(true, 201, "Event recorded!", {
    id: event._id,
    createdAt: event.createdAt,
  });
});
