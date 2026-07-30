"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Percent, Users, Zap } from "lucide-react";
import { MetricBadge } from "./MetricBadge";
import { DashboardAnalyticsData } from "./types";

interface QuickStatsCardProps {
  data: DashboardAnalyticsData;
}

export function QuickStatsCard({ data }: QuickStatsCardProps) {
  const activeRatio =
    data.totalDevices > 0
      ? Math.round((data.activeDevices / data.totalDevices) * 100)
      : 0;

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Gradient accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-amber-500 via-orange-500 to-rose-500" />

      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-amber-500/3 to-rose-500/2" />

      {/* Decorative dots */}
      <div className="absolute top-4 right-4 grid grid-cols-3 gap-1 opacity-[0.08]">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-current" />
        ))}
      </div>

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-linear-to-br from-amber-500/10 to-rose-500/10">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          Quick Stats
        </CardTitle>
        <CardDescription>
          Additional platform metrics at a glance
        </CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-3">
        <MetricBadge
          label="Live Users"
          value={data.liveUsers.toLocaleString()}
          icon={Users}
          color="text-blue-500"
        />
        <MetricBadge
          label="Avg Daily Downloads"
          value={data.averageDailyDownloads.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
          icon={Clock}
          color="text-violet-500"
        />
        <MetricBadge
          label="Active / Total Ratio"
          value={`${activeRatio}%`}
          icon={Percent}
          color="text-emerald-500"
        />
      </CardContent>
    </Card>
  );
}
