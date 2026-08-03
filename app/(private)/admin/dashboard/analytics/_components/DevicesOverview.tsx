"use client";

import { Activity, Layers, Monitor, Smartphone, Trash2 } from "lucide-react";
import { StatCard } from "./StatCard";
import { DashboardAnalyticsData } from "./types";

interface DevicesOverviewProps {
  data: DashboardAnalyticsData;
}

export function DevicesOverview({ data }: DevicesOverviewProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5 animate-in fade-in slide-in-from-left-2 duration-500">
        <span className="rounded-md bg-linear-to-br from-blue-600 via-sky-500 to-cyan-400 animate-gradient-x p-1.5 text-white">
          <Layers className="h-3.5 w-3.5" />
        </span>
        <div>
          <h4 className="text-sm font-semibold text-foreground">
            Devices Overview
          </h4>
          <p className="text-xs text-muted-foreground">
            Device status and distribution metrics
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          index={0}
          label="Total Devices"
          value={data.totalDevices}
          icon={Smartphone}
          gradient="from-blue-600 via-sky-500 to-cyan-400"
          iconBg="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          index={1}
          label="Active Devices"
          value={data.activeDevices}
          icon={Activity}
          gradient="from-emerald-600 via-green-500 to-teal-400"
          iconBg="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          index={2}
          label="Inactive Devices"
          value={data.inactiveDevices}
          icon={Monitor}
          gradient="from-amber-600 via-orange-500 to-yellow-400"
          iconBg="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          index={3}
          label="Deleted Devices"
          value={data.deletedDevices}
          icon={Trash2}
          gradient="from-red-600 via-rose-500 to-pink-400"
          iconBg="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
        />
      </div>
    </div>
  );
}
