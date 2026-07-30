"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Smartphone, Trophy, Star } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DeviceModelItem } from "./types";

interface DeviceModelsChartProps {
  data: DeviceModelItem[];
}

const BAR_COLORS = [
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

const CUSTOM_TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.05)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  padding: "10px 14px",
};

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
          <CardDescription>Most used device models ranked by count</CardDescription>
        </CardHeader>
        <CardContent className="relative flex items-center justify-center h-70">
          <p className="text-muted-foreground text-sm">No device model data available</p>
        </CardContent>
      </Card>
    );
  }

  // Sort descending and take top 8 (to fit vertical layout)
  const chartData = [...data]
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map((item, index) => ({
      ...item,
      label: item.model.length > 12 ? item.model.slice(0, 10) + ".." : item.model,
      fill: BAR_COLORS[index % BAR_COLORS.length],
      rank: index + 1,
    }));

  const maxValue = Math.max(...chartData.map((d) => d.total), 1);

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md h-full">
      {/* Gradient accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />

      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-indigo-500/3 to-purple-500/2" />

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
        <CardDescription>Most used device models ranked by count</CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="w-full h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 10, left: -10, bottom: 5 }}
              barSize={36}
              barGap={6}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.3}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
                interval={0}
                angle={-25}
                textAnchor="end"
                height={50}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
                width={30}
                domain={[0, Math.ceil(maxValue * 1.35)]}
              />
              <Tooltip
                contentStyle={CUSTOM_TOOLTIP_STYLE}
                formatter={(value: any) => [
                  `${(value as number).toLocaleString()} devices`,
                  "Count",
                ]}
                labelFormatter={(label) => `Model: ${label}`}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar
                dataKey="total"
                radius={[6, 6, 0, 0]}
                animationDuration={1200}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.fill}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Summary footer with rank badges */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50 mt-2">
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
                  <span key={i} className="text-[10px]">{["🥇", "🥈", "🥉"][i]}</span>
                ))}
              </div>
              <span className="text-muted-foreground">
                Top 3 ranked
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
