"use client";

import {
  deleteWhatsAppSession,
  disconnectWhatsAppChannel,
  reconnectWhatsAppChannel,
} from "@/actions/whatsapp/whatsappActions";
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
import { connectSocket } from "@/lib/socket-client";
import { ColumnDef } from "@tanstack/react-table";
import {
  Link2,
  Loader2,
  MoreHorizontal,
  Pencil,
  QrCode,
  RotateCw,
  Trash2,
  Wifi,
  WifiOff,
} from "lucide-react";
import moment from "moment-timezone";
import { useEffect, useRef, useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import type { Socket } from "socket.io-client";

export type WhatsAppSession = {
  _id: string;
  name: string;
  phone?: string | null;
  waDisplayName?: string | null;
  profilePicUrl?: string | null;
  connectionStatus: string;
  errorMessage?: string | null;
  baileysJid?: string | null;
  authCreds?: any;
  lastConnectedAt?: string | null;
  qrCodeRetries: number;
  createdAt: string;
  updatedAt: string;
};

const formatDate = (date?: string | null) => {
  if (!date) return "—";
  return moment(date).tz("Asia/Dhaka").format("DD MMM YYYY, HH:mm");
};

const statusConfig: Record<
  string,
  { label: string; className: string; icon: React.ElementType }
> = {
  idle: {
    label: "Idle",
    className:
      "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700",
    icon: WifiOff,
  },
  qr: {
    label: "QR Generated",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
    icon: Link2,
  },
  connecting: {
    label: "Connecting",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    icon: RotateCw,
  },
  connected: {
    label: "Connected",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800",
    icon: Wifi,
  },
  reconnecting: {
    label: "Reconnecting",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800",
    icon: RotateCw,
  },
  disconnected: {
    label: "Disconnected",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: WifiOff,
  },
  loggedOut: {
    label: "Logged Out",
    className:
      "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800",
    icon: WifiOff,
  },
  error: {
    label: "Error",
    className:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    icon: WifiOff,
  },
};

export const columns = ({
  onSuccess,
}: {
  onSuccess: () => void;
}): ColumnDef<WhatsAppSession>[] => [
  {
    accessorKey: "name",
    header: "Connection Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        {row.original.profilePicUrl ? (
          <img
            src={row.original.profilePicUrl}
            alt=""
            className="size-8 rounded-full object-cover"
          />
        ) : (
          <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {row.original.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex flex-col">
          <span className="font-medium">{row.original.name}</span>
          {row.original.waDisplayName && (
            <span className="text-xs text-muted-foreground">
              {row.original.waDisplayName}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone Number",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.phone ? `+${row.original.phone}` : "—"}
      </span>
    ),
  },
  {
    accessorKey: "connectionStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.connectionStatus || "idle";
      const config = statusConfig[status] || statusConfig.idle;
      const Icon = config.icon;
      return (
        <Badge
          variant="outline"
          className={`text-xs gap-1.5 ${config.className}`}
        >
          <Icon className="size-3" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    accessorKey: "lastConnectedAt",
    header: "Last Connected",
    cell: ({ row }) => formatDate(row.original.lastConnectedAt),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <ActionCell session={row.original} onSuccess={onSuccess} />
    ),
  },
];

function ActionCell({
  session,
  onSuccess,
}: {
  session: WhatsAppSession;
  onSuccess: () => void;
}) {
  const [editOpen, setEditOpen] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef<Record<string, (...args: any[]) => void>>({});

  const log = (msg: string, ...args: any[]) =>
    console.log(`[WA:QR:${session._id}]`, msg, ...args);

  const handleDisconnect = async () => {
    const res = await disconnectWhatsAppChannel(session._id);
    if (res?.status) {
      ToastMessage.success({ title: "Channel disconnected" });
      onSuccess();
    } else {
      ToastMessage.error({ title: res?.message || "Failed to disconnect" });
    }
  };

  const handleReconnect = async () => {
    const res = await reconnectWhatsAppChannel(session._id);
    if (res?.status) {
      ToastMessage.success({ title: "Reconnecting..." });
      onSuccess();
    } else {
      ToastMessage.error({ title: res?.message || "Failed to reconnect" });
    }
  };

  const handleDelete = async () => {
    const res = await deleteWhatsAppSession(session._id);
    if (res?.status) {
      ToastMessage.success({ title: "Channel deleted" });
      onSuccess();
    } else {
      ToastMessage.error({ title: res?.message || "Failed to delete" });
    }
  };

  // Renders the raw QR payload string (e.g. "2@...") into a scannable
  // image. The backend sends the raw Baileys QR string, not an image -
  // see WHATSAPP_FRONTEND_INTEGRATION.md section 1/3.
  const renderQrImage = async (raw: string) => {
    try {
      const { default: QRCode } = await import("qrcode");
      const dataUrl = await QRCode.toDataURL(raw, {
        width: 300,
        margin: 1,
      });
      log("QR image rendered");
      setQrCode(dataUrl);
      setQrLoading(false);
    } catch (err) {
      log("failed to render QR image", err);
      ToastMessage.error({ title: "Failed to render QR code" });
      setQrLoading(false);
    }
  };

  // Detach every registered handler from the currently-tracked socket
  const cleanup = (reason: string) => {
    const socket = socketRef.current;
    if (socket) {
      Object.entries(handlersRef.current).forEach(([event, handler]) => {
        socket.off(event, handler);
      });
      socket.emit("admin:leave", { accountId: session._id });
      log(`cleanup (${reason})`);
    }
    handlersRef.current = {};
    socketRef.current = null;
  };

  // Clean up whenever the QR dialog closes, and on unmount
  useEffect(() => {
    if (!qrOpen) {
      cleanup("dialog closed");
      setQrCode(null);
      setQrLoading(false);
    }
    return () => {
      cleanup("unmount");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qrOpen]);

  const attachHandlers = (socket: Socket) => {
    socketRef.current = socket;

    // --- qr: { accountId, qr: "2@..." } -------------------------------
    const onQr = (data: { accountId: string; qr: string }) => {
      log("qr event received", data);
      if (data.accountId !== session._id) {
        log(
          `ignored - accountId mismatch (expected="${session._id}" received="${data.accountId}")`,
        );
        return;
      }
      log("QR matched for this session, rendering image");
      renderQrImage(data.qr);
    };

    // --- ready: { accountId, phone, jid } ------------------------------
    const onReady = (data: {
      accountId: string;
      phone: string;
      jid: string;
    }) => {
      if (data.accountId !== session._id) return;
      log("ready event received", data);
      ToastMessage.success({ title: "WhatsApp connected!" });
      onSuccess();
      setTimeout(() => setQrOpen(false), 1500);
    };

    // --- disconnected: { accountId, reason? } --------------------------
    const onDisconnected = (data: { accountId: string; reason?: string }) => {
      if (data.accountId !== session._id) return;
      log("disconnected event received", data);
      setQrLoading(false);
      if (data.reason !== "manual_disconnect") {
        ToastMessage.error({
          title: `Disconnected${data.reason ? `: ${data.reason}` : ""}`,
        });
      }
      onSuccess();
    };

    // --- logout: { accountId } -----------------------------------------
    const onLogout = (data: { accountId: string }) => {
      if (data.accountId !== session._id) return;
      log("logout event received", data);
      setQrOpen(false);
      ToastMessage.info({ title: "Session logged out" });
      onSuccess();
    };

    // --- error: { accountId?, message, code? } --------------------------
    const onError = (data: {
      accountId?: string;
      message: string;
      code?: string;
    }) => {
      if (data.accountId && data.accountId !== session._id) return;
      log("error event received", data);
      setQrLoading(false);
      ToastMessage.error({ title: data.message || "WhatsApp error" });
    };

    // --- status: { accountId, status } (informational, just logged) ----
    const onStatus = (data: { accountId: string; status: string }) => {
      if (data.accountId !== session._id) return;
      log("status event received", data);
    };

    handlersRef.current = {
      qr: onQr,
      ready: onReady,
      disconnected: onDisconnected,
      logout: onLogout,
      error: onError,
      status: onStatus,
    };

    Object.entries(handlersRef.current).forEach(([event, handler]) => {
      socket.on(event, handler);
      log(
        `listener attached: "${event}" (socket id=${socket.id ?? "pending"})`,
      );
    });
  };

  const handleRefreshQR = () => {
    if (session.connectionStatus === "connected") return;

    setQrOpen(true);
    setQrCode(null);
    setQrLoading(true);

    const socket = connectSocket();
    log("requesting refresh, socket connected =", socket.connected);
    attachHandlers(socket);

    const requestQr = () => {
      socket.emit("admin:join", { accountId: session._id });
      socket.emit("refresh-qr", { accountId: session._id });
      log("admin:join + refresh-qr emitted");
      ToastMessage.info({ title: "Requesting QR code..." });
    };

    if (socket.connected) {
      requestQr();
    } else {
      socket.once("connect", requestQr);
    }
  };

  const isConnected = session.connectionStatus === "connected";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="size-8">
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {isConnected ? (
            <DropdownMenuItem onClick={handleDisconnect}>
              <WifiOff className="size-4 mr-2" />
              Disconnect
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleReconnect}>
              <RotateCw className="size-4 mr-2" />
              {session.authCreds ? "Reconnect" : "Connect"}
            </DropdownMenuItem>
          )}
          {!isConnected && (
            <DropdownMenuItem onClick={handleRefreshQR}>
              <QrCode className="size-4 mr-2" />
              Refresh QR
            </DropdownMenuItem>
          )}
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
        session={session}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSuccess={onSuccess}
      />

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex flex-col items-center gap-4">
            {qrCode ? (
              <div className="bg-white p-4 rounded-xl border shadow-sm">
                <img src={qrCode} alt="WhatsApp QR Code" className="size-56" />
              </div>
            ) : (
              <div className="size-56 flex flex-col items-center justify-center gap-2">
                <Loader2 className="size-8 animate-spin text-muted-foreground" />
                {qrLoading && (
                  <span className="text-xs text-muted-foreground">
                    Requesting QR code...
                  </span>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function EditNameDialog({
  session,
  open,
  onOpenChange,
  onSuccess,
}: {
  session: WhatsAppSession;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState(session.name);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setLoading(true);
    const { updateWhatsAppSession } =
      await import("@/actions/whatsapp/whatsappActions");
    const res = await updateWhatsAppSession(session._id, {
      name: name.trim(),
    });
    if (res?.status) {
      ToastMessage.success({ title: "Channel name updated" });
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
          <DialogTitle>Edit Channel Name</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            placeholder="Channel name"
          />
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
