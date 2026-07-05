import dbConnect from "@/config/database";
import { checkExternalSubscription } from "@/lib/check-external-subscription";
import { apiResponse } from "@/lib/server.utils";
import { validateApiKey } from "@/lib/validate-api-key";
import { Subscribe } from "@/model/Subscribe";
import fs from "fs";
import { NextRequest } from "next/server";
import path from "path";

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const number = searchParams.get("number");
  if (!number) {
    const filePath = path.join(process.cwd(), "templates", "kuwait.html");
    const html = fs.readFileSync(filePath, "utf-8");
    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const apiKeyError = validateApiKey(req);
  if (apiKeyError) return apiKeyError;

  await dbConnect();

  const phone = number.trim().replace(/\s/g, "").replace(/^\+/, "");

  const subscriber = await Subscribe.findOne({ phone });

  if (!subscriber || !subscriber.status) {
    const filePath = path.join(process.cwd(), "templates", "kuwait.html");
    const html = fs.readFileSync(filePath, "utf-8");
    return new Response(html, {
      status: 200,
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }

  const externalRes = await checkExternalSubscription({
    phone,
    adAgencyCampaignTransactionId: subscriber.reference,
    userIP:
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      undefined,
  });

  if (!externalRes) {
    return apiResponse(false, 503, "External service unavailable!");
  }

  return apiResponse(true, 200, "Subscriber found", {
    phone: subscriber.phone,
    reference: subscriber.reference,
    platform: subscriber.platform,
    membershipPlan: subscriber.membershipPlan,
    expiryDate: subscriber.expiryDate,
    isSubscribed: subscriber.status,
    externalStatus: externalRes.responseMessage,
    createdAt: subscriber.createdAt,
    updatedAt: subscriber.updatedAt,
  });
};
