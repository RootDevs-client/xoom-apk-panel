import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { PromotionMethod } from "@/model/PromotionMethod";
import { NextRequest } from "next/server";

export const GET = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const promotionMethod = await PromotionMethod.findById(id).lean();

    if (!promotionMethod) {
      return apiResponse(false, 404, "Promotion method not found.");
    }

    return apiResponse(
      true,
      200,
      "Promotion method fetched successfully.",
      promotionMethod,
    );
  },
  true,
);

export const PATCH = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const body = await req.json();

    const { operator, is_active } = body;

    if (operator !== undefined && !operator?.trim()) {
      return apiResponse(false, 400, "Operator name cannot be empty.");
    }

    if (operator !== undefined) {
      const exists = await PromotionMethod.findOne({
        _id: { $ne: id },
        operator: operator.trim(),
      });

      if (exists) {
        return apiResponse(false, 409, "Operator already exists.");
      }
    }

    const updateData: Record<string, any> = {};
    if (operator !== undefined) updateData.operator = operator.trim();

    if (is_active !== undefined) updateData.is_active = is_active;

    const promotionMethod = await PromotionMethod.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!promotionMethod) {
      return apiResponse(false, 404, "Promotion method not found.");
    }

    return apiResponse(
      true,
      200,
      "Promotion method updated successfully.",
      promotionMethod,
    );
  },
  true,
);

export const DELETE = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const promotionMethod = await PromotionMethod.findByIdAndDelete(id);

    if (!promotionMethod) {
      return apiResponse(false, 404, "Promotion method not found.");
    }

    return apiResponse(true, 200, "Promotion method deleted successfully.");
  },
  true,
);
