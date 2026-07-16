"use client";

import {
  getWhatsAppConversations,
  getWhatsAppMessages,
  getWhatsAppSessions,
} from "@/actions/whatsapp/whatsappActions";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { connectSocket } from "@/lib/socket-client";
import { useCallback, useEffect, useState } from "react";
import ConversationList from "./ConversationList";
import ConversationThread from "./ConversationThread";

interface Session {
  _id: string;
  name: string;
  connectionStatus: string;
}

interface Conversation {
  _id: string;
  session: string;
  sessionName?: string;
  displayName?: string;
  remoteJid: string;
  contactName?: string;
  contactPhone?: string;
  profilePicUrl?: string;
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
  keyId: string;
  fromMe: boolean;
  pushName?: string;
  body: string;
  type: string;
  status: string;
  timestamp: string;
}

export default function ConversationPanel() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoadingSessions(true);
      const result = await getWhatsAppSessions(1, 100, "");
      console.log("result=====", result);
      if (result?.status) {
        const connected = result.data.sessions.filter(
          (s: Session) => s.connectionStatus === "connected",
        );
        setSessions(connected);
        if (connected.length > 0) {
          setSelectedSessionId(connected[0]._id);
        }
      }
      setIsLoadingSessions(false);
    };
    fetchSessions();
  }, []);

  useEffect(() => {
    if (!selectedSessionId) return;
    const fetchConversations = async () => {
      setIsLoadingConversations(true);
      const result = await getWhatsAppConversations(
        selectedSessionId,
        1,
        50,
        "",
      );
      if (result?.status) {
        setConversations(result.data.conversations || []);
      }
      setIsLoadingConversations(false);
    };
    fetchConversations();
    setSelectedConversation(null);
    setMessages([]);
  }, [selectedSessionId]);

  useEffect(() => {
    if (!selectedSessionId) return;

    const socket = connectSocket();

    const handleConnect = () => {
      socket.emit("join:session", { sessionId: selectedSessionId });
    };

    const handleConversationUpdate = (data: {
      sessionId: string;
      conversation: Conversation;
    }) => {
      if (data.sessionId !== selectedSessionId) return;
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c._id === data.conversation._id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], ...data.conversation };
          updated.sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime(),
          );
          return updated;
        }
        return [data.conversation, ...prev].sort(
          (a, b) =>
            new Date(b.lastMessageAt).getTime() -
            new Date(a.lastMessageAt).getTime(),
        );
      });
    };

    const handleLoggedOut = (data: { sessionId: string }) => {
      if (data.sessionId !== selectedSessionId) return;
      setConversations([]);
      setSelectedConversation(null);
      setMessages([]);
      ToastMessage.info({ title: "Channel logged out from WhatsApp" });
    };

    const handleConversationDeleted = (data: {
      sessionId: string;
      conversationId: string;
    }) => {
      if (data.sessionId !== selectedSessionId) return;
      setConversations((prev) => prev.filter((c) => c._id !== data.conversationId));
      setSelectedConversation((prev) =>
        prev?._id === data.conversationId ? null : prev,
      );
      if (data.conversationId === selectedConversation?._id) {
        setMessages([]);
      }
    };

    const handleMessageNew = (data: {
      sessionId: string;
      conversationId: string;
      message: any;
    }) => {
      if (data.sessionId !== selectedSessionId) return;
      if (
        selectedConversation &&
        data.conversationId === selectedConversation._id
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m.keyId === data.message.keyId)) return prev;
          return [...prev, data.message as Message];
        });
      }
    };

    socket.on("connect", handleConnect);
    socket.on("baileys:conversation:update", handleConversationUpdate);
    socket.on("baileys:conversation:deleted", handleConversationDeleted);
    socket.on("baileys:message:new", handleMessageNew);
    socket.on("baileys:loggedOut", handleLoggedOut);

    if (socket.connected) {
      handleConnect();
    } else {
      socket.connect();
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("baileys:conversation:update", handleConversationUpdate);
      socket.off("baileys:conversation:deleted", handleConversationDeleted);
      socket.off("baileys:message:new", handleMessageNew);
      socket.off("baileys:loggedOut", handleLoggedOut);
      socket.emit("leave:session", { sessionId: selectedSessionId });
    };
  }, [selectedSessionId, selectedConversation]);

  const handleSelectConversation = useCallback(async (conv: Conversation) => {
    setSelectedConversation(conv);
    setIsLoadingMessages(true);
    const result = await getWhatsAppMessages(1, 200, conv._id);
    if (result?.status) {
      setMessages(result.data.messages || []);
    }
    setIsLoadingMessages(false);
  }, []);

  const handleMessageSent = useCallback((message: Message) => {
    setMessages((prev) => {
      if (prev.some((m) => m.keyId === message.keyId)) return prev;
      return [...prev, message];
    });
  }, []);

  const handleMessageDeleted = useCallback((messageId: string) => {
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
  }, []);

  const handleConversationUpdated = useCallback(
    (updated: Conversation) => {
      setConversations((prev) =>
        prev.map((c) => (c._id === updated._id ? { ...c, ...updated } : c)),
      );
      setSelectedConversation((prev) =>
        prev?._id === updated._id ? { ...prev, ...updated } : prev,
      );
    },
    [],
  );

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

  if (isLoadingSessions) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading...
        </CardContent>
      </Card>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <p className="text-muted-foreground">
            No connected channels found. Connect a WhatsApp channel first.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-12rem)]">
      <div className="w-64">
        <Select value={selectedSessionId} onValueChange={setSelectedSessionId}>
          <SelectTrigger>
            <SelectValue placeholder="Select channel" />
          </SelectTrigger>
          <SelectContent>
            {sessions.map((s) => (
              <SelectItem key={s._id} value={s._id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4 flex-1 min-h-0">
        <div className="w-80 shrink-0">
          <ConversationList
            conversations={conversations}
            selectedId={selectedConversation?._id || null}
            isLoading={isLoadingConversations}
            onSelect={handleSelectConversation}
            onDeleted={handleConversationDeleted}
            onUpdated={handleConversationUpdated}
          />
        </div>

        <div className="flex-1">
          <ConversationThread
            sessionId={selectedSessionId}
            sessionName={
              sessions.find((s) => s._id === selectedSessionId)?.name
            }
            conversation={selectedConversation}
            messages={messages}
            isLoading={isLoadingMessages}
            onMessageSent={handleMessageSent}
            onMessageDeleted={handleMessageDeleted}
          />
        </div>
      </div>
    </div>
  );
}
