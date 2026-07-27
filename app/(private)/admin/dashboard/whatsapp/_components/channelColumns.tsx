"use client";

import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Hash, Radio, Users, XCircle } from "lucide-react";
import moment from "moment-timezone";

export type WhatsAppChannel = {
  _id: string;
  whatsappAccountId: string;
  jid: string;
  type: string;
  name: string;
  participantCount: number;
  syncStatus: string;
  isArchived: boolean;
  isMuted: boolean;
  isActive: boolean;
  admins: any[];
  createdAt: string;
  updatedAt: string;
  lastMessageAt: string;
  lastMessageId: string;
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";
  return moment(date).tz("Asia/Dhaka").format("DD MMM YYYY, HH:mm");
};

const syncStatusConfig: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  },
  synced: {
    label: "Synced",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
  },
  failed: {
    label: "Failed",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
  },
};

export const channelColumns: ColumnDef<WhatsAppChannel>[] = [
  {
    accessorKey: "name",
    header: "Channel",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
          {row.original.name?.charAt(0).toUpperCase() || "?"}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="font-medium truncate max-w-50">
            {row.original.name}
          </span>
          <span className="text-xs text-muted-foreground font-mono truncate max-w-50">
            {row.original.jid}
          </span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Radio className="size-3.5 text-muted-foreground" />
        <span className="capitalize text-sm">{row.original.type}</span>
      </div>
    ),
  },
  {
    accessorKey: "participantCount",
    header: "Participants",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <Users className="size-3.5 text-muted-foreground" />
        <span className="font-mono text-sm">
          {row.original.participantCount ?? 0}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "syncStatus",
    header: "Sync Status",
    cell: ({ row }) => {
      const status = row.original.syncStatus || "pending";
      const config = syncStatusConfig[status] || syncStatusConfig.pending;
      return (
        <Badge variant="outline" className={`text-xs ${config.className}`}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) =>
      row.original.isActive ? (
        <CheckCircle2 className="size-4 text-green-500" />
      ) : (
        <XCircle className="size-4 text-red-500" />
      ),
  },
  {
    accessorKey: "lastMessageAt",
    header: "Last Message",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm">
          {formatDate(row.original.lastMessageAt)}
        </span>
        {row.original.lastMessageId && (
          <span className="text-xs text-muted-foreground font-mono truncate max-w-30">
            <Hash className="size-3 inline mr-0.5" />
            {row.original.lastMessageId.slice(0, 16)}...
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
    cell: ({ row }) =>
      row.original.isArchived ? (
        <Badge
          variant="outline"
          className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
        >
          Archived
        </Badge>
      ) : (
        <span className="text-xs text-muted-foreground">—</span>
      ),
  },
];
