"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartPie } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";
import { renderActiveShape, renderInactiveShape } from "./pieHoverShapes";
import { DashboardAnalyticsData } from "./types";

interface DeviceStatusChartProps {
  data: DashboardAnalyticsData;
}

const COLORS = {
  active: "#10b981",
  inactive: "#f59e0b",
  deleted: "#ef4444",
};

/**
 * Pie slices don't carry an axis label, so the default tooltip only renders the
 * value — this shows the status, its count and its share of the total.
 */
function StatusTooltip({
  active,
  payload,
  total,
}: {
  active?: boolean;
  payload?: any[];
  total: number;
}) {
  if (!active || !payload?.length) return null;

  const slice = payload[0];
  const value = (slice.value as number) ?? 0;
  const label = slice.payload?.name ?? slice.name;
  const color = slice.payload?.color;
  const share = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="animate-in fade-in-0 zoom-in-95 duration-200 rounded-xl border border-border/60 bg-popover px-3.5 py-2.5 text-popover-foreground shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <div className="mt-1 pl-4.5 text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">
          {value.toLocaleString()}
        </span>{" "}
        devices · {share}%
      </div>
    </div>
  );
}

export function DeviceStatusChart({ data }: DeviceStatusChartProps) {
  const chartData = [
    { name: "Active", value: data.activeDevices, color: COLORS.active },
    { name: "Inactive", value: data.inactiveDevices, color: COLORS.inactive },
    { name: "Deleted", value: data.deletedDevices, color: COLORS.deleted },
  ].filter((d) => d.value > 0);

  // the tooltip tracks the cursor and would sit on top of the centre
  // total when hovering near the middle of the ring — fade it out instead
  const [hovered, setHovered] = useState(false);

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (chartData.length === 0) {
    return (
      <Card className="group relative overflow-hidden border-0 shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-amber-500 to-red-500" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-linear-to-br from-emerald-500/10 to-amber-500/10">
              <ChartPie className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            Device Status Distribution
          </CardTitle>
          <CardDescription>Device breakdown by status</CardDescription>
        </CardHeader>
        <CardContent className="relative flex items-center justify-center h-70">
          <p className="text-muted-foreground text-sm">
            No device data available
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Gradient accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-amber-500 to-red-500" />

      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-foreground/[0.02] to-transparent" />

      {/* Decorative dots */}
      <div className="absolute top-4 right-4 grid grid-cols-3 gap-1 opacity-[0.08]">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-current" />
        ))}
      </div>

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-linear-to-br from-emerald-500/10 to-amber-500/10">
            <ChartPie className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          Device Status Distribution
        </CardTitle>
        <CardDescription>Device breakdown by current status</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="relative w-full h-[210px] sm:h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="47%"
                innerRadius="55%"
                outerRadius="88%"
                paddingAngle={3}
                strokeWidth={0}
                animationDuration={1000}
                animationEasing="ease-out"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                activeShape={renderActiveShape}
                inactiveShape={renderInactiveShape}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={<StatusTooltip total={total} />}
                animationDuration={300}
                offset={18}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Center total */}
          <div
            className={`pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center transition-opacity duration-200 ${
              hovered ? "opacity-0" : "opacity-100"
            }`}
          >
            <span className="text-xl sm:text-2xl font-bold">
              {total.toLocaleString()}
            </span>
            <span className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground">
              Devices
            </span>
          </div>
        </div>

        {/* Legend — rendered as HTML so it wraps instead of overlapping the
            chart on narrow screens (recharts' own legend does not reflow) */}
        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
          {chartData.map((entry) => (
            <div
              key={entry.name}
              className="flex min-w-0 items-center justify-between gap-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="truncate text-xs text-muted-foreground">
                  {entry.name}
                </span>
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Summary footer */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-3 border-t border-border/50 mt-3">
          {chartData.map((item) => (
            <div key={item.name} className="text-center">
              <p className="text-xs text-muted-foreground">{item.name}</p>
              <p
                className="text-sm font-semibold"
                style={{ color: item.color }}
              >
                {total > 0
                  ? `${Math.round((item.value / total) * 100)}%`
                  : "0%"}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
