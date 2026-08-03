"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/config/routes";
import { ColumnDef } from "@tanstack/react-table";
import { ChevronRight } from "lucide-react";
import moment from "moment-timezone";
import Link from "next/link";
import { formatEventLabel, type Device } from "./device.utils";

export type { Device, DeviceStatusLog } from "./device.utils";

const formatDate = (date: string) => {
  if (!date) return "—";
  return moment(date).tz("Asia/Dhaka").format("DD MMM YYYY, HH:mm");
};

const timeAgo = (date: string) => {
  if (!date) return "—";
  return moment(date).tz("Asia/Dhaka").fromNow();
};

export function StatusBadge({ status }: { status: string }) {
  const variants: Record<
    string,
    {
      variant: "default" | "secondary" | "destructive" | "outline";
      label: string;
    }
  > = {
    APP_ACTIVE: { variant: "default", label: "Active" },
    APP_INACTIVE: { variant: "secondary", label: "Inactive" },
    APP_DELETED: { variant: "destructive", label: "Deleted" },
  };

  const config = variants[status] ?? {
    variant: "outline" as const,
    label: status,
  };

  return (
    <Badge
      variant={config.variant}
      className="text-xs font-medium whitespace-nowrap"
    >
      {config.label}
    </Badge>
  );
}

export function PlatformBadge({ platform }: { platform: string }) {
  const isAndroid = platform?.toLowerCase() === "android";
  return (
    <Badge
      variant="outline"
      className={`text-xs font-medium ${
        isAndroid
          ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
          : "border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
      }`}
    >
      {isAndroid ? "Android" : "iOS"}
    </Badge>
  );
}

export const columns: ColumnDef<Device>[] = [
  {
    accessorKey: "deviceName",
    header: "Device",
    cell: ({ row }) => (
      <Link
        href={routes.privateRoutes.admin.deviceDetails(row.original._id)}
        className="group flex flex-col min-w-0"
      >
        <span className="font-medium text-sm truncate max-w-45 group-hover:text-primary group-hover:underline underline-offset-2 transition-colors">
          {row.original.deviceName || "—"}
        </span>
        <span className="text-xs text-muted-foreground truncate max-w-45">
          {row.original.deviceModel || ""}
        </span>
      </Link>
    ),
  },
  {
    accessorKey: "manufacturer",
    header: "Manufacturer",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.manufacturer || "—"}</span>
    ),
  },
  {
    accessorKey: "platform",
    header: "Platform",
    cell: ({ row }) => <PlatformBadge platform={row.original.platform} />,
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile",
    cell: ({ row }) => (
      <span className="text-sm font-mono text-muted-foreground">
        {row.original.mobileNumber || "—"}
      </span>
    ),
  },
  {
    accessorKey: "lifecycleStatus",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.lifecycleStatus} />,
  },
  {
    accessorKey: "lastEvent",
    header: "Last Event",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatEventLabel(row.original.lastEvent)}
      </span>
    ),
  },
  {
    accessorKey: "lastHeartbeatCheckAt",
    header: "Last Seen",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">
          {timeAgo(row.original.lastHeartbeatCheckAt)}
        </span>
        <span className="text-[10px] text-muted-foreground/60">
          {formatDate(row.original.lastHeartbeatCheckAt)}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <Button
        asChild
        variant="outline"
        size="sm"
        className="group h-8 rounded-full border-border/70 px-3 text-xs font-medium text-muted-foreground shadow-none hover:border-primary/40 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/15"
      >
        <Link href={routes.privateRoutes.admin.deviceDetails(row.original._id)}>
          Details
          <ChevronRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </Button>
    ),
  },
];
