import dbConnect from "@/config/database";
import Settings from "@/model/Settings";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  await dbConnect();
  const settings = await Settings.findOne({})
    .select("general.universalSubscriptionApiUrl")
    .lean();
  const baseUrl =
    settings?.general?.universalSubscriptionApiUrl ||
    process.env.UNIVERSAL_SUBSCRIPTION_API_URL ||
    "https://universal-subscription-api.vclipss.com";

  try {
    const body = await req.json();
    const userIP =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
      req.headers.get("x-real-ip") ??
      "3.2.56.255";
    const res = await fetch(`${baseUrl}/getevinajs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, userIP }),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { status: "Fail", responseMessage: "Proxy request failed" },
      { status: 502 },
    );
  }
};
