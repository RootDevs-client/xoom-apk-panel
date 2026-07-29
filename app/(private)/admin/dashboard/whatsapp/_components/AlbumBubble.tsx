"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Check, CheckCheck } from "lucide-react";
import moment from "moment-timezone";
import { useState } from "react";

export interface AlbumMessage {
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
  messages: AlbumMessage[];
}

export default function AlbumBubble({ messages }: Props) {
  const [modalImage, setModalImage] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const isMine = messages[0]?.fromMe ?? false;
  const lastMsg = messages[messages.length - 1];
  const caption = lastMsg?.body || "";

  const time = lastMsg?.timestamp
    ? moment(lastMsg.timestamp).format("HH:mm")
    : "";

  const images = messages.filter(
    (m) =>
      m.mediaUrl &&
      !imageErrors.has(m.keyId) &&
      (m.mimeType?.startsWith("image/") ||
        m.type === "image" ||
        m.type === "imageMessage"),
  );

  const totalCount = messages.length;
  const visibleCount = images.length;
  const maxVisible = 5;

  // If no images loaded, render nothing meaningful
  if (images.length === 0) return null;

  // Grid layout: 1 col for 1 img, 2 cols for 2-4, 3 cols for 5+
  const gridCols =
    visibleCount === 1
      ? "grid-cols-1"
      : visibleCount <= 4
        ? "grid-cols-2"
        : "grid-cols-3";

  const getImageSizeClass = (index: number) => {
    if (visibleCount === 1) return "aspect-video";
    if (visibleCount === 2) return "aspect-square";
    if (visibleCount === 3) {
      if (index === 0) return "row-span-2 aspect-square";
      return "aspect-square";
    }
    if (visibleCount === 4) return "aspect-square";
    if (visibleCount >= 5) {
      if (index === 0) return "col-span-2 row-span-2 aspect-video";
      return "aspect-square";
    }
    return "aspect-square";
  };

  const statusIcon = () => {
    if (!isMine) return null;
    switch (messages[0]?.status) {
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

  return (
    <>
      <div
        className={`flex group ${isMine ? "justify-end" : "justify-start"}`}
      >
        <div className={`max-w-[75%] ${isMine ? "items-end" : "items-start"}`}>
          <div
            className={`overflow-hidden rounded-2xl ${
              isMine
                ? "bg-primary text-white rounded-br-sm"
                : "bg-muted text-foreground rounded-bl-sm"
            }`}
          >
            {/* Image Grid */}
            <div className={`grid ${gridCols} gap-0.5 p-0.5`}>
              {images.slice(0, maxVisible).map((msg, idx) => {
                const isLastHidden = totalCount > maxVisible && idx === maxVisible - 1 && visibleCount === maxVisible;

                return (
                  <div
                    key={msg.keyId}
                    className={`relative overflow-hidden ${getImageSizeClass(idx)}`}
                  >
                    <img
                      src={msg.mediaUrl!}
                      alt=""
                      className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                      onClick={() => setModalImage(msg.mediaUrl!)}
                      onError={() =>
                        setImageErrors((prev) => new Set(prev).add(msg.keyId))
                      }
                      loading="lazy"
                    />
                    {isLastHidden && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center cursor-pointer">
                        <span className="text-white text-lg font-bold">
                          +{totalCount - maxVisible}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Caption */}
            {caption && (
              <div className="px-3 pb-1">
                <p className="text-sm leading-relaxed break-words">
                  {caption}
                </p>
              </div>
            )}

            {/* Timestamp & status */}
            <div
              className={`flex items-center gap-1 px-3 pb-2 ${
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
              {totalCount > 1 && (
                <span className="text-[10px] text-white/50">
                  · {totalCount} photos
                </span>
              )}
              {statusIcon()}
            </div>
          </div>
        </div>
      </div>

      {/* Full-size image modal */}
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
