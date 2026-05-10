// app/api/public/subscribe/route.ts
import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { createSubscribeSchema } from "@/lib/validation-schema";
import { Subscribe } from "@/model/Subscribe";

export const POST = asyncHandler(createSubscribeSchema, async (req, data) => {
  const phone = data.phone.trim().replace(/^\+/, "");

  // atomic upsert —
  const existing = await Subscribe.findOne({ phone });

  if (existing) {
    // already exists
    if (existing.status === true) {
      return apiResponse(true, 200, "Phone number is already subscribed!", {
        phone,
        status: existing.status,
        createdAt: existing.createdAt,
        updatedAt: existing.updatedAt,
      });
    }

    // inactive → reactivate
    existing.status = true;
    await existing.save();
    return apiResponse(true, 200, "Subscription reactivated successfully!", {
      phone,
      status: existing.status,
      createdAt: existing.createdAt,
      updatedAt: existing.updatedAt,
    });
  }

  // use findOneAndUpdate upsert — prevents race condition
  try {
    const result = await Subscribe.findOneAndUpdate(
      { phone },
      {
        $set: { status: true },
        $setOnInsert: { phone },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
      },
    );

    return apiResponse(true, 201, "Subscribed successfully!", {
      phone: result.phone,
      status: result.status,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    });
  } catch (err: any) {
    //  unique index catches any duplicate
    if (err.code === 11000) {
      return apiResponse(true, 200, "Phone number is already subscribed!", {
        phone,
        status: true,
      });
    }
    throw err;
  }
});
