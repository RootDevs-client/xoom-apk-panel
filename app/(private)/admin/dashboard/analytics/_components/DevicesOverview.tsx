"use client";

import {
  Activity,
  Layers,
  Monitor,
  Smartphone,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "./StatCard";
import { DashboardAnalyticsData } from "./types";

interface DevicesOverviewProps {
  data: DashboardAnalyticsData;
}

export function DevicesOverview({ data }: DevicesOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full" />
          <div className="relative p-2 rounded-xl bg-linear-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/10">
            <Layers className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-foreground/80 uppercase tracking-wider">
            Devices Overview
          </h4>
          <p className="text-xs text-muted-foreground/60">
            Device status and distribution metrics
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Devices"
          value={data.totalDevices}
          icon={Smartphone}
          gradient="from-blue-600 to-cyan-400"
          iconBg="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          label="Active Devices"
          value={data.activeDevices}
          icon={Activity}
          gradient="from-emerald-600 to-emerald-400"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          label="Inactive Devices"
          value={data.inactiveDevices}
          icon={Monitor}
          gradient="from-amber-600 to-orange-400"
          iconBg="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          label="Deleted Devices"
          value={data.deletedDevices}
          icon={TrendingUp}
          gradient="from-red-600 to-rose-400"
          iconBg="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
        />
      </div>
    </div>
  );
}
