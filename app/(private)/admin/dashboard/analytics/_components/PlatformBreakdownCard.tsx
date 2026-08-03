"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Monitor, Smartphone } from "lucide-react";
import { PlatformProgress } from "./PlatformProgress";
import { DashboardAnalyticsData } from "./types";

interface PlatformBreakdownCardProps {
  data: DashboardAnalyticsData;
}

export function PlatformBreakdownCard({ data }: PlatformBreakdownCardProps) {
  const total = data.androidDevices + data.iosDevices;

  return (
    <Card className="group relative overflow-hidden border-0 shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Gradient accent strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-emerald-500 via-blue-500 to-violet-500" />

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
          <div className="p-1.5 rounded-lg bg-linear-to-br from-emerald-500/10 to-blue-500/10">
            <Smartphone className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          Platform Breakdown
        </CardTitle>
        <CardDescription>Device distribution by platform</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-5">
        <PlatformProgress
          label="Android"
          value={data.androidDevices}
          total={total}
          iconColor="text-emerald-500"
          barClassName="bg-gradient-to-r from-emerald-500 to-emerald-400"
          icon={Smartphone}
        />
        <PlatformProgress
          label="iOS"
          value={data.iosDevices}
          total={total}
          iconColor="text-blue-500"
          barClassName="bg-gradient-to-r from-blue-500 to-blue-400"
          icon={Monitor}
        />
        <div className="pt-4 border-t border-border/50">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Devices</span>
            <span className="text-lg font-bold bg-linear-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
              {total.toLocaleString()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
