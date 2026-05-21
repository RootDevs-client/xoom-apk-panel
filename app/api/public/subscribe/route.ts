// app/api/public/subscribe/check/route.ts
import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { createSubscribeSchema } from "@/lib/validation-schema";
import { Subscribe } from "@/model/Subscribe";

// ─── Check External API ──────────────────────────────────
async function checkExternalSubscription(phone: string) {
  try {
    const res = await fetch(
      "https://universal-subscription-api.vclipss.com/CheckSubscriberStatus",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msisdn: phone,
          userTelcoServiceId: 200,
          adAgencyCampaignId: 200,
          adAgencyCampaignTransactionId: "e027829f-b0b2-405f-a3c7-bd79e6fb6e04",
          userIP: "103.139.197.250",
          ua: "windows",
        }),
      },
    );
    return await res.json();
  } catch {
    return null;
  }
}

// ─── Main Route ──────────────────────────────────────────
export const POST = asyncHandler(createSubscribeSchema, async (req, data) => {
  const phone = data.phone.trim().replace(/^\+/, "");
  const reference = data.reference.trim();
  const platform = data.platform?.trim() || "";

  // ── Step 1: external API ──
  const externalRes = await checkExternalSubscription(phone);
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
      const newRecord = await Subscribe.create({
        phone,
        reference,
        platform,
        status: true,
      });

      return apiResponse(true, 201, "Subscribed successfully!", {
        phone,
        reference: newRecord.reference,
        platform: newRecord.platform,
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
          status: true,
        },
      },
      { new: true },
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
      { new: true },
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
