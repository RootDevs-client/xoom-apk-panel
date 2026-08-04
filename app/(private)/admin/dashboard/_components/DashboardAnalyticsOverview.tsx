"use client";

import { DevicesOverview } from "../analytics/_components/DevicesOverview";
import { DownloadsAnalytics } from "../analytics/_components/DownloadsAnalytics";
import { normalizeDashboardAnalytics } from "../analytics/_components/normalize";
import { DashboardAnalyticsData } from "../analytics/_components/types";

interface DashboardAnalyticsOverviewProps {
  data: DashboardAnalyticsData;
}

export function DashboardAnalyticsOverview({
  data: rawData,
}: DashboardAnalyticsOverviewProps) {
  const data = normalizeDashboardAnalytics(rawData);

  return (
    <div className="space-y-6">
      <DevicesOverview data={data} />
      <DownloadsAnalytics data={data} />
    </div>
  );
}
