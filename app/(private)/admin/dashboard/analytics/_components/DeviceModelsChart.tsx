"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Smartphone, Star, Trophy } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";
import { renderActiveShape, renderInactiveShape } from "./pieHoverShapes";
import { DeviceModelItem } from "./types";

interface DeviceModelsChartProps {
  data: DeviceModelItem[];
}

const SLICE_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#fb7185",
  "#fbbf24",
  "#34d399",
  "#22d3ee",
];

/**
 * Pie slices carry no axis label, so the default tooltip shows the value only —
 * this renders the full model name, its count and its share of the total.
 */
function ModelTooltip({
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
  const model = slice.payload?.model ?? slice.name;
  const color = slice.payload?.fill;
  const share = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="animate-in fade-in-0 zoom-in-95 duration-200 rounded-xl border border-border/60 bg-popover px-3.5 py-2.5 text-popover-foreground shadow-lg">
      <div className="flex items-center gap-2">
        <span
          className="size-2.5 shrink-0 rounded-full"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm font-semibold">{model}</span>
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

export function DeviceModelsChart({ data }: DeviceModelsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="group relative overflow-hidden border-0 shadow-sm h-full">
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10">
              <Smartphone className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            Top Device Models
          </CardTitle>
          <CardDescription>
            Most used device models ranked by count
          </CardDescription>
        </CardHeader>
        <CardContent className="relative flex items-center justify-center h-70">
          <p className="text-muted-foreground text-sm">
            No device model data available
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort descending and take top 8 (keeps the pie readable)
  const chartData = [...data]
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map((item, index) => ({
      ...item,
      label:
        item.model.length > 14 ? item.model.slice(0, 12) + ".." : item.model,
      fill: SLICE_COLORS[index % SLICE_COLORS.length],
      rank: index + 1,
    }));

  // the tooltip tracks the cursor and would sit on top of the centre
  // total when hovering near the middle of the ring — fade it out instead
  const [hovered, setHovered] = useState(false);

  const total = chartData.reduce((sum, d) => sum + d.total, 0);

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md h-full">
      {/* Gradient accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

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
          <div className="p-1.5 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10">
            <Trophy className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          Top Device Models
        </CardTitle>
        <CardDescription>
          Most used device models ranked by count
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="relative w-full h-[210px] sm:h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="total"
                nameKey="label"
                cx="50%"
                cy="47%"
                innerRadius="55%"
                outerRadius="88%"
                paddingAngle={3}
                strokeWidth={0}
                animationDuration={1200}
                animationEasing="ease-out"
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                activeShape={renderActiveShape}
                inactiveShape={renderInactiveShape}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                content={<ModelTooltip total={total} />}
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
              key={entry.model}
              className="flex min-w-0 items-center justify-between gap-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                />
                <span
                  className="truncate text-xs text-muted-foreground"
                  title={entry.model}
                >
                  {entry.model}
                </span>
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums">
                {entry.total.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Summary footer with rank badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-border/50 mt-3">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              Top {chartData.length} models
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs">
            {data.length > 8 && (
              <span className="text-muted-foreground">
                +{data.length - 8} more
              </span>
            )}
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1">
                {chartData.slice(0, 3).map((_, i) => (
                  <span key={i} className="text-[10px]">
                    {["🥇", "🥈", "🥉"][i]}
                  </span>
                ))}
              </div>
              <span className="text-muted-foreground">Top 3 ranked</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
