import { NextRequest } from "next/server";
import { asyncHandler } from "@/lib/async-handler";
import { apiResponse } from "@/lib/server.utils";
import { Event } from "@/model/Event";

export const GET = asyncHandler(async (req: NextRequest) => {
  const url = new URL(req.url);
  const startDate = url.searchParams.get("startDate");
  const endDate = url.searchParams.get("endDate");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const dateFilter: Record<string, Date> = {};
  if (startDate) dateFilter.$gte = new Date(startDate);
  else dateFilter.$gte = thirtyDaysAgo;
  if (endDate) dateFilter.$lte = new Date(endDate);
  else dateFilter.$lte = now;

  const matchStage = { createdAt: dateFilter };

  const [overview, deviceAnalytics, dailyTrend, osGroup, osVersionGroup, deviceBrandGroup, deviceModelGroup, ipGroup, countryGroup, cityGroup] =
    await Promise.all([
      Event.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$event",
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: null,
            events: { $push: { event: "$_id", count: "$count" } },
            total: { $sum: "$count" },
          },
        },
        {
          $project: {
            _id: 0,
            total: 1,
            events: 1,
          },
        },
      ]).exec(),

      Event.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: "$deviceId",
            firstopen: { $sum: { $cond: [{ $eq: ["$event", "firstopen"] }, 1, 0] } },
            appopen: { $sum: { $cond: [{ $eq: ["$event", "appopen"] }, 1, 0] } },
            appclose: { $sum: { $cond: [{ $eq: ["$event", "appclose"] }, 1, 0] } },
          },
        },
        {
          $project: {
            _id: 0,
            deviceId: "$_id",
            firstopen: 1,
            appopen: 1,
            appclose: 1,
          },
        },
        { $sort: { firstopen: -1 } },
      ]).exec(),

      Event.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            firstopen: { $sum: { $cond: [{ $eq: ["$event", "firstopen"] }, 1, 0] } },
            appopen: { $sum: { $cond: [{ $eq: ["$event", "appopen"] }, 1, 0] } },
            appclose: { $sum: { $cond: [{ $eq: ["$event", "appclose"] }, 1, 0] } },
          },
        },
        { $sort: { _id: 1 } },
        { $project: { _id: 0, date: "$_id", firstopen: 1, appopen: 1, appclose: 1 } },
      ]).exec(),

      Event.aggregate([
        { $match: { ...matchStage, os: { $exists: true, $ne: "" } } },
        { $group: { _id: "$os", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, os: "$_id", count: 1 } },
      ]).exec(),

      Event.aggregate([
        { $match: { ...matchStage, osVersion: { $exists: true, $ne: "" } } },
        { $group: { _id: "$osVersion", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, osVersion: "$_id", count: 1 } },
      ]).exec(),

      Event.aggregate([
        { $match: { ...matchStage, deviceBrand: { $exists: true, $ne: "" } } },
        { $group: { _id: "$deviceBrand", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, deviceBrand: "$_id", count: 1 } },
      ]).exec(),

      Event.aggregate([
        { $match: { ...matchStage, deviceModel: { $exists: true, $ne: "" } } },
        { $group: { _id: "$deviceModel", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, deviceModel: "$_id", count: 1 } },
      ]).exec(),

      Event.aggregate([
        { $match: { ...matchStage, ip: { $exists: true, $ne: "" } } },
        { $group: { _id: "$ip", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, ip: "$_id", count: 1 } },
      ]).exec(),

      Event.aggregate([
        { $match: { ...matchStage, country: { $exists: true, $ne: "" } } },
        { $group: { _id: "$country", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, country: "$_id", count: 1 } },
      ]).exec(),

      Event.aggregate([
        { $match: { ...matchStage, city: { $exists: true, $ne: "" } } },
        { $group: { _id: "$city", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $project: { _id: 0, city: "$_id", count: 1 } },
      ]).exec(),
    ]);

  return apiResponse(true, 200, "Event analytics fetched successfully!", {
    overview: {
      total: overview[0]?.total ?? 0,
      firstopen: overview[0]?.events?.find((e: any) => e.event === "firstopen")?.count ?? 0,
      appopen: overview[0]?.events?.find((e: any) => e.event === "appopen")?.count ?? 0,
      appclose: overview[0]?.events?.find((e: any) => e.event === "appclose")?.count ?? 0,
    },
    deviceAnalytics,
    dailyTrend,
    osGroup,
    osVersionGroup,
    deviceBrandGroup,
    deviceModelGroup,
    ipGroup,
    countryGroup,
    cityGroup,
  });
}, true);
