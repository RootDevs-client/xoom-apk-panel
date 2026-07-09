import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { settingsTermsSchema } from "@/lib/validation-schema";
import Settings from "@/model/Settings";
import { NextRequest } from "next/server";

export const PUT = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();

  const data = settingsTermsSchema.parse(body);

  const updateFields: Record<string, any> = {};
  if (data.content !== undefined) {
    updateFields["termsOfService.content"] = data.content;
  }

  await Settings.findOneAndUpdate({}, { $set: updateFields }, { upsert: true });

  return apiResponse(
    true,
    200,
    "Terms & conditions has been updated successfully!",
  );
}, true);

export const GET = asyncHandler(async () => {
  const settings = await Settings.findOne({});
  const content = settings?.termsOfService?.content || "";

  return apiResponse(
    true,
    200,
    "Terms & conditions has been fetched successfully!",
    { content },
  );
}, true);
