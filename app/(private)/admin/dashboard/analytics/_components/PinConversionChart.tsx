"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CheckCircle2, MousePointerClick, Percent, Zap } from "lucide-react";
import { DashboardAnalyticsData } from "./types";

interface PinConversionChartProps {
  data: DashboardAnalyticsData;
}

const CUSTOM_TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.05)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  padding: "10px 14px",
};

export function PinConversionChart({ data }: PinConversionChartProps) {
  const rate = data.totalPinRequests > 0
    ? (data.totalPinReceived / data.totalPinRequests) * 100
    : 0;

  const chartData = [
    { name: "Requests", value: data.totalPinRequests },
    { name: "Received", value: data.totalPinReceived },
  ];

  const maxValue = Math.max(data.totalPinRequests, data.totalPinReceived, 1);

  const getQualityColor = (r: number) => {
    if (r >= 75) return { from: "#10b981", label: "Excellent" };
    if (r >= 50) return { from: "#3b82f6", label: "Good" };
    if (r >= 25) return { from: "#f59e0b", label: "Moderate" };
    return { from: "#f43f5e", label: "Low" };
  };

  const quality = getQualityColor(rate);

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md h-full">
      {/* Gradient accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 via-emerald-500 to-emerald-400" />

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
          <div className="p-1.5 rounded-lg bg-linear-to-br from-indigo-500/10 to-emerald-500/10">
            <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          PIN Conversion
        </CardTitle>
      </CardHeader>

      <CardContent className="relative">
        {/* Area Chart */}
        <div className="h-40 sm:h-44">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 5, right: 5, left: -15, bottom: 0 }}
            >
              <defs>
                <linearGradient id="pinConversionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={quality.from} stopOpacity={0.5} />
                  <stop offset="100%" stopColor={quality.from} stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.25}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fontWeight: 500 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                width={28}
                domain={[0, Math.ceil(maxValue * 1.3)]}
              />
              <Tooltip
                contentStyle={CUSTOM_TOOLTIP_STYLE}
                formatter={(value: any) => [(value as number).toLocaleString(), "Count"]}
                labelFormatter={(label) => `${label}`}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={quality.from}
                strokeWidth={2.5}
                fill="url(#pinConversionGradient)"
                dot={{ r: 5, fill: quality.from, strokeWidth: 2, stroke: "white" }}
                activeDot={{ r: 7, fill: quality.from, strokeWidth: 2, stroke: "white" }}
                animationDuration={1200}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between gap-2 pt-2.5 border-t border-border/50 mt-1">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-indigo-100 dark:bg-indigo-900/30">
              <MousePointerClick className="h-3 w-3 text-indigo-500" />
            </div>
            <div>
              <span className="text-[10px] text-muted-foreground block leading-none">Requests</span>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {data.totalPinRequests.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="text-center">
            <span className="text-lg font-bold" style={{ color: quality.from }}>
              {rate.toFixed(0)}%
            </span>
            <div className="flex items-center gap-1 justify-center">
              <Percent className="h-2.5 w-2.5" style={{ color: quality.from }} />
              <span className="text-[9px] font-medium text-muted-foreground uppercase">
                {quality.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block leading-none">Received</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                {data.totalPinReceived.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
