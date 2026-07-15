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
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Check, CheckCheck, Download, FileText, Trash2 } from "lucide-react";
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
  mediaUrl?: string;
  mimeType?: string;
  fileName?: string;
}

interface Props {
  message: Message;
  onDeleted: (messageId: string) => void;
}

export default function MessageBubble({ message, onDeleted }: Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [modalImage, setModalImage] = useState<string | null>(null);

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
      ToastMessage.error({
        title: res?.message || "Failed to delete message",
      });
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

  const isImage =
    message.type === "imageMessage" || message.mimeType?.startsWith("image/");
  const isVideo =
    message.type === "videoMessage" || message.mimeType?.startsWith("video/");
  const isAudio =
    message.type === "audioMessage" || message.mimeType?.startsWith("audio/");
  const isDocument =
    message.type === "documentMessage" ||
    (message.mediaUrl && !isImage && !isVideo && !isAudio);

  const renderMedia = () => {
    if (!message.mediaUrl) return null;

    if (isImage && !imageError) {
      return (
        <div className="relative group/img">
          <img
            src={message.mediaUrl}
            alt={message.body || "Image"}
            className="max-w-full rounded-lg cursor-pointer object-cover max-h-64"
            onClick={() => setModalImage(message.mediaUrl!)}
            onError={() => setImageError(true)}
          />
          {/* View fullscreen overlay */}
          <div
            className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors rounded-lg cursor-pointer flex items-center justify-center"
            onClick={() => setModalImage(message.mediaUrl!)}
          >
            <span className="opacity-0 group-hover/img:opacity-100 text-white text-xs bg-black/50 px-2 py-1 rounded transition-opacity">
              View
            </span>
          </div>
        </div>
      );
    }

    if (isVideo) {
      return (
        <video
          src={message.mediaUrl}
          controls
          className="max-w-full rounded-lg max-h-64"
          preload="metadata"
        >
          Your browser does not support the video tag.
        </video>
      );
    }

    if (isAudio) {
      return (
        <audio
          src={message.mediaUrl}
          controls
          className="max-w-full h-10"
          preload="none"
        >
          Your browser does not support the audio tag.
        </audio>
      );
    }

    if (isDocument) {
      return (
        <a
          href={message.mediaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            isMine
              ? "bg-white/10 hover:bg-white/20"
              : "bg-muted/80 hover:bg-muted"
          }`}
        >
          <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileText className="size-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {message.fileName || "Document"}
            </p>
            <p className="text-[10px] opacity-70">Click to download</p>
          </div>
          <Download className="size-4 shrink-0 opacity-70" />
        </a>
      );
    }

    return null;
  };

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
            <Trash2 className="size-3" />
          </button>

          <div
            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed wrap-break-word ${
              isMine
                ? "bg-primary text-white rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm"
            }`}
          >
            {/* Media content */}
            {renderMedia()}

            {/* Caption / text body */}
            {message.body && (
              <p className={message.mediaUrl ? "mt-1.5" : ""}>{message.body}</p>
            )}

            {/* Empty media fallback */}
            {!message.body && !message.mediaUrl && (
              <p className="italic text-xs opacity-70">
                [{message.type.replace("Message", "")}]
              </p>
            )}

            <div
              className={`flex items-center gap-1 ${
                message.mediaUrl ? "mt-1" : "mt-1"
              } ${isMine ? "justify-end" : "justify-start"}`}
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

      {/* Delete confirmation */}
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image preview modal */}
      <Dialog
        open={!!modalImage}
        onOpenChange={(open) => !open && setModalImage(null)}
      >
        <DialogContent className="max-w-2xl p-1 overflow-hidden bg-background border shadow-xl">
          <div className="relative">
            {modalImage && (
              <img
                src={modalImage}
                alt="Full size"
                className="w-full h-auto max-h-[75vh] object-contain"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
