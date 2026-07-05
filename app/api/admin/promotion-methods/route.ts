import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { PromotionMethod } from "@/model/PromotionMethod";
import { NextRequest } from "next/server";

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();

  const { operator, promotional, non_promotional, is_active } = body;

  if (!operator?.trim()) {
    return apiResponse(false, 400, "Operator name is required.");
  }

  const exists = await PromotionMethod.findOne({
    operator: operator.trim(),
  });

  if (exists) {
    return apiResponse(false, 409, "Operator already exists.");
  }

  const promotionMethod = await PromotionMethod.create({
    operator: operator.trim(),
    promotional: promotional ?? false,
    non_promotional: non_promotional ?? false,
    is_active: is_active ?? true,
  });

  return apiResponse(true, 201, "Promotion method created successfully.", promotionMethod);
}, true);

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.max(Number(searchParams.get("limit")) || 10, 1);
  const search = searchParams.get("search")?.trim() || "";

  const filter: Record<string, any> = {};

  if (search) {
    filter.$or = [
      { operator: { $regex: search, $options: "i" } },
    ];
  }

  const [promotionMethods, total] = await Promise.all([
    PromotionMethod.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    PromotionMethod.countDocuments(filter),
  ]);

  return apiResponse(true, 200, "Promotion methods fetched successfully.", {
    promotionMethods,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1,
    },
  });
}, true);
