import { NextRequest } from "next/server";
import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { Subscribe } from "@/model/Subscribe";

export const GET = asyncHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  const dateFilter: Record<string, any> = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  if (endDate) dateFilter.$lte = new Date(endDate);
  const matchStage = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

  const [overview, dailyTrend, platformBreakdown, locationBreakdown] =
    await Promise.all([
      Subscribe.aggregate([
        { $match: matchStage },
        {
          $facet: {
            total: [{ $count: "value" }],
            active: [{ $match: { status: true } }, { $count: "value" }],
            inactive: [{ $match: { status: false } }, { $count: "value" }],
          },
        },
        {
          $project: {
            total: { $ifNull: [{ $arrayElemAt: ["$total.value", 0] }, 0] },
            active: { $ifNull: [{ $arrayElemAt: ["$active.value", 0] }, 0] },
            inactive: { $ifNull: [{ $arrayElemAt: ["$inactive.value", 0] }, 0] },
          },
        },
      ]).exec(),

      Subscribe.aggregate([
        {
          $match: Object.keys(dateFilter).length
            ? { createdAt: dateFilter }
            : { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", count: 1 } },
      ]).exec(),

      Subscribe.aggregate([
        { $match: matchStage },
        { $group: { _id: "$platform", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, platform: "$_id", count: 1 } },
      ]).exec(),

      Subscribe.aggregate([
        { $match: matchStage },
        { $unwind: "$deviceInfo" },
        { $match: { "deviceInfo.location.country": { $exists: true, $ne: null } } },
        { $group: { _id: "$deviceInfo.location.country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $project: { _id: 0, country: "$_id", count: 1 } },
      ]).exec(),
    ]);

  return apiResponse(true, 200, "Analytics fetched successfully!", {
    overview: {
      total: overview[0]?.total ?? 0,
      active: overview[0]?.active ?? 0,
      inactive: overview[0]?.inactive ?? 0,
    },
    dailyTrend,
    platformBreakdown,
    locationBreakdown,
  });
}, true);
