"use client";

import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment-timezone";

export type WhatsAppMessage = {
  _id: string;
  session: string;
  sessionName?: string;
  waMessageId: string;
  from: string;
  to: string;
  body: string;
  type: string;
  mediaUrl?: string;
  direction: "incoming" | "outgoing";
  contactName?: string;
  status?: string;
  timestamp: string;
  isRead: boolean;
};

const formatDate = (date: string) => {
  return moment(date).tz("Asia/Dhaka").format("DD MMM YYYY, HH:mm [hrs]");
};

const typeColors: Record<string, string> = {
  text: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  image:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  document:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  audio: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400",
  video:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
};

export const columns: ColumnDef<WhatsAppMessage>[] = [
  {
    accessorKey: "session",
    header: "Channel",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.sessionName || "—"}</span>
    ),
  },
  {
    accessorKey: "direction",
    header: "Direction",
    cell: ({ row }) => {
      const dir = row.original.direction;
      return (
        <Badge
          variant="outline"
          className={`text-xs ${
            dir === "incoming"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          }`}
        >
          {dir === "incoming" ? "Incoming" : "Outgoing"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "contactName",
    header: "Contact",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {row.original.contactName || "Unknown"}
        </span>
        <span className="text-xs font-mono text-muted-foreground">
          {row.original.from}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "from",
    header: "From",
    cell: ({ row }) => (
      <span className="text-sm font-mono">{row.original.from}</span>
    ),
  },
  {
    accessorKey: "body",
    header: "Message",
    cell: ({ row }) => {
      const body = row.original.body || "";
      return (
        <span className="text-sm line-clamp-2 max-w-xs">
          {body ||
            (row.original.type !== "text" ? `[${row.original.type}]` : "")}
        </span>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.original.type;
      return (
        <Badge
          variant="outline"
          className={`text-xs ${typeColors[type] || ""}`}
        >
          {type}
        </Badge>
      );
    },
  },
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => formatDate(row.original.timestamp),
  },
];
