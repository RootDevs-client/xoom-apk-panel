"use client";

import { Card, CardContent } from "@/components/ui/card";
import { UserCheck, Users, UserX } from "lucide-react";
import { AnalyticsOverview } from "./types";

interface OverviewCardsProps {
  overview: AnalyticsOverview;
}

export function OverviewCards({ overview }: OverviewCardsProps) {
  const items = [
    {
      label: "Total Subscribers",
      value: overview.total,
      icon: Users,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Active",
      value: overview.active,
      icon: UserCheck,
      color: "text-green-600 bg-green-50",
    },
    {
      label: "Inactive",
      value: overview.inactive,
      icon: UserX,
      color: "text-red-600 bg-red-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="flex items-center gap-4 p-4">
            <div className={`p-3 rounded-full ${item.color}`}>
              <item.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
              <p className="text-2xl font-semibold">{item.value}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
