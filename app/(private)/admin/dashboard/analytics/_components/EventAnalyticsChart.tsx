"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Activity, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { EventAnalyticsItem } from "./types";

interface EventAnalyticsChartProps {
  data: EventAnalyticsItem[];
}

const EVENT_COLORS: Record<string, string> = {
  ONLINE: "#6366f1",
  APP_DOWNLOADED: "#8b5cf6",
  DETAILS_CAPTURED: "#a855f7",
  APP_ACTIVE: "#10b981",
  APP_INACTIVE: "#f59e0b",
  APP_DELETED: "#ef4444",
};

const FALLBACK_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#fb7185"];

const CUSTOM_TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.05)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  padding: "10px 14px",
};

// Event name formatting
const formatEventName = (name: string | null | undefined) => {
  if (!name) return "—";
  return name
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

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
          <p className="text-muted-foreground text-sm">No event data available</p>
        </CardContent>
      </Card>
    );
  }

  // Sort by funnel order: ONLINE → DOWNLOADED → CAPTURED → ACTIVE → INACTIVE
  const funnelOrder: Record<string, number> = {
    ONLINE: 0,
    APP_DOWNLOADED: 1,
    DETAILS_CAPTURED: 2,
    APP_ACTIVE: 3,
    APP_INACTIVE: 4,
    APP_DELETED: 5,
  };

  const chartData = [...data]
    .sort((a, b) => (funnelOrder[a.event] ?? 99) - (funnelOrder[b.event] ?? 99))
    .map((item) => ({
      ...item,
      label: formatEventName(item.event),
      fill: EVENT_COLORS[item.event] ?? FALLBACK_COLORS[0],
    }));

  const maxValue = Math.max(...chartData.map((d) => d.total), 1);

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md h-full">
      {/* Gradient accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-emerald-500" />

      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-500/3 to-emerald-500/2" />

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
        <div className="w-full h-[300px] sm:h-[340px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 40, left: 100, bottom: 5 }}
              barSize={36}
              barGap={6}
            >
              <XAxis
                type="number"
                hide
                domain={[0, Math.ceil(maxValue * 1.3)]}
              />
              <YAxis
                type="category"
                dataKey="label"
                tick={{ fontSize: 12, fontWeight: 600 }}
                tickLine={false}
                axisLine={false}
                width={130}
                tickMargin={4}
              />
              <Tooltip
                contentStyle={CUSTOM_TOOLTIP_STYLE}
                formatter={(value: any) => [
                  `${(value as number).toLocaleString()} events`,
                  "Count",
                ]}
                labelFormatter={(label) => `Event: ${label}`}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar
                dataKey="total"
                radius={[0, 6, 6, 0]}
                animationDuration={1000}
                animationEasing="ease-out"
                background={{ fill: "hsl(var(--muted) / 0.2)", radius: 6 }}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
                <LabelList
                  dataKey="total"
                  position="right"
                  fill="hsl(var(--foreground))"
                  fontSize={13}
                  fontWeight={700}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Drop-off indicators */}
        {chartData.length > 1 && (
          <div className="flex items-center justify-between pt-2.5 border-t border-border/50 mt-1">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <TrendingDown className="h-3 w-3" />
              <span>
                {chartData[0].total > 0
                  ? `${
                      chartData[0].total - (chartData[chartData.length - 1]?.total ?? 0)
                    } drop-off from ${formatEventName(chartData[0].event)} to ${formatEventName(chartData[chartData.length - 1]?.event ?? "")}`
                  : "No progression data"}
              </span>
            </div>
            <div className="text-[11px] font-semibold text-muted-foreground">
              {chartData.reduce((s, d) => s + d.total, 0).toLocaleString()} total
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
