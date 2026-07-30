"use client";

import { DevicesOverview } from "../analytics/_components/DevicesOverview";
import { DownloadsAnalytics } from "../analytics/_components/DownloadsAnalytics";
import { DashboardAnalyticsData } from "../analytics/_components/types";

interface DashboardAnalyticsOverviewProps {
  data: DashboardAnalyticsData;
}

export function DashboardAnalyticsOverview({
  data,
}: DashboardAnalyticsOverviewProps) {
  return (
    <div className="space-y-6">
      <DevicesOverview data={data} />
      <DownloadsAnalytics data={data} />
    </div>
  );
}
