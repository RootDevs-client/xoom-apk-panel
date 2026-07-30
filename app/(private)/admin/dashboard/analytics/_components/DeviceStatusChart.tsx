"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartPie } from "lucide-react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { DashboardAnalyticsData } from "./types";

interface DeviceStatusChartProps {
  data: DashboardAnalyticsData;
}

const COLORS = {
  active: "#10b981",
  inactive: "#f59e0b",
  deleted: "#ef4444",
};

const CUSTOM_TOOLTIP_STYLE = {
  borderRadius: "12px",
  border: "1px solid rgba(0,0,0,0.05)",
  boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
  padding: "10px 14px",
};

export function DeviceStatusChart({ data }: DeviceStatusChartProps) {
  const chartData = [
    { name: "Active", value: data.activeDevices, color: COLORS.active },
    { name: "Inactive", value: data.inactiveDevices, color: COLORS.inactive },
    { name: "Deleted", value: data.deletedDevices, color: COLORS.deleted },
  ].filter((d) => d.value > 0);

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
      <div className="absolute inset-0 bg-linear-to-br from-emerald-500/3 to-amber-500/2" />

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
        <div className="w-full h-70 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={62}
                outerRadius={90}
                paddingAngle={3}
                strokeWidth={0}
              >
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="transition-all duration-300 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={CUSTOM_TOOLTIP_STYLE}
                formatter={(value: any) => [
                  `${(value as number).toLocaleString()} devices`,
                  "Count",
                ]}
                labelFormatter={(label) => `Status: ${label}`}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                iconSize={10}
                formatter={(value: string) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary footer */}
        <div className="flex items-center justify-center gap-6 pt-2 border-t border-border/50 mt-2">
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
