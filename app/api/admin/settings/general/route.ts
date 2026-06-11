import { asyncHandler } from "@/lib/async-handler";
import { apiResponse, prependAwsBaseUrl } from "@/lib/server.utils";
import { settingsGeneralSchema } from "@/lib/validation-schema";
import Settings from "@/model/Settings";
import { NextRequest } from "next/server";

export const PUT = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();

  const data = settingsGeneralSchema.parse(body);

  const updateFields = Object.entries(data).reduce(
    (acc, [key, value]) => {
      if (value !== undefined) {
        acc[`general.${key}`] = value;
      }
      return acc;
    },
    {} as Record<string, any>,
  );

  await Settings.findOneAndUpdate({}, { $set: updateFields }, { upsert: true });

  return apiResponse(
    true,
    200,
    "General settings has been updated successfully!",
  );
}, true);

export const GET = asyncHandler(async () => {
  const { general } = (await Settings.findOne({})) || {};

  if (!general) {
    return apiResponse(false, 404, "General settings not found!");
  }

  const data = general.toObject();

  data.appLogo = prependAwsBaseUrl(data.appLogo);
  data.backgroundImage = prependAwsBaseUrl(data.backgroundImage);
  if (Array.isArray(data.galleries)) {
    data.galleries = data.galleries.map((g: any) => ({
      ...g,
      url: prependAwsBaseUrl(g.url),
    }));
  }

  return apiResponse(
    true,
    200,
    "General settings has been fetched successfully!",
    data,
  );
}, true);
