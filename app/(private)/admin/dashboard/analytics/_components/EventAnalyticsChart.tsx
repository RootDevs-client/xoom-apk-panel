"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, TrendingDown } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";
import { renderActiveShape, renderInactiveShape } from "./pieHoverShapes";
import { EventAnalyticsItem } from "./types";

interface EventAnalyticsChartProps {
  data: EventAnalyticsItem[];
}

const EVENT_COLORS: Record<string, string> = {
  ONLINE: "#6366f1",
  APP_DOWNLOADED: "#8b5cf6",
  DETAILS_CAPTURED: "#a855f7",
  GET_EVINA_JS_CALLED: "#f59e0b",
  EVINA_JS_RENDERED: "#fbbf24",
  EVINA_WAITING_ENABLED: "#fcd34d",
  PIN_REQUEST_CALLED: "#06b6d4",
  PIN_RECEIVED: "#22d3ee",
  PIN_VERIFY_INVOKED: "#0891b2",
  PIN_VERIFY_CALLED: "#0e7490",
  APP_ACTIVE: "#10b981",
  APP_INACTIVE: "#f59e0b",
  APP_DELETED: "#ef4444",
};

const FALLBACK_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#fb7185",
];

// Event name formatting
const formatEventName = (name: string | null | undefined) => {
  if (!name) return "—";
  return name.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
};

/**
 * Pie slices don't carry an axis label, so the default tooltip only renders the
 * value — this shows the event name, its count and its share of the total.
 */
function EventTooltip({
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
  const label = slice.payload?.label ?? slice.name;
  const color = slice.payload?.fill;
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
        events · {share}%
      </div>
    </div>
  );
}

export function EventAnalyticsChart({ data }: EventAnalyticsChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="group relative overflow-hidden border-0 shadow-sm h-full">
        <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-500" />
        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10">
              <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            Event Funnel
          </CardTitle>
          <CardDescription>User journey event progression</CardDescription>
        </CardHeader>
        <CardContent className="relative flex items-center justify-center h-70">
          <p className="text-muted-foreground text-sm">
            No event data available
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sort by funnel order: ONLINE → DOWNLOADED → CAPTURED → ACTIVE → INACTIVE
  const funnelOrder: Record<string, number> = {
    ONLINE: 0,
    APP_DOWNLOADED: 1,
    DETAILS_CAPTURED: 2,
    GET_EVINA_JS_CALLED: 3,
    EVINA_JS_RENDERED: 4,
    EVINA_WAITING_ENABLED: 5,
    PIN_REQUEST_CALLED: 6,
    PIN_RECEIVED: 7,
    PIN_VERIFY_INVOKED: 8,
    PIN_VERIFY_CALLED: 9,
    APP_ACTIVE: 10,
    APP_INACTIVE: 11,
    APP_DELETED: 12,
  };

  const chartData = [...data]
    .sort((a, b) => (funnelOrder[a.event] ?? 99) - (funnelOrder[b.event] ?? 99))
    .map((item, index) => ({
      ...item,
      label: formatEventName(item.event),
      fill:
        EVENT_COLORS[item.event] ??
        FALLBACK_COLORS[index % FALLBACK_COLORS.length],
    }));

  // the tooltip tracks the cursor and would sit on top of the centre
  // total when hovering near the middle of the ring — fade it out instead
  const [hovered, setHovered] = useState(false);

  const total = chartData.reduce((sum, d) => sum + d.total, 0);

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md h-full">
      {/* Gradient accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-500" />

      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-foreground/[0.02] to-transparent" />

      {/* Decorative dots */}
      <div className="absolute top-4 right-4 grid grid-cols-3 gap-1 opacity-[0.08]">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-current" />
        ))}
      </div>

      <CardHeader className="relative pb-1">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-linear-to-br from-indigo-500/10 to-purple-500/10">
            <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          Event Funnel
        </CardTitle>
        <CardDescription>User journey event progression</CardDescription>
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
                animationDuration={1000}
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
                content={<EventTooltip total={total} />}
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
              Events
            </span>
          </div>
        </div>

        {/* Legend — rendered as HTML so it wraps instead of overlapping the
            chart on narrow screens (recharts' own legend does not reflow) */}
        <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-1.5 sm:grid-cols-2">
          {chartData.map((entry) => (
            <div
              key={entry.event}
              className="flex min-w-0 items-center justify-between gap-2"
            >
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: entry.fill }}
                />
                <span className="truncate text-xs text-muted-foreground">
                  {entry.label}
                </span>
              </div>
              <span className="shrink-0 text-xs font-semibold tabular-nums">
                {entry.total.toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* Drop-off indicators */}
        {chartData.length > 1 && (
          <div className="flex flex-col gap-1.5 pt-2.5 border-t border-border/50 mt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <TrendingDown className="h-3 w-3 mt-0.5 shrink-0" />
              <span>
                {chartData[0].total > 0
                  ? `${
                      chartData[0].total -
                      (chartData[chartData.length - 1]?.total ?? 0)
                    } drop-off from ${formatEventName(chartData[0].event)} to ${formatEventName(chartData[chartData.length - 1]?.event ?? "")}`
                  : "No progression data"}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-muted-foreground">
              {total.toLocaleString()} total
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
