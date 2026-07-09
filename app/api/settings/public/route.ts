import { asyncHandler } from "@/lib/async-handler";
import { apiResponse, prependAwsBaseUrl } from "@/lib/server.utils";
import Settings from "@/model/Settings";

export const GET = asyncHandler(async () => {
  const doc = await Settings.findOne({})
    .select("general privacyPolicy termsOfService updatedAt")
    .lean();

  if (!doc) {
    return apiResponse(false, 404, "Settings not found!");
  }

  const { general, privacyPolicy, termsOfService } = doc;
  if (!general) {
    return apiResponse(false, 404, "General settings not found!");
  }

  let data: Record<string, any> = { ...general };

  data.appLogo = prependAwsBaseUrl(data.appLogo);
  data.backgroundImage = prependAwsBaseUrl(data.backgroundImage);
  if (Array.isArray(data.galleries)) {
    data.galleries = data.galleries.map((g: any) => prependAwsBaseUrl(g.url));
  }

  data.privacyPolicy = privacyPolicy?.content || "";
  data.termsOfService = termsOfService?.content || "";
  data.updatedAt = doc.updatedAt?.toISOString() || null;

  return apiResponse(
    true,
    200,
    "Settings data has been fetched successfully!",
    data,
  );
});
