import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { TelcoOperator } from "@/model/TelcoOperator";
import { NextRequest } from "next/server";

export const POST = asyncHandler(async (req: NextRequest) => {
  const body = await req.json();

  const { name, code, country, telcoParameterValues, variant, configs, settings, isActive } = body;

  if (!name?.trim()) {
    return apiResponse(false, 400, "Operator name is required.");
  }
  if (!code?.trim()) {
    return apiResponse(false, 400, "Operator code is required.");
  }
  if (!country?.trim()) {
    return apiResponse(false, 400, "Country is required.");
  }

  const exists = await TelcoOperator.findOne({
    code: code.trim().toUpperCase(),
  });

  if (exists) {
    return apiResponse(false, 409, "Operator with this code already exists.");
  }

  const telcoOperator = await TelcoOperator.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    country: country.trim(),
    telcoParameterValues: telcoParameterValues ?? "",
    variant: variant ?? "STANDARD",
    configs: configs ?? [],
    settings: settings ?? { mode: "instant", hold: {} },
    is_active: isActive ?? true,
  });

  return apiResponse(
    true,
    201,
    "Operator created successfully.",
    telcoOperator,
  );
}, true);

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);

  const page = Math.max(Number(searchParams.get("page")) || 1, 1);
  const limit = Math.max(Number(searchParams.get("limit")) || 10, 1);
  const search = searchParams.get("search")?.trim() || "";

  const filter: Record<string, any> = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
      { country: { $regex: search, $options: "i" } },
    ];
  }

  const [telcoOperators, total] = await Promise.all([
    TelcoOperator.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),

    TelcoOperator.countDocuments(filter),
  ]);

  return apiResponse(true, 200, "Operators fetched successfully.", {
    telcoOperators,
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
