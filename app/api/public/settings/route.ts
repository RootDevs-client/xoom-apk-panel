import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import Settings from "@/model/Settings";
import { NextRequest } from "next/server";

export const GET = asyncHandler(async (req: NextRequest) => {
  const { general } = (await Settings.findOne({}).select("general").lean()) || {};
  if (!general) {
    return apiResponse(false, 404, "General settings not found!");
  }

  const data: Record<string, any> = { ...general };
  if (Array.isArray(data.galleries)) {
    data.galleries = data.galleries.map((g: any) => g.url);
  }

  return apiResponse(
    true,
    200,
    "Settings data has been fetched successfully!",
    data,
  );
});
