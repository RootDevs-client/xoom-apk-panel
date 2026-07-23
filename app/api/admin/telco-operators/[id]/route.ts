import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { TelcoOperator } from "@/model/TelcoOperator";
import { NextRequest } from "next/server";

export const GET = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const telcoOperator = await TelcoOperator.findById(id).lean();

    if (!telcoOperator) {
      return apiResponse(false, 404, "Operator not found.");
    }

    return apiResponse(
      true,
      200,
      "Operator fetched successfully.",
      telcoOperator,
    );
  },
  true,
);

export const PATCH = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const body = await req.json();

    const { name, code, country, evinaEnabled, telcoParameterValues, variant, pinLocation, configs, is_active } = body;

    if (code !== undefined && !code?.trim()) {
      return apiResponse(false, 400, "Operator code cannot be empty.");
    }
    if (name !== undefined && !name?.trim()) {
      return apiResponse(false, 400, "Operator name cannot be empty.");
    }

    if (code !== undefined) {
      const exists = await TelcoOperator.findOne({
        _id: { $ne: id },
        code: code.trim().toUpperCase(),
      });

      if (exists) {
        return apiResponse(false, 409, "Operator with this code already exists.");
      }
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (code !== undefined) updateData.code = code.trim().toUpperCase();
    if (country !== undefined) updateData.country = country.trim();
    if (evinaEnabled !== undefined) updateData.evinaEnabled = evinaEnabled;
    if (telcoParameterValues !== undefined) updateData.telcoParameterValues = telcoParameterValues;
    if (variant !== undefined) updateData.variant = variant;
    if (pinLocation !== undefined) updateData.pinLocation = pinLocation;
    if (configs !== undefined) updateData.configs = configs;
    if (is_active !== undefined) updateData.is_active = is_active;

    const telcoOperator = await TelcoOperator.findByIdAndUpdate(
      id,
      updateData,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!telcoOperator) {
      return apiResponse(false, 404, "Operator not found.");
    }

    return apiResponse(
      true,
      200,
      "Operator updated successfully.",
      telcoOperator,
    );
  },
  true,
);

export const DELETE = asyncHandler(
  async (req: NextRequest, { id }: { id: string }) => {
    const telcoOperator = await TelcoOperator.findByIdAndDelete(id);

    if (!telcoOperator) {
      return apiResponse(false, 404, "Operator not found.");
    }

    return apiResponse(true, 200, "Operator deleted successfully.");
  },
  true,
);
