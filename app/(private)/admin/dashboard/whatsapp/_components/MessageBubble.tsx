"use client";

import moment from "moment-timezone";
import { Check, CheckCheck } from "lucide-react";

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
}

export default function MessageBubble({ message }: Props) {
  const isMine = message.fromMe;
  const time = message.timestamp
    ? moment(message.timestamp).format("HH:mm")
    : "";

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
    message.type !== "conversation" &&
    message.type !== "extendedTextMessage";

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed break-words ${
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
  );
}
