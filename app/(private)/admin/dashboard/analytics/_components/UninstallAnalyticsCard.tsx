"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertTriangle,
  Download,
  Trash2,
  TrendingDown,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { UninstallAnalyticsData } from "./types";

interface UninstallAnalyticsCardProps {
  data: UninstallAnalyticsData;
}

// recharts colours item text from the series fill; these bars/slices are
// coloured per-Cell, so the series fill is undefined and it falls back to black.
const CUSTOM_TOOLTIP_ITEM_STYLE = { color: "var(--popover-foreground)" };
const CUSTOM_TOOLTIP_LABEL_STYLE = {
  color: "var(--popover-foreground)",
  fontWeight: 600,
};

const CUSTOM_TOOLTIP_STYLE = {
  background: "var(--popover)",
  color: "var(--popover-foreground)",
  borderRadius: "12px",
  border: "1px solid var(--border)",
  boxShadow: "0 8px 24px rgb(0 0 0 / 0.18)",
  padding: "10px 14px",
};

const GAUGE_COLORS = [
  { threshold: 0, color: "#10b981" }, // Green - low uninstall
  { threshold: 10, color: "#f59e0b" }, // Amber - medium
  { threshold: 20, color: "#f97316" }, // Orange - high
  { threshold: 35, color: "#ef4444" }, // Red - critical
];

function getGaugeColor(rate: number): string {
  if (rate >= 35) return GAUGE_COLORS[3].color;
  if (rate >= 20) return GAUGE_COLORS[2].color;
  if (rate >= 10) return GAUGE_COLORS[1].color;
  return GAUGE_COLORS[0].color;
}

function getGaugeLabel(rate: number): string {
  if (rate >= 35) return "Critical";
  if (rate >= 20) return "High";
  if (rate >= 10) return "Moderate";
  return "Healthy";
}

export function UninstallAnalyticsCard({ data }: UninstallAnalyticsCardProps) {
  const gaugeColor = getGaugeColor(data.uninstallRate);
  const gaugeLabel = getGaugeLabel(data.uninstallRate);

  // Donut data for the gauge: uninstallRate % vs rest
  const gaugeData = [
    {
      name: "Uninstalled",
      value: Math.max(data.uninstallRate, 0.5),
      fill: gaugeColor,
    },
    {
      name: "Retained",
      value: Math.max(100 - data.uninstallRate, 0.5),
      // gauge track: follows the theme instead of a fixed light grey
      fill: "#e5e7eb",
      className: "fill-muted",
    },
  ];

  // Bar chart data: downloads vs deleted
  const retained = Math.max(data.downloads - data.deleted, 0);
  const barData = [
    { name: "Downloads", value: data.downloads, fill: "#6366f1" },
    { name: "Retained", value: retained, fill: "#10b981" },
    { name: "Deleted", value: data.deleted, fill: "#ef4444" },
  ];

  const maxBarValue = Math.max(data.downloads, 1);

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Gradient accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-rose-500 via-orange-500 to-emerald-500" />

      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-linear-to-br from-foreground/2 to-transparent" />

      {/* Decorative dots */}
      <div className="absolute top-4 right-4 grid grid-cols-3 gap-1 opacity-[0.08]">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="w-1 h-1 rounded-full bg-current" />
        ))}
      </div>

      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-lg bg-linear-to-br from-rose-500/10 to-orange-500/10">
            <AlertTriangle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          Uninstall Analytics
        </CardTitle>
        <CardDescription>
          Download retention and uninstall rate tracking
        </CardDescription>
      </CardHeader>

      <CardContent className="relative">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left: Radial Gauge for Uninstall Rate */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center justify-center">
              <div className="relative w-44 h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={gaugeData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      startAngle={180}
                      endAngle={0}
                      strokeWidth={0}
                      paddingAngle={0}
                    >
                      {gaugeData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={entry.fill}
                          className={entry.className}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span
                    className="text-3xl font-bold tracking-tight"
                    style={{ color: gaugeColor }}
                  >
                    {data.uninstallRate.toFixed(1)}%
                  </span>
                  <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mt-0.5">
                    uninstall rate
                  </span>
                </div>
              </div>
            </div>

            {/* Status badge */}
            <div className="flex items-center justify-center gap-2">
              <div
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border"
                style={{
                  borderColor: `${gaugeColor}30`,
                  backgroundColor: `${gaugeColor}12`,
                  color: gaugeColor,
                }}
              >
                <TrendingDown className="h-3 w-3" />
                {gaugeLabel}
              </div>
            </div>
          </div>

          {/* Right: Bar Chart + Summary */}
          <div className="lg:col-span-3 space-y-4">
            {/* Mini bar chart */}
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={barData}
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
                    dataKey="name"
                    tick={{ fontSize: 11, fontWeight: 500 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={30}
                    domain={[0, Math.ceil(maxBarValue * 1.4)]}
                  />
                  <Tooltip
                    contentStyle={CUSTOM_TOOLTIP_STYLE}
                    itemStyle={CUSTOM_TOOLTIP_ITEM_STYLE}
                    labelStyle={CUSTOM_TOOLTIP_LABEL_STYLE}
                    formatter={(value: any) => [
                      (Number(value) || 0).toLocaleString(),
                      "Count",
                    ]}
                    cursor={{ fill: "rgba(0,0,0,0.03)" }}
                  />
                  <Bar
                    dataKey="value"
                    radius={[6, 6, 0, 0]}
                    animationDuration={1000}
                    animationEasing="ease-out"
                  >
                    {barData.map((entry, index) => (
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

            {/* Quick stat row */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/50">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Download className="h-3.5 w-3.5 text-indigo-500" />
                  <span className="text-xs text-muted-foreground">
                    Downloads
                  </span>
                </div>
                <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                  {data.downloads.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                  <span className="text-xs text-muted-foreground">Deleted</span>
                </div>
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">
                  {data.deleted.toLocaleString()}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <Users className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-xs text-muted-foreground">
                    Retained
                  </span>
                </div>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                  {Math.max(data.downloads - data.deleted, 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
