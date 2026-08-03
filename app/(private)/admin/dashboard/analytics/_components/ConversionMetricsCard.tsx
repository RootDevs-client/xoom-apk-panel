"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, MousePointerClick, Percent } from "lucide-react";
import { DashboardAnalyticsData } from "./types";

interface ConversionMetricsCardProps {
  data: DashboardAnalyticsData;
}

export function ConversionMetricsCard({ data }: ConversionMetricsCardProps) {
  const getQualityLabel = (rate: number) => {
    if (rate >= 70)
      return { label: "Excellent", color: "from-emerald-500 to-emerald-400" };
    if (rate >= 40)
      return { label: "Good", color: "from-blue-500 to-cyan-400" };
    return {
      label: "Needs Improvement",
      color: "from-amber-500 to-orange-400",
    };
  };

  const quality = getQualityLabel(data.conversionRate);

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Gradient accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-blue-500 via-violet-500 to-emerald-500" />

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
          <div className="p-1.5 rounded-lg bg-linear-to-br from-violet-500/10 to-emerald-500/10">
            <Percent className="h-4 w-4 text-violet-600 dark:text-violet-400" />
          </div>
          Conversion Metrics
        </CardTitle>
        <CardDescription>PIN request and verification stats</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50 transition-colors duration-200 hover:bg-muted/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
              <MousePointerClick className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium">Total PIN Requests</span>
          </div>
          <span className="text-lg font-bold">
            {data.totalPinRequests.toLocaleString()}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/50 transition-colors duration-200 hover:bg-muted/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-medium">PIN Received</span>
          </div>
          <span className="text-lg font-bold">
            {data.totalPinReceived.toLocaleString()}
          </span>
        </div>

        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Conversion Rate</span>
            <Badge
              variant={data.conversionRate >= 50 ? "default" : "secondary"}
              className="text-xs font-semibold px-2.5 py-0.5"
            >
              {data.conversionRate.toFixed(1)}%
            </Badge>
          </div>
          <div className="relative h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`absolute inset-y-0 left-0 rounded-full bg-linear-to-r ${quality.color} transition-all duration-1000 ease-out shadow-sm`}
              style={{ width: `${Math.min(data.conversionRate, 100)}%` }}
            />
          </div>
          <div className="flex items-center gap-2 mt-2.5">
            <div
              className={`w-2 h-2 rounded-full bg-linear-to-r ${quality.color}`}
            />
            <span className="text-xs text-muted-foreground">
              {quality.label}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
