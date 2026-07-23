"use client";

import { createWhatsAppSession } from "@/actions/whatsapp/whatsappActions";
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
import { connectSocket, disconnectSocket } from "@/lib/socket-client";
import { CheckCircle2, Loader2, QrCode, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ImSpinner9 } from "react-icons/im";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormValues {
  name: string;
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
    defaultValues: { name: "" },
  });

  const { handleSubmit, reset } = form;

  useEffect(() => {
    if (!open) {
      setStep("form");
      setQrCode(null);
      setChannelId(null);
      setErrorMessage("");
      disconnectSocket();
    }
  }, [open]);

  useEffect(() => {
    if (step === "qr" && channelId) {
      const socket = connectSocket();

      const handleConnect = () => {
        socket.emit("join:session", { sessionId: channelId });
      };

      socket.on("connect", handleConnect);

      socket.on("connect_error", (err) => {
        console.error("[Socket] connect_error:", err.message);
      });

      socket.on("disconnect", (reason) => {
        console.warn("[Socket] disconnected:", reason);
      });

      socket.on("error", (err) => {
        console.error("[Socket] error:", err);
      });

      socket.on("baileys:qr", (data: { sessionId: string; qrCode: string }) => {
        if (data.sessionId === channelId) {
          setQrCode(data.qrCode);
        }
      });

      socket.on("baileys:connected", (data: { sessionId: string }) => {
        if (data.sessionId === channelId) {
          setStep("connected");
          ToastMessage.success({ title: "WhatsApp connected!" });
          setTimeout(() => {
            onOpenChange(false);
            onSuccess();
          }, 1500);
        }
      });

      socket.on(
        "baileys:error",
        (data: { sessionId: string; error: string }) => {
          if (data.sessionId === channelId) {
            setErrorMessage(data.error);
            setStep("error");
            ToastMessage.error({ title: data.error });
          }
        },
      );

      if (socket.connected) {
        socket.emit("join:session", { sessionId: channelId });
      } else {
        socket.connect();
      }

      return () => {
        socket.emit("leave:session", { sessionId: channelId });
        socket.off("connect", handleConnect);
        socket.off("connect_error");
        socket.off("disconnect");
        socket.off("error");
        socket.off("baileys:qr");
        socket.off("baileys:connected");
        socket.off("baileys:error");
      };
    }
  }, [step, channelId, onOpenChange, onSuccess]);

  const resetForm = () => {
    reset({ name: "" });
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    setChannelName(data.name.trim());

    try {
      const res = await createWhatsAppSession({
        name: data.name.trim(),
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
          if (channelId) {
            disconnectSocket();
          }
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
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={() => {
                onOpenChange(false);
                onSuccess();
              }}
            >
              Close
            </Button>
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
