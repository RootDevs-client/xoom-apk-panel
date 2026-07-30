"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowRight,
  CheckCircle2,
  MousePointerClick,
  Percent,
} from "lucide-react";
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

const BAR_COLORS = ["#6366f1", "#10b981"];

export function PinConversionChart({ data }: PinConversionChartProps) {
  const chartData = [
    { name: "PIN Requests", value: data.totalPinRequests, fill: BAR_COLORS[0] },
    { name: "PIN Received", value: data.totalPinReceived, fill: BAR_COLORS[1] },
  ];

  const maxValue = Math.max(data.totalPinRequests, data.totalPinReceived, 1);

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md">
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

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-linear-to-br from-indigo-500/10 to-emerald-500/10">
            <Percent className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          PIN Conversion Overview
        </CardTitle>
        <CardDescription>
          Request to received conversion comparison
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="w-full h-65">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
              barSize={72}
              barGap={24}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                width={35}
                domain={[0, Math.ceil(maxValue * 1.4)]}
              />
              <Tooltip
                contentStyle={CUSTOM_TOOLTIP_STYLE}
                formatter={(value: any) => [
                  `${(value as number).toLocaleString()}`,
                  "Count",
                ]}
                labelFormatter={(label) => `${label}`}
                cursor={{ fill: "rgba(0,0,0,0.03)" }}
              />
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                animationDuration={1000}
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

        {/* Conversion rate summary */}
        <div className="flex items-center justify-center gap-3 pt-3 border-t border-border/50 mt-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/20">
            <MousePointerClick className="h-3.5 w-3.5 text-indigo-500" />
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {data.totalPinRequests.toLocaleString()} requested
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {data.totalPinReceived.toLocaleString()} received
            </span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-muted">
            <span className="text-xs font-semibold">
              {data.totalPinRequests > 0
                ? `${data.conversionRate.toFixed(0)}% rate`
                : "No data"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
