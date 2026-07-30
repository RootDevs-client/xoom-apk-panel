"use client";

import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment-timezone";

export type Device = {
  _id: string;
  deviceId: string;
  appVersion: string;
  createdAt: string;
  deviceModel: string;
  deviceName: string;
  lastEvent: string;
  lastHeartbeatCheckAt: string;
  lastSuccessfulHeartbeatAt: string;
  lifecycleStatus: string;
  manufacturer: string;
  mobileNumber: string;
  osName: string;
  osVersion: string;
  platform: string;
  updatedAt: string;
};

const formatDate = (date: string) => {
  if (!date) return "—";
  return moment(date)
    .tz("Asia/Dhaka")
    .format("DD MMM YYYY, HH:mm");
};

const timeAgo = (date: string) => {
  if (!date) return "—";
  return moment(date).tz("Asia/Dhaka").fromNow();
};

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    APP_ACTIVE: { variant: "default", label: "Active" },
    APP_INACTIVE: { variant: "secondary", label: "Inactive" },
    APP_DELETED: { variant: "destructive", label: "Deleted" },
  };

  const config = variants[status] ?? { variant: "outline" as const, label: status };

  return (
    <Badge variant={config.variant} className="text-xs font-medium whitespace-nowrap">
      {config.label}
    </Badge>
  );
}

function PlatformBadge({ platform }: { platform: string }) {
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
      <div className="flex flex-col min-w-0">
        <span className="font-medium text-sm truncate max-w-[180px]">
          {row.original.deviceName || "—"}
        </span>
        <span className="text-xs text-muted-foreground truncate max-w-[180px]">
          {row.original.deviceModel || ""}
        </span>
      </div>
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
    cell: ({ row }) => {
      const event = row.original.lastEvent;
      const formatted = event
        ? event.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
        : "—";
      return <span className="text-xs text-muted-foreground">{formatted}</span>;
    },
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
];
