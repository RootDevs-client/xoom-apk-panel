"use client";

import { createWhatsAccount } from "@/actions/whatsapp/whatsappActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import InputField from "@/components/form/InputField";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { connectSocket, reconnectSocketToUrl } from "@/lib/socket-client";
import type { Socket } from "socket.io-client";
import { CheckCircle2, Loader2, QrCode, Smartphone } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ImSpinner9 } from "react-icons/im";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormValues {
  name: string;
  phone: string;
}

export default function ConnectSessionModal({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "qr" | "connected" | "error">(
    "form",
  );
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [channelId, setChannelId] = useState<string | null>(null);
  const [channelName, setChannelName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<FormValues>({
    defaultValues: { name: "", phone: "" },
  });

  const socketRef = useRef<Socket | null>(null);

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (!open) {
      setStep("form");
      setQrCode(null);
      setChannelId(null);
      setErrorMessage("");
    }
  }, [open]);

  const setupChannelSocket = (channelId: string) => {
    const socket = connectSocket();
    socketRef.current = socket;

    const onConnect = () => {
      console.log("[Socket] Connected");
      socket.emit("admin:join", { accountId: channelId });
    };

    const onQR = (data: {
      accountId: string;
      qrCode: string;
      connectionString?: string;
    }) => {
      if (data.accountId !== channelId) return;
      console.log("[Socket] whatsapp:qr", data);
      setQrCode(data.qrCode);
      if (data.connectionString) {
        socket.off("connect", onConnect);
        socket.off("whatsapp:qr", onQR);
        socket.off("whatsapp:connected", onConnected);
        socket.off("whatsapp:error", onError);
        const newSocket = reconnectSocketToUrl(data.connectionString);
        socketRef.current = newSocket;
        newSocket.on("connect", onConnect);
        newSocket.on("whatsapp:qr", onQR);
        newSocket.on("whatsapp:connected", onConnected);
        newSocket.on("whatsapp:error", onError);
        if (newSocket.connected) onConnect();
      }
    };

    const onConnected = (d: { accountId: string }) => {
      if (d.accountId === channelId) {
        setStep("connected");
        ToastMessage.success({ title: "WhatsApp connected!" });
        setTimeout(() => {
          onOpenChange(false);
          onSuccess();
        }, 1500);
      }
    };

    const onError = (d: { accountId: string; error: string }) => {
      if (d.accountId === channelId) {
        setErrorMessage(d.error);
        setStep("error");
        ToastMessage.error({ title: d.error });
      }
    };

    socket.on("connect", onConnect);
    socket.on("whatsapp:qr", onQR);
    socket.on("whatsapp:connected", onConnected);
    socket.on("whatsapp:error", onError);

    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.emit("admin:leave", { accountId: channelId });
      socket.off("connect", onConnect);
      socket.off("whatsapp:qr", onQR);
      socket.off("whatsapp:connected", onConnected);
      socket.off("whatsapp:error", onError);
    };
  };

  useEffect(() => {
    if (!channelId) return;
    return setupChannelSocket(channelId);
  }, [channelId, onOpenChange, onSuccess]);

  const resetForm = () => {
    reset({ name: "", phone: "" });
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setChannelName(data.name.trim());

    try {
      const res = await createWhatsAccount({
        name: data.name.trim(),
        phone: data.phone.trim(),
      });

      console.log("res====", res);

      if (res?.status) {
        setChannelId(res.data._id);
        setStep("qr");
        ToastMessage.success({
          title: "Channel created!",
          description: "Scan the QR code with your WhatsApp to connect.",
        });
      } else {
        ToastMessage.error({
          title: res?.message || "Failed to create channel",
        });
      }
    } catch {
      ToastMessage.error({ title: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v: boolean) => {
        if (!v) {
          resetForm();
        }
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "form" && "Connect WhatsApp"}
            {step === "qr" && "Scan QR Code"}
            {step === "connected" && "Connected!"}
            {step === "error" && "Connection Error"}
          </DialogTitle>
        </DialogHeader>

        {step === "form" && (
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="py-4 space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
                  <Smartphone className="size-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                    <p className="font-medium">Baileys WhatsApp Integration</p>
                    <p>
                      Create a WhatsApp connection and scan the QR code with
                      your WhatsApp to connect.
                    </p>
                  </div>
                </div>

                <InputField
                  name="name"
                  label="Connection Name"
                  placeholder="e.g. Support WhatsApp"
                  required
                />
                <InputField
                  name="phone"
                  label="Mobile Number"
                  placeholder="e.g. +8801712345678"
                  required
                />
              </div>

              <DialogFooter className="flex-col sm:flex-row gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="text-white cursor-pointer"
                >
                  {loading && (
                    <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />
                  )}
                  Create Channel
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        )}

        {step === "qr" && (
          <div className="py-6 flex flex-col items-center gap-4">
            <p className="text-sm text-muted-foreground text-center">
              Open WhatsApp on your phone and scan this QR code to connect{" "}
              <strong>{channelName}</strong>
            </p>
            <div className="bg-white p-4 rounded-xl border shadow-sm">
              {qrCode ? (
                <img src={qrCode} alt="WhatsApp QR Code" className="size-56" />
              ) : (
                <div className="size-56 flex items-center justify-center">
                  <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <QrCode className="size-3" />
              QR code refreshes automatically
            </div>
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const s = socketRef.current;
                  if (s?.connected) {
                    console.log("[Socket] emitting refresh-qr", channelId);
                    s.emit("refresh-qr", { accountId: channelId });
                  } else {
                    console.warn("[Socket] not connected");
                  }
                }}
              >
                Refresh QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  onSuccess();
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}

        {step === "connected" && (
          <div className="py-8 flex flex-col items-center gap-4">
            <CheckCircle2 className="size-16 text-green-500" />
            <p className="text-sm text-muted-foreground text-center">
              <strong>{channelName}</strong> is now connected to WhatsApp!
            </p>
          </div>
        )}

        {step === "error" && (
          <div className="py-6 flex flex-col items-center gap-4">
            <p className="text-sm text-red-500 text-center">{errorMessage}</p>
            <Button
              onClick={() => setStep("form")}
              className="text-white cursor-pointer"
            >
              Try Again
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
