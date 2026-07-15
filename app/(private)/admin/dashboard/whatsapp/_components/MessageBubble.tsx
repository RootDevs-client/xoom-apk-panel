"use client";

import { deleteWhatsAppMessage } from "@/actions/whatsapp/whatsappActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Check, CheckCheck, Trash2 } from "lucide-react";
import moment from "moment-timezone";
import { useState } from "react";

interface Message {
  _id: string;
  keyId: string;
  fromMe: boolean;
  pushName?: string;
  body: string;
  type: string;
  status: string;
  timestamp: string;
}

interface Props {
  message: Message;
  onDeleted: (messageId: string) => void;
}

export default function MessageBubble({ message, onDeleted }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const isMine = message.fromMe;
  const time = message.timestamp
    ? moment(message.timestamp).format("HH:mm")
    : "";

  const handleDelete = async () => {
    setIsDeleting(true);
    const res = await deleteWhatsAppMessage(message._id);
    if (res?.status) {
      ToastMessage.success({ title: "Message deleted" });
      onDeleted(message._id);
    } else {
      ToastMessage.error({ title: res?.message || "Failed to delete message" });
    }
    setIsDeleting(false);
    setShowConfirm(false);
  };

  const statusIcon = () => {
    if (!isMine) return null;
    switch (message.status) {
      case "sent":
        return <Check className="size-3" />;
      case "delivered":
        return <CheckCheck className="size-3" />;
      case "read":
        return <CheckCheck className="size-3 text-blue-400" />;
      case "pending":
        return <Check className="size-3 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const isMedia =
    message.type !== "conversation" && message.type !== "extendedTextMessage";

  return (
    <>
      <div
        className={`flex group ${isMine ? "justify-end" : "justify-start"}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className="relative max-w-[75%]">
          {/* Delete button on hover */}
          <button
            onClick={() => setShowConfirm(true)}
            className={`absolute -top-2 ${
              isMine ? "-left-2" : "-right-2"
            } size-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10`}
            title="Delete message"
          >
            <Trash2 className="size-3 text-white" />
          </button>

          <div
            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed wrap-break-word ${
              isMine
                ? "bg-primary text-white rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm"
            }`}
          >
            {isMedia && !message.body && (
              <p className="italic text-xs opacity-70">[{message.type}]</p>
            )}
            {message.body && <p>{message.body}</p>}
            <div
              className={`flex items-center gap-1 mt-1 ${
                isMine ? "justify-end" : "justify-start"
              }`}
            >
              <span
                className={`text-[10px] ${
                  isMine ? "text-white/70" : "text-muted-foreground"
                }`}
              >
                {time}
              </span>
              {statusIcon()}
            </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this message. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
