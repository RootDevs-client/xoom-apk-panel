"use client";

import { BarChart3, Download, TrendingUp } from "lucide-react";
import { StatCard } from "./StatCard";
import { DashboardAnalyticsData } from "./types";

interface DownloadsAnalyticsProps {
  data: DashboardAnalyticsData;
}

function getTrend(
  today: number,
  yesterday: number,
): { trend: "up" | "down" | "neutral"; label: string } {
  if (today > yesterday) {
    return {
      trend: "up",
      label: `+${(today - yesterday).toLocaleString()} vs yesterday`,
    };
  }
  if (today < yesterday) {
    return {
      trend: "down",
      label: `${Math.abs(today - yesterday).toLocaleString()} vs yesterday`,
    };
  }
  return { trend: "neutral", label: "Same as yesterday" };
}

export function DownloadsAnalytics({ data }: DownloadsAnalyticsProps) {
  const { trend, label } = getTrend(
    data.todayDownloads,
    data.yesterdayDownloads,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full" />
          <div className="relative p-2 rounded-xl bg-linear-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/10">
            <Download className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
            Download Analytics
          </h4>
          <p className="text-xs text-muted-foreground/60">
            Download performance across time periods
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today"
          value={data.todayDownloads}
          icon={Download}
          gradient="from-violet-600 to-purple-400"
          iconBg="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
          trend={trend}
          trendLabel={label}
        />
        <StatCard
          label="Yesterday"
          value={data.yesterdayDownloads}
          icon={Download}
          gradient="from-indigo-600 to-blue-400"
          iconBg="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
        />
        <StatCard
          label="Last 7 Days"
          value={data.last7DaysDownloads}
          icon={TrendingUp}
          gradient="from-cyan-600 to-teal-400"
          iconBg="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400"
        />
        <StatCard
          label="Last 30 Days"
          value={data.last30DaysDownloads}
          icon={BarChart3}
          gradient="from-teal-600 to-emerald-400"
          iconBg="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400"
        />
      </div>
    </div>
  );
}
