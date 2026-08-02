"use client";

import { deleteWhatsAppChannel } from "@/actions/whatsapp/whatsappActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Hash,
  MoreHorizontal,
  Pencil,
  Radio,
  Trash2,
  Users,
  XCircle,
} from "lucide-react";
import moment from "moment-timezone";
import { useState } from "react";
import { ImSpinner9 } from "react-icons/im";

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

export const channelColumns = ({
  onSuccess,
}: {
  onSuccess: () => void;
}): ColumnDef<WhatsAppChannel>[] => [
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
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionCell channel={row.original} onSuccess={onSuccess} />
    ),
  },
];

function ActionCell({
  channel,
  onSuccess,
}: {
  channel: WhatsAppChannel;
  onSuccess: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);

  const handleDelete = async () => {
    const loading = ToastMessage.loading("Deleting...");
    const res = await deleteWhatsAppChannel(channel._id);

    if (res?.status) {
      ToastMessage.success({ title: "Channel deleted" }, { id: loading });
      onSuccess();
    } else {
      ToastMessage.error(
        { title: res?.message || "Failed to delete" },
        { id: loading },
      );
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="size-4 mr-2" />
            Edit Name
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600"
          >
            <Trash2 className="size-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <EditNameDialog
        channel={channel}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}

function EditNameDialog({
  channel,
  open,
  onOpenChange,
  onSuccess,
}: {
  channel: WhatsAppChannel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(channel.name);
  const [isActive, setIsActive] = useState(channel.isActive);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const { updateWhatsAppChannel } =
      await import("@/actions/whatsapp/whatsappActions");
    const res = await updateWhatsAppChannel(channel._id, {
      name: name.trim(),
      isActive,
    });
    if (res?.status) {
      ToastMessage.success({ title: "Channel updated" });
      onSuccess();
      onOpenChange(false);
    } else {
      ToastMessage.error({ title: res?.message || "Failed to update" });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Edit Channel</DialogTitle>
        </DialogHeader>
        <div className="py-2 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">Channel Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Channel name"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 rounded border-input"
            />
            Active
          </label>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className="text-white cursor-pointer"
          >
            {loading && <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
