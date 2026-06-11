import { asyncHandler } from "@/lib/async-handler";
import { apiResponse, prependAwsBaseUrl } from "@/lib/server.utils";
import Settings from "@/model/Settings";
import { NextRequest } from "next/server";

export const GET = asyncHandler(async (req: NextRequest) => {
  const { general } = (await Settings.findOne({}).select("general").lean()) || {};
  if (!general) {
    return apiResponse(false, 404, "General settings not found!");
  }

  let data: Record<string, any> = { ...general };

  data.appLogo = prependAwsBaseUrl(data.appLogo);
  data.backgroundImage = prependAwsBaseUrl(data.backgroundImage);
  if (Array.isArray(data.galleries)) {
    data.galleries = data.galleries.map((g: any) => prependAwsBaseUrl(g.url));
  }

  return apiResponse(
    true,
    200,
    "Settings data has been fetched successfully!",
    data,
  );
});
