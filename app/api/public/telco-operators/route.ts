import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { TelcoOperator } from "@/model/TelcoOperator";
import { NextRequest } from "next/server";

export const GET = asyncHandler(async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const operator = searchParams.get("operator");
  const is_active = searchParams.get("is_active");

  const filter: Record<string, any> = {
    is_active: true,
  };

  if (id) {
    filter._id = id;
  }

  if (operator) {
    filter.$or = [
      { name: { $regex: operator, $options: "i" } },
      { code: { $regex: operator, $options: "i" } },
    ];
  }

  if (is_active !== null) {
    filter.is_active = is_active === "true";
  }

  const telcoOperators = await TelcoOperator.find(filter)
    .sort({ createdAt: -1 })
    .lean();

  return apiResponse(true, 200, "Operators fetched successfully.", {
    telcoOperators,
  });
});
