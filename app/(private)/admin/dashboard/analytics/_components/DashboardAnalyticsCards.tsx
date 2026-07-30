"use client";

import { ConversionMetricsCard } from "./ConversionMetricsCard";
import { DeviceModelsChart } from "./DeviceModelsChart";
import { DeviceStatusChart } from "./DeviceStatusChart";
import { DownloadTrendChart } from "./DownloadTrendChart";
import { EventAnalyticsChart } from "./EventAnalyticsChart";
import { PinConversionChart } from "./PinConversionChart";
import { PlatformBreakdownCard } from "./PlatformBreakdownCard";
import { QuickStatsCard } from "./QuickStatsCard";
import { UninstallAnalyticsCard } from "./UninstallAnalyticsCard";
import { DashboardAnalyticsData, DeviceModelItem, EventAnalyticsItem, UninstallAnalyticsData } from "./types";

interface DashboardAnalyticsCardsProps {
  data: DashboardAnalyticsData;
  deviceModels?: DeviceModelItem[];
  uninstallData?: UninstallAnalyticsData;
  eventData?: EventAnalyticsItem[];
}

export function DashboardAnalyticsCards({
  data,
  deviceModels,
  uninstallData,
  eventData,
}: DashboardAnalyticsCardsProps) {
  return (
    <div className="space-y-6">
      {/* Charts Row: Device Status, Download Trends & PIN Conversion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DeviceStatusChart data={data} />
        <DownloadTrendChart data={data} />
        <PinConversionChart data={data} />
      </div>

      {/* Platform & Conversion & Quick Stats Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PlatformBreakdownCard data={data} />
        <ConversionMetricsCard data={data} />
        <QuickStatsCard data={data} />
      </div>

      {/* Event Funnel & Device Models - side by side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {eventData && <EventAnalyticsChart data={eventData} />}
        {deviceModels && <DeviceModelsChart data={deviceModels} />}
      </div>

      {/* Uninstall Analytics (full width) */}
      {uninstallData && <UninstallAnalyticsCard data={uninstallData} />}
    </div>
  );
}
