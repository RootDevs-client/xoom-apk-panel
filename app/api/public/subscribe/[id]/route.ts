import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { updateSubscribeSchema } from "@/lib/validation-schema";
import { Subscribe } from "@/model/Subscribe";
import { Types } from "mongoose";

// Update
export const PUT = asyncHandler(
  updateSubscribeSchema,
  async (req, data, params) => {
    const { id } = params;
    if (!id || Types.ObjectId.isValid(id) === false) {
      return apiResponse(false, 400, "Invalid or missing subscribe id!");
    }
    const result = await Subscribe.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!result) {
      return apiResponse(false, 404, "Subscribe not found!");
    }

    return apiResponse(true, 200, "Subscribe Us updated successfully!", result);
  },
);
