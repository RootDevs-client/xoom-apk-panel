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

// ─── Main Route — POST ───────────────────────────────────
export const POST = asyncHandler(createSubscribeSchema, async (req, data) => {
  const phone = data.phone.trim().replace(/^\+/, "");

  // ── Step 1: check external API ──
  const externalRes = await checkExternalSubscription(phone);
  const isExtActive = externalRes?.responseMessage === "Active";

  // ── Step 2: check local DB ──
  const dbRecord = await Subscribe.findOne({ phone });

  // ═══════════════════════════════════════════════
  // CASE 1: External Active
  // → already subscribed, sync DB
  // ═══════════════════════════════════════════════
  if (isExtActive) {
    if (!dbRecord) {
      // DB not found → create new
      const newRecord = await Subscribe.create({ phone, status: true });
      return apiResponse(true, 201, "Subscribed successfully!", {
        phone,
        isSubscribed: true,
        source: "external-active-created",
        externalStatus: externalRes?.responseMessage,
        dbStatus: true,
        createdAt: newRecord.createdAt,
        updatedAt: newRecord.updatedAt,
      });
    }
    if (dbRecord.status === false) {
      // in DB but inactive → reactivate
      dbRecord.status = true;
      await dbRecord.save();
      return apiResponse(true, 200, "Subscription reactivated!", {
        phone,
        isSubscribed: true,
        source: "external-active-reactivated",
        externalStatus: externalRes?.responseMessage,
        dbStatus: true,
        createdAt: dbRecord.createdAt,
        updatedAt: dbRecord.updatedAt,
      });
    }

    // in DB already active → nothing to do
    return apiResponse(true, 200, "User is already subscribed!", {
      phone,
      isSubscribed: true,
      source: "external-active-existing",
      externalStatus: externalRes?.responseMessage,
      dbStatus: true,
      createdAt: dbRecord.createdAt,
      updatedAt: dbRecord.updatedAt,
    });
  }

  // ═══════════════════════════════════════════════
  // CASE 2: External Not Active
  // ═══════════════════════════════════════════════
  if (dbRecord && dbRecord.status === true) {
    // in DB active → make inactive
    dbRecord.status = false;
    await dbRecord.save();
    return apiResponse(true, 200, "Subscription deactivated!", {
      phone,
      isSubscribed: false,
      source: "external-inactive-deactivated",
      externalStatus: externalRes?.responseMessage,
      dbStatus: false,
      createdAt: dbRecord.createdAt,
      updatedAt: dbRecord.updatedAt,
    });
  }

  if (dbRecord && dbRecord.status === false) {
    // already inactive in DB → nothing to do
    return apiResponse(true, 200, "User is not subscribed!", {
      phone,
      isSubscribed: false,
      source: "external-inactive-already",
      externalStatus: externalRes?.responseMessage,
      dbStatus: false,
      createdAt: dbRecord.createdAt,
      updatedAt: dbRecord.updatedAt,
    });
  }

  // DB not found → not subscribed
  return apiResponse(true, 200, "User is not subscribed!", {
    phone,
    isSubscribed: false,
    source: "external-inactive-not-found",
    externalStatus: externalRes?.responseMessage,
    dbStatus: null,
  });
});
