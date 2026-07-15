"use client";

import { getWhatsAppConversations } from "@/actions/whatsapp/whatsappActions";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTableState } from "@/store/useTableStore";
import { useEffect, useState } from "react";
import moment from "moment-timezone";
import { MessageSquare, Phone, User } from "lucide-react";

interface Conversation {
  _id: string;
  session: string;
  sessionName?: string;
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

export default function MessageList() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setIsLoading(true);
        const result = await getWhatsAppConversations("", 1, 50, "");
        if (result?.status) {
          setConversations(result.data.conversations || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Loading conversations...
        </CardContent>
      </Card>
    );
  }

  if (conversations.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <MessageSquare className="size-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No conversations yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Messages from connected WhatsApp channels will appear here
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0 divide-y">
        {conversations.map((conv) => (
          <div
            key={conv._id}
            className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
          >
            <Avatar className="size-10">
              <AvatarImage src={conv.profilePicUrl} />
              <AvatarFallback>
                <User className="size-5" />
              </AvatarFallback>
            </Avatar>              <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm truncate">
                  {conv.contactName || conv.contactPhone || conv.remoteJid.split("@")[0]}
                </p>
                <span className="text-xs text-muted-foreground shrink-0">
                  {conv.lastMessageAt
                    ? moment(conv.lastMessageAt).fromNow()
                    : ""}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate mt-0.5">
                {conv.lastMessage.fromMe && "You: "}
                {conv.lastMessage.body || (conv.lastMessage.type !== "conversation" ? `[${conv.lastMessage.type}]` : "")}
              </p>
              {conv.sessionName && (
                <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5 flex items-center gap-1">
                  <span className="inline-block size-1.5 rounded-full bg-primary/60" />
                  {conv.sessionName}
                </p>
              )}
            </div>
            {conv.unreadCount > 0 && (
              <Badge className="rounded-full size-5 p-0 flex items-center justify-center text-[10px]">
                {conv.unreadCount}
              </Badge>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
