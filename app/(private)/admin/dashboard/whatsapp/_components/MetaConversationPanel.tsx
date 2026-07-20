"use client";

import {
  getMetaChannels,
  getMetaConversations,
  getMetaMessages,
  deleteMetaConversation,
  updateMetaConversationName,
} from "@/actions/whatsapp/metaActions";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { connectSocket, disconnectSocket } from "@/lib/whatsapp-meta/socket-client";
import {
  Check,
  Loader2,
  MessageSquare,
  Pencil,
  Trash2,
  User,
  X,
} from "lucide-react";
import moment from "moment-timezone";
import { useCallback, useEffect, useRef, useState } from "react";
import MetaMessageBubble from "./MetaMessageBubble";
import MetaMessageInput from "./MetaMessageInput";

interface Channel {
  _id: string;
  name: string;
  isActive: boolean;
}

interface Conversation {
  _id: string;
  channel: string;
  channelName?: string;
  displayName?: string;
  remoteJid: string;
  contactName?: string;
  contactPhone?: string;
  lastMessage: {
    body: string;
    type: string;
    timestamp: string;
    fromMe: boolean;
  };
  unreadCount: number;
  lastMessageAt: string;
}

interface Message {
  _id: string;
  metaMessageId?: string;
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

export default function MetaConversationPanel() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannelId, setSelectedChannelId] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingChannels, setIsLoadingChannels] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoadingChannels(true);
      const result = await getMetaChannels(1, 100, "");
      if (result?.status) {
        const active = result.data.channels.filter((c: Channel) => c.isActive);
        setChannels(active);
        if (active.length > 0) {
          setSelectedChannelId(active[0]._id);
        }
      }
      setIsLoadingChannels(false);
    };
    fetchChannels();
  }, []);

  useEffect(() => {
    if (!selectedChannelId) return;

    const fetchConversations = async () => {
      setIsLoadingConversations(true);
      const result = await getMetaConversations(selectedChannelId, 1, 50, "");
      if (result?.status) {
        setConversations(result.data.conversations || []);
      }
      setIsLoadingConversations(false);
    };
    fetchConversations();

    setSelectedConversation(null);
    setMessages([]);
  }, [selectedChannelId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!selectedChannelId) return;
    const socket = connectSocket();

    const handleConnect = () => {
      socket.emit("join:channel", { channelId: selectedChannelId });
    };

    const handleMessageNew = (data: {
      channelId: string;
      conversationId: string;
      message: any;
    }) => {
      if (data.channelId !== selectedChannelId) return;
      if (selectedConversation && data.conversationId === selectedConversation._id) {
        setMessages((prev) => {
          if (prev.some((m) => m.metaMessageId === data.message.metaMessageId)) return prev;
          return [...prev, data.message as Message];
        });
      }
    };

    const handleConversationUpdate = (data: {
      channelId: string;
      conversation: Conversation;
    }) => {
      if (data.channelId !== selectedChannelId) return;
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === data.conversation._id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...data.conversation };
          updated.sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
          );
          return updated;
        }
        return [data.conversation, ...prev].sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
        );
      });
    };

    socket.on("connect", handleConnect);
    socket.on("meta:message:new", handleMessageNew);
    socket.on("meta:conversation:update", handleConversationUpdate);

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("meta:message:new", handleMessageNew);
      socket.off("meta:conversation:update", handleConversationUpdate);
      socket.emit("leave:channel", { channelId: selectedChannelId });
    };
  }, [selectedChannelId, selectedConversation]);

  const handleSelectConversation = useCallback(async (conv: Conversation) => {
    setSelectedConversation(conv);
    setIsLoadingMessages(true);
    const result = await getMetaMessages(conv._id, 1, 200);
    if (result?.status) {
      setMessages(result.data.messages || []);
    }
    setIsLoadingMessages(false);
  }, []);

  const handleMessageSent = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.metaMessageId === message.metaMessageId)) return prev;
      return [...prev, message];
    });
  }, []);

  const handleMessageDeleted = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  }, []);

  const handleConversationDeleted = useCallback(
    (convId: string) => {
      setConversations((prev) => prev.filter((c) => c._id !== convId));
      if (selectedConversation?._id === convId) {
        setSelectedConversation(null);
        setMessages([]);
      }
    },
    [selectedConversation],
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteMetaConversation(deleteTarget._id);
    if (res?.status) {
      ToastMessage.success({ title: "Conversation deleted" });
      handleConversationDeleted(deleteTarget._id);
    } else {
      ToastMessage.error({ title: res?.message || "Failed to delete" });
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  const handleStartEdit = (conv: Conversation) => {
    setEditingId(conv._id);
    setEditValue(conv.displayName || conv.contactName || conv.contactPhone || conv.remoteJid);
  };

  const handleSaveEdit = async (convId: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    const res = await updateMetaConversationName(convId, trimmed);
    if (res?.status) {
      ToastMessage.success({ title: "Name updated" });
      const updated = res.data?.conversation;
      if (updated) {
        setConversations((prev) =>
          prev.map((c) => (c._id === updated._id ? { ...c, ...updated } : c)),
        );
        setSelectedConversation((prev) =>
          prev?._id === updated._id ? { ...prev, ...updated } : prev,
        );
      }
    } else {
      ToastMessage.error({ title: res?.message || "Failed to update name" });
    }
    setEditingId(null);
  };

  if (isLoadingChannels) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">Loading...</CardContent>
      </Card>
    );
  }

  if (channels.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            No active Meta channels. Add and verify a channel in the Meta Connection tab first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-12rem)]">
      <div className="w-64">
        <Select value={selectedChannelId} onValueChange={setSelectedChannelId}>
          <SelectTrigger>
            <SelectValue placeholder="Select channel" />
          </SelectTrigger>
          <SelectContent>
            {channels.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="w-80 shrink-0 overflow-y-auto">
          <Card className="h-full overflow-hidden">
            <CardContent className="p-0 h-full overflow-y-auto divide-y">
              {isLoadingConversations ? (
                <div className="flex items-center justify-center h-full p-6">
                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-6">
                  <MessageSquare className="size-8 text-muted-foreground mb-2" />
                  <p className="text-xs text-muted-foreground">No conversations</p>
                </div>
              ) : (
                conversations.map((conv) => {
                  const isSelected = conv._id === selectedConversation?._id;
                  const contactDisplay =
                    conv.contactName || conv.contactPhone || conv.remoteJid;
                  return (
                    <div key={conv._id} className="group relative">
                      <div
                        onClick={() => handleSelectConversation(conv)}
                        className={`flex items-center gap-3 p-3 transition-colors cursor-pointer ${
                          isSelected ? "bg-primary/10" : "hover:bg-muted/50"
                        }`}
                      >
                        <Avatar className="size-10 shrink-0">
                          <AvatarFallback>
                            <User className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            {editingId === conv._id ? (
                              <div className="flex items-center gap-1 flex-1 mr-2">
                                <input
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") handleSaveEdit(conv._id);
                                    if (e.key === "Escape") setEditingId(null);
                                  }}
                                  className="flex h-7 text-sm py-1 px-2 rounded-md border border-input bg-transparent w-full"
                                  autoFocus
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveEdit(conv._id);
                                  }}
                                  className="size-6 rounded flex items-center justify-center hover:bg-primary/10 text-primary shrink-0"
                                >
                                  <Check className="size-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingId(null);
                                  }}
                                  className="size-6 rounded flex items-center justify-center hover:bg-muted shrink-0"
                                >
                                  <X className="size-3.5" />
                                </button>
                              </div>
                            ) : (
                              <p className="font-medium text-sm truncate">
                                {conv.displayName || contactDisplay}
                              </p>
                            )}
                            <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                              {conv.lastMessageAt
                                ? moment(conv.lastMessageAt).fromNow()
                                : ""}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground truncate mt-0.5">
                            {conv.lastMessage.fromMe && "You: "}
                            {conv.lastMessage.body ||
                              (conv.lastMessage.type !== "text"
                                ? `[${conv.lastMessage.type}]`
                                : "")}
                          </p>
                          {conv.channelName && (
                            <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5 flex items-center gap-1">
                              <span className="inline-block size-1.5 rounded-full bg-primary/60" />
                              {conv.channelName}
                            </p>
                          )}
                        </div>
                        {conv.unreadCount > 0 && (
                          <Badge className="rounded-full size-5 p-0 flex items-center justify-center text-[10px] shrink-0">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                      <div className="absolute top-1 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(conv);
                          }}
                          className="size-6 rounded-full bg-muted/80 flex items-center justify-center cursor-pointer hover:bg-muted"
                          title="Rename"
                        >
                          <Pencil className="size-3" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTarget(conv);
                          }}
                          className="size-6 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center cursor-pointer hover:bg-destructive"
                          title="Delete"
                        >
                          <Trash2 className="size-3 text-white" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          {!selectedConversation ? (
            <Card className="h-full">
              <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
                <MessageSquare className="size-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">
                  Select a conversation to view messages
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex flex-col overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b shrink-0">
                <Avatar className="size-9">
                  <AvatarFallback>
                    <User className="size-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-sm">
                    {selectedConversation.displayName ||
                     selectedConversation.contactName ||
                     selectedConversation.contactPhone ||
                     selectedConversation.remoteJid}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {channels.find((c) => c._id === selectedChannelId)?.name}
                    {" · "}
                    {selectedConversation.contactPhone || selectedConversation.remoteJid}
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
                    No messages yet. Send a message to start the conversation.
                  </div>
                ) : (
                  [...messages].reverse().map((msg) => (
                    <MetaMessageBubble
                      key={msg.metaMessageId || msg._id}
                      message={msg}
                      onDeleted={handleMessageDeleted}
                    />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="shrink-0">
                <MetaMessageInput
                  channelId={selectedChannelId}
                  remoteJid={selectedConversation.remoteJid}
                  onMessageSent={handleMessageSent}
                />
              </div>
            </Card>
          )}
        </div>
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
