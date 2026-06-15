"use client";

import { DailyTrendChart } from "./DailyTrendChart";
import { OverviewCards } from "./OverviewCards";
import { PlatformBreakdownChart } from "./PlatformBreakdownChart";

import { LocationBreakdownChart } from "./LocationBreakdownChart";
import { AnalyticsData } from "./types";

interface SubscriptionAnalyticsDashboardProps {
  data: AnalyticsData;
}

export function SubscriptionAnalyticsDashboard({
  data,
}: SubscriptionAnalyticsDashboardProps) {
  return (
    <div className="space-y-6">
      <OverviewCards overview={data.overview} />

      <DailyTrendChart data={data.dailyTrend} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PlatformBreakdownChart data={data.platformBreakdown} />
        <LocationBreakdownChart data={data.locationBreakdown} />
      </div>
    </div>
  );
}
