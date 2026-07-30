"use client";

import { Separator } from "@/components/ui/separator";
import { ConversionMetricsCard } from "./ConversionMetricsCard";
import { DeviceStatusChart } from "./DeviceStatusChart";
import { DevicesOverview } from "./DevicesOverview";
import { DownloadTrendChart } from "./DownloadTrendChart";
import { DownloadsAnalytics } from "./DownloadsAnalytics";
import { PinConversionChart } from "./PinConversionChart";
import { PlatformBreakdownCard } from "./PlatformBreakdownCard";
import { QuickStatsCard } from "./QuickStatsCard";
import { DashboardAnalyticsData } from "./types";

interface DashboardAnalyticsCardsProps {
  data: DashboardAnalyticsData;
}

export function DashboardAnalyticsCards({
  data,
}: DashboardAnalyticsCardsProps) {
  return (
    <div className="space-y-6">
      {/* Devices Overview */}
      <DevicesOverview data={data} />

      {/* Downloads Analytics */}
      <DownloadsAnalytics data={data} />

      {/* Charts Row 1: Device Status & Download Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeviceStatusChart data={data} />
        <DownloadTrendChart data={data} />
      </div>

      <Separator className="opacity-50" />

      {/* Platform & Conversion & Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PlatformBreakdownCard data={data} />
        <ConversionMetricsCard data={data} />
        <QuickStatsCard data={data} />
      </div>

      {/* PIN Conversion Chart */}
      <PinConversionChart data={data} />
    </div>
  );
}
