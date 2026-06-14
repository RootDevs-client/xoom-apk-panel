import { asyncHandler } from "@/lib/async-handler";
import { checkExternalSubscription } from "@/lib/check-external-subscription";
import { createXoomSportsUser } from "@/lib/create-xoom-sports-user";
import { getLocationFromIP } from "@/lib/location";
import { apiResponse } from "@/lib/server.utils";
import { createSubscribeSchema } from "@/lib/validation-schema";
import { Subscribe } from "@/model/Subscribe";

// ─── Main Route ──────────────────────────────────────────
export const POST = asyncHandler(createSubscribeSchema, async (req, data) => {
  const phone = data.phone.trim().replace(/^\+/, "");
  const reference = data.reference.trim();
  const platform = data.platform?.trim() || "";
  const membershipPlan = data.membershipPlan?.trim() || "Daily";
  const expiryDate = data.expiryDate?.trim();

  const userIP =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    undefined;
  const deviceInfoEntry: Record<string, any> = { ...(data.deviceInfo ?? {}) };
  if (userIP) {
    deviceInfoEntry.ip = userIP;
    const location = await getLocationFromIP(userIP);
    if (location.country !== "Unknown") {
      deviceInfoEntry.location = location;
    }
  }

  // ── Step 1: external API ──
  const externalRes = await checkExternalSubscription({
    phone,
    adAgencyCampaignTransactionId: reference,
    userIP,
  });
  const isExtActive = externalRes?.responseMessage === "Active";

  if (!externalRes) {
    return apiResponse(false, 503, "External service unavailable!");
  }

  // ── Step 2: local DB ──
  const dbRecord = await Subscribe.findOne({ phone });

  // ═══════════════════════════════════════════════════════
  // CASE 1: External Active
  // ═══════════════════════════════════════════════════════
  if (isExtActive) {
    // ── DB not found → create new ──
    if (!dbRecord) {
      await createXoomSportsUser({
        phone: data.phone.trim(),
        membershipPlan,
        expiryDate,
        reference,
        platform,
      });

      const newRecord = await Subscribe.create({
        phone,
        reference,
        platform,
        membershipPlan,
        expiryDate,
        status: true,
        deviceInfo: [deviceInfoEntry],
      });

      return apiResponse(true, 201, "Subscribed successfully!", {
        phone,
        reference: newRecord.reference,
        platform: newRecord.platform,
        membershipPlan: newRecord.membershipPlan,
        expiryDate: newRecord.expiryDate,
        isSubscribed: true,
        source: "external-active-created",
        externalStatus: externalRes.responseMessage,
        dbStatus: true,
        createdAt: newRecord.createdAt,
        updatedAt: newRecord.updatedAt,
      });
    }

    // ── DB found → update reference, platform, status ──
    const updated = await Subscribe.findOneAndUpdate(
      { phone },
      {
        $set: {
          reference,
          platform,
          membershipPlan,
          expiryDate,
          status: true,
        },
        $push: { deviceInfo: deviceInfoEntry },
      },
      { returnDocument: "after" },
    );

    const source =
      dbRecord.status === false
        ? "external-active-reactivated"
        : "external-active-existing";

    const message =
      dbRecord.status === false
        ? "Subscription reactivated!"
        : "User is already subscribed!";

    return apiResponse(true, 200, message, {
      phone,
      reference: updated!.reference,
      platform: updated!.platform,
      membershipPlan: updated!.membershipPlan,
      expiryDate: updated!.expiryDate,
      isSubscribed: true,
      source,
      externalStatus: externalRes.responseMessage,
      dbStatus: true,
      createdAt: updated!.createdAt,
      updatedAt: updated!.updatedAt,
    });
  }

  // ═══════════════════════════════════════════════════════
  // CASE 2: External Not Active
  // ═══════════════════════════════════════════════════════

  // DB active → deactivate
  if (dbRecord && dbRecord.status === true) {
    const updated = await Subscribe.findOneAndUpdate(
      { phone },
      { $set: { status: false } },
      { returnDocument: "after" },
    );

    return apiResponse(true, 200, "Subscription deactivated!", {
      phone,
      reference: updated!.reference,
      platform: updated!.platform,
      isSubscribed: false,
      source: "external-inactive-deactivated",
      externalStatus: externalRes.responseMessage,
      dbStatus: false,
      createdAt: updated!.createdAt,
      updatedAt: updated!.updatedAt,
    });
  }

  // DB inactive → nothing
  if (dbRecord && dbRecord.status === false) {
    return apiResponse(true, 200, "User is not subscribed!", {
      phone,
      reference: dbRecord.reference,
      platform: dbRecord.platform,
      isSubscribed: false,
      source: "external-inactive-already",
      externalStatus: externalRes.responseMessage,
      dbStatus: false,
      createdAt: dbRecord.createdAt,
      updatedAt: dbRecord.updatedAt,
    });
  }

  // DB not found → not subscribed
  return apiResponse(true, 200, "User is not subscribed!", {
    phone,
    reference: null,
    platform: null,
    isSubscribed: false,
    source: "external-inactive-not-found",
    externalStatus: externalRes.responseMessage,
    dbStatus: null,
  });
});
