"use client";

import {
  getWhatsAppChannelList,
  getWhatsAppChannelMessages,
} from "@/actions/whatsapp/whatsappActions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { connectSocket } from "@/lib/socket-client";
import { Hash, Loader2, MessageSquare, Radio, Users } from "lucide-react";
import moment from "moment-timezone";
import { useCallback, useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

interface Channel {
  _id: string;
  whatsappAccountId: string;
  jid: string;
  type: string;
  name: string;
  participantCount: number;
  syncStatus: string;
  isActive: boolean;
  lastMessageAt: string;
  lastMessageId: string;
}

interface ChannelMessage {
  _id: string;
  whatsappAccountId: string;
  channelId: string;
  messageId: string;
  senderJid: string;
  fromMe: boolean;
  type: string;
  text?: string;
  caption?: string;
  forwarded: boolean;
  mentions: string[];
  raw: any;
  timestamp: string;
  status: string;
  createdAt: string;
}

interface TransformedMessage {
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

function extractMediaFromRaw(raw: any): { mediaUrl?: string; mimeType?: string; fileName?: string } {
  if (!raw) return {};
  // Check for different message sub-types in raw
  const mediaTypes = ["imageMessage", "videoMessage", "audioMessage", "documentMessage"];
  for (const mediaType of mediaTypes) {
    const media = raw[mediaType];
    if (media?.url) {
      return {
        mediaUrl: media.url,
        mimeType: media.mimetype,
        fileName: media.fileName,
      };
    }
  }
  return {};
}

function transformMessage(msg: ChannelMessage): TransformedMessage {
  const media = extractMediaFromRaw(msg.raw);
  // Use caption from raw imageMessage if available, fall back to msg.text
  const body = msg.text || msg.caption || (msg.raw?.imageMessage?.caption) || "";
  return {
    _id: msg._id,
    keyId: msg.messageId,
    fromMe: msg.fromMe,
    pushName: msg.senderJid?.split("@")[0] || "Unknown",
    body,
    type: msg.type === "text" ? "conversation" : msg.type,
    status: msg.status,
    timestamp: msg.timestamp,
    ...media,
  };
}

export default function ChannelMessagePanel() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<TransformedMessage[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoadingChannels(true);
      const result = await getWhatsAppChannelList(1, 100, "");
      console.log("result====", result);
      if (result?.status) {
        const list = Array.isArray(result.data)
          ? result.data
          : result.data?.channels || [];
        setChannels(list);
      }
      setIsLoadingChannels(false);
    };
    fetchChannels();
  }, []);

  useEffect(() => {
    if (!selectedChannel) return;
    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      const result = await getWhatsAppChannelMessages(
        selectedChannel._id,
        1,
        200,
      );

      console.log("response======", result);
      if (result?.status) {
        const rawMessages = Array.isArray(result.data)
          ? result.data
          : result.data?.messages || [];
        setMessages(rawMessages.map(transformMessage));
      }
      setIsLoadingMessages(false);
    };
    fetchMessages();
  }, [selectedChannel]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const socket = connectSocket();

    const onNewMessage = (data: {
      channelId: string;
      jid: string;
      message: { body: string; from: string; timestamp: string };
    }) => {
      if (!selectedChannel || data.channelId !== selectedChannel._id) return;
      const optimistic: TransformedMessage = {
        _id: `opt_${Date.now()}`,
        keyId: `opt_${Date.now()}`,
        fromMe: false,
        pushName: data.jid?.split("@")[0] || "Unknown",
        body: data.message.body || "",
        type: "conversation",
        status: "pending",
        timestamp: data.message.timestamp || new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimistic]);
    };

    socket.on("whatsapp:new-message", onNewMessage);
    if (!socket.connected) socket.connect();

    return () => {
      socket.off("whatsapp:new-message", onNewMessage);
    };
  }, [selectedChannel]);

  const handleSelectChannel = useCallback((ch: Channel) => {
    setSelectedChannel(ch);
    setMessages([]);
  }, []);

  const handleMessageDeleted = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  }, []);

  if (isLoadingChannels) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading channels...
        </CardContent>
      </Card>
    );
  }

  if (channels.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Radio className="size-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No channels found</p>
          <p className="text-xs text-muted-foreground mt-1">
            Sync WhatsApp channels to view messages
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-12rem)]">
      {/* Left: Channel List */}
      <div className="w-72 shrink-0">
        <Card className="h-full overflow-hidden">
          <CardContent className="p-0 h-full overflow-y-auto divide-y">
            {channels.map((ch) => {
              const isSelected = ch._id === selectedChannel?._id;
              return (
                <div
                  key={ch._id}
                  onClick={() => handleSelectChannel(ch)}
                  className={`flex items-center gap-3 p-3 transition-colors cursor-pointer ${
                    isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                  }`}
                >
                  <Avatar className="size-10 shrink-0">
                    <AvatarFallback>
                      <Radio className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {ch.name || ch.jid?.split("@")[0]}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {ch.jid}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Users className="size-3" />
                        {ch.participantCount ?? 0}
                      </span>
                      {ch.lastMessageAt && (
                        <span className="text-[10px] text-muted-foreground">
                          {moment(ch.lastMessageAt).fromNow()}
                        </span>
                      )}
                    </div>
                  </div>
                  {ch.lastMessageId && (
                    <Hash className="size-3 text-muted-foreground shrink-0" />
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Right: Messages */}
      <div className="flex-1">
        {!selectedChannel ? (
          <Card className="h-full">
            <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageSquare className="size-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">
                Select a channel to view messages
              </p>
            </CardContent>
          </Card>
        ) : (
          <Card className="h-full flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 p-4 border-b shrink-0">
              <Avatar className="size-9">
                <AvatarFallback>
                  <Radio className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {selectedChannel.name || selectedChannel.jid?.split("@")[0]}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {selectedChannel.jid} ·{" "}
                  {selectedChannel.participantCount ?? 0} participants
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  No messages in this channel yet.
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg.keyId}
                    message={msg}
                    onDeleted={handleMessageDeleted}
                  />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
