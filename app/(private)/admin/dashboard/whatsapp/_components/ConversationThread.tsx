"use client";

import { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, User } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

interface Conversation {
  _id: string;
  remoteJid: string;
  contactName?: string;
  contactPhone?: string;
  profilePicUrl?: string;
  lastMessage: { body: string; timestamp: string; fromMe: boolean };
  unreadCount: number;
  lastMessageAt: string;
}

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
  sessionName?: string;
  conversation: Conversation | null;
  messages: Message[];
  isLoading: boolean;
  onMessageSent: (message: Message) => void;
  onMessageDeleted: (messageId: string) => void;
}

export default function ConversationThread({
  sessionId,
  sessionName,
  conversation,
  messages,
  isLoading,
  onMessageSent,
  onMessageDeleted,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!conversation) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
          <MessageSquare className="size-10 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Select a conversation to view messages
          </p>
        </CardContent>
      </Card>
    );
  }

  const contactName =
    conversation.contactName ||
    conversation.contactPhone ||
    conversation.remoteJid.split("@")[0];

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="flex items-center gap-3 p-4 border-b shrink-0">
        <Avatar className="size-9">
          <AvatarImage src={conversation.profilePicUrl} />
          <AvatarFallback>
            <User className="size-4" />
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{contactName}</p>
          <p className="text-[10px] text-muted-foreground">
            {sessionName && <span className="font-medium">{sessionName}</span>}
            {sessionName && " · "}
            {conversation.contactPhone || conversation.remoteJid.split("@")[0]}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
            No messages yet. Send a message to start the conversation.
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.keyId}
              message={msg}
              onDeleted={onMessageDeleted}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="shrink-0">
        <MessageInput
          sessionId={sessionId}
          remoteJid={conversation.remoteJid}
          onMessageSent={onMessageSent}
        />
      </div>
    </Card>
  );
}
