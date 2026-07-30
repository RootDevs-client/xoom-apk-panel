"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download } from "lucide-react";
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

interface DownloadTrendChartProps {
  data: DashboardAnalyticsData;
}

const BAR_COLORS = ["#8b5cf6", "#6366f1", "#06b6d4", "#10b981"];

const CUSTOM_TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.05)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  padding: "10px 14px",
};

export function DownloadTrendChart({ data }: DownloadTrendChartProps) {
  const chartData = [
    {
      label: "Today",
      value: data.todayDownloads,
      period: data.todayDownloads === 1 ? "download" : "downloads",
    },
    {
      label: "Yesterday",
      value: data.yesterdayDownloads,
      period: data.yesterdayDownloads === 1 ? "download" : "downloads",
    },
    {
      label: "Last 7 Days",
      value: data.last7DaysDownloads,
      period: data.last7DaysDownloads === 1 ? "download" : "downloads",
    },
    {
      label: "Last 30 Days",
      value: data.last30DaysDownloads,
      period: data.last30DaysDownloads === 1 ? "download" : "downloads",
    },
  ];

  const maxValue = Math.max(...chartData.map((d) => d.value), 1);

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Gradient accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-violet-500 via-blue-500 to-emerald-500" />

      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-violet-500/3 to-emerald-500/2" />

      {/* Decorative dots */}
      <div className="absolute top-4 right-4 grid grid-cols-3 gap-1 opacity-[0.08]">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-current" />
        ))}
      </div>

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-linear-to-br from-violet-500/10 to-blue-500/10">
            <Download className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          Download Trends
        </CardTitle>
        <CardDescription>
          Download counts across different time periods
        </CardDescription>
      </CardHeader>
      <CardContent className="relative">
        <div className="w-full h-70 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -15, bottom: 5 }}
              barSize={48}
              barGap={8}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                opacity={0.3}
              />
              <XAxis
                dataKey="label"
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
                domain={[0, Math.ceil(maxValue * 1.3)]}
              />
              <Tooltip
                contentStyle={CUSTOM_TOOLTIP_STYLE}
                formatter={(value: any) => [
                  `${(value as number).toLocaleString()} downloads`,
                  "Count",
                ]}
                labelFormatter={(label) => `Period: ${label}`}
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
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
