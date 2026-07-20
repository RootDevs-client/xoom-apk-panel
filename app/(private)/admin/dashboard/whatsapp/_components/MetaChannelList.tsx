"use client";

import {
  deleteMetaChannel,
  getMetaChannels,
  verifyMetaChannel,
} from "@/actions/whatsapp/metaActions";
import { DataTableWithPagination } from "@/components/custom/data-table/DataTableWithPagination";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTableState } from "@/store/useTableStore";
import { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  Loader2,
  MoreHorizontal,
  Pencil,
  ShieldCheck,
  Trash2,
  XCircle,
} from "lucide-react";
import moment from "moment-timezone";
import { useEffect, useState } from "react";
import MetaChannelFormModal from "./MetaChannelFormModal";

export type MetaChannel = {
  _id: string;
  name: string;
  phoneNumberId: string;
  phoneNumber?: string | null;
  displayName?: string | null;
  isActive: boolean;
  isWebhookVerified: boolean;
  errorMessage?: string | null;
  lastVerifiedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";
  return moment(date).tz("Asia/Dhaka").format("DD MMM YYYY, HH:mm");
};

export default function MetaChannelList() {
  const tableId = "meta-channels";
  const [data, setData] = useState<MetaChannel[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<MetaChannel | null>(null);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const { refresh, page, limit, search } = useTableState(tableId);

  const fetchChannels = async () => {
    try {
      setIsLoading(true);
      const result = await getMetaChannels(page, limit, search);
      if (result?.status) {
        setData(result.data.channels || []);
        setTotal(result.data.pagination?.total || 0);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [refresh, page, limit, search]);

  const handleVerify = async (id: string) => {
    setVerifyingId(id);
    const res = await verifyMetaChannel(id);
    if (res?.status) {
      ToastMessage.success({
        title: "Channel verified",
        description: res.data?.displayName,
      });
    } else {
      ToastMessage.error({ title: res?.message || "Verification failed" });
    }
    setVerifyingId(null);
    fetchChannels();
  };

  const handleDelete = async (id: string) => {
    const res = await deleteMetaChannel(id);
    if (res?.status) {
      ToastMessage.success({ title: "Channel deleted" });
      fetchChannels();
    } else {
      ToastMessage.error({ title: res?.message || "Failed to delete" });
    }
  };

  const cols: ColumnDef<MetaChannel>[] = [
    {
      accessorKey: "name",
      header: "Channel Name",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="font-medium">{row.original.name}</span>
            {row.original.displayName && (
              <span className="text-xs text-muted-foreground">
                {row.original.displayName}
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "phoneNumberId",
      header: "Phone Number ID",
      cell: ({ row }) => (
        <span className="font-mono text-sm">{row.original.phoneNumberId}</span>
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: "Phone Number",
      cell: ({ row }) => (
        <span className="font-mono text-sm">
          {row.original.phoneNumber || "—"}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        const isVerified = row.original.isWebhookVerified;
        return (
          <div className="flex items-center gap-2">
            {isVerified ? (
              <Badge
                variant="outline"
                className="text-xs gap-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800"
              >
                <CheckCircle2 className="size-3" />
                Active
              </Badge>
            ) : isActive ? (
              <Badge
                variant="outline"
                className="text-xs gap-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
              >
                <Loader2 className="size-3" />
                Unverified
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs gap-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800"
              >
                <XCircle className="size-3" />
                Error
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "lastVerifiedAt",
      header: "Last Verified",
      cell: ({ row }) => formatDate(row.original.lastVerifiedAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const channel = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleVerify(channel._id)}
                disabled={verifyingId === channel._id}
              >
                {verifyingId === channel._id ? (
                  <Loader2 className="size-4 mr-2 animate-spin" />
                ) : (
                  <ShieldCheck className="size-4 mr-2" />
                )}
                Verify
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditTarget(channel)}>
                <Pencil className="size-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDelete(channel._id)}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="size-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-dm-sans font-medium text-lg">Meta Channels</h2>
          <p className="text-sm text-muted-foreground">
            Manage Meta WhatsApp Cloud API connections
          </p>
        </div>
        <Button
          size="sm"
          className="gap-1.5 text-white cursor-pointer"
          onClick={() => setCreateOpen(true)}
        >
          Add Channel
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DataTableWithPagination
            data={data}
            columns={cols}
            total={total}
            tableId={tableId}
            isLoading={isLoading}
            pagination={true}
          />
        </CardContent>
      </Card>

      <MetaChannelFormModal
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) fetchChannels();
        }}
        onSuccess={fetchChannels}
      />

      {editTarget && (
        <MetaChannelFormModal
          open={!!editTarget}
          onOpenChange={(open) => {
            if (!open) setEditTarget(null);
            if (!open) fetchChannels();
          }}
          onSuccess={fetchChannels}
          channel={editTarget}
        />
      )}
    </div>
  );
}
