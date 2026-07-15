"use client";

import { useState, useEffect, useCallback } from "react";
import { getWhatsAppSessions } from "@/actions/whatsapp/whatsappActions";
import { getWhatsAppConversations, getWhatsAppMessages } from "@/actions/whatsapp/whatsappActions";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ConversationList from "./ConversationList";
import ConversationThread from "./ConversationThread";

interface Session {
  _id: string;
  name: string;
  connectionStatus: string;
}

interface Conversation {
  _id: string;
  remoteJid: string;
  contactName?: string;
  contactPhone?: string;
  profilePicUrl?: string;
  lastMessage: { body: string; type: string; timestamp: string; fromMe: boolean };
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
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoadingSessions(true);
      const result = await getWhatsAppSessions(1, 100, "");
      if (result?.status) {
        const connected = result.data.sessions.filter(
          (s: Session) => s.connectionStatus === "connected"
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
      const result = await getWhatsAppConversations(selectedSessionId, 1, 50, "");
      if (result?.status) {
        setConversations(result.data.conversations || []);
      }
      setIsLoadingConversations(false);
    };
    fetchConversations();
    setSelectedConversation(null);
    setMessages([]);
  }, [selectedSessionId]);

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
    setMessages((prev) => [...prev, message]);
  }, []);

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
        <Select
          value={selectedSessionId}
          onValueChange={setSelectedSessionId}
        >
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
          />
        </div>

        <div className="flex-1">
          <ConversationThread
            sessionId={selectedSessionId}
            conversation={selectedConversation}
            messages={messages}
            isLoading={isLoadingMessages}
            onMessageSent={handleMessageSent}
          />
        </div>
      </div>
    </div>
  );
}
