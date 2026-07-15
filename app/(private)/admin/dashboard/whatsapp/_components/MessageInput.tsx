"use client";

import { useState, useRef } from "react";
import { sendWhatsAppMessage } from "@/actions/whatsapp/whatsappActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Button } from "@/components/ui/button";
import { Send, Loader2 } from "lucide-react";

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
  sessionId: string;
  remoteJid: string;
  onMessageSent: (message: Message) => void;
}

export default function MessageInput({ sessionId, remoteJid, onMessageSent }: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = async () => {
    const body = text.trim();
    if (!body || sending) return;

    setSending(true);
    const optimisticId = `opt_${Date.now()}`;
    const optimistic: Message = {
      _id: optimisticId,
      keyId: optimisticId,
      fromMe: true,
      body,
      type: "conversation",
      status: "pending",
      timestamp: new Date().toISOString(),
    };
    onMessageSent(optimistic);
    setText("");

    try {
      const result = await sendWhatsAppMessage({
        sessionId,
        remoteJid,
        body,
      });
      if (!result?.status) {
        ToastMessage.error({ title: result?.message || "Failed to send" });
      }
    } catch {
      ToastMessage.error({ title: "Failed to send message" });
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 border-t">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type a message..."
        disabled={sending}
        className="flex-1 h-9 rounded-full border border-input bg-transparent px-4 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
      />
      <Button
        size="icon"
        className="rounded-full size-9 shrink-0 text-white cursor-pointer"
        onClick={handleSend}
        disabled={!text.trim() || sending}
      >
        {sending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Send className="size-4" />
        )}
      </Button>
    </div>
  );
}
