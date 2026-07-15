"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, User } from "lucide-react";
import moment from "moment-timezone";

interface Conversation {
  _id: string;
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

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  isLoading: boolean;
  onSelect: (conv: Conversation) => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  isLoading,
  onSelect,
}: Props) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  console.log("conversations", conversations);

  if (conversations.length === 0) {
    return (
      <Card className="h-full">
        <CardContent className="flex flex-col items-center justify-center h-full text-center p-6">
          <MessageSquare className="size-8 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">No conversations</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full overflow-hidden">
      <CardContent className="p-0 h-full overflow-y-auto divide-y">
        {conversations.map((conv) => {
          const isSelected = conv._id === selectedId;
          return (
            <div
              key={conv._id}
              onClick={() => onSelect(conv)}
              className={`flex items-center gap-3 p-3 transition-colors cursor-pointer ${
                isSelected ? "bg-primary/10" : "hover:bg-muted/50"
              }`}
            >
              <Avatar className="size-10 shrink-0">
                <AvatarImage src={conv.profilePicUrl} />
                <AvatarFallback>
                  <User className="size-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm truncate">
                    {conv.contactName ||
                      conv.contactPhone ||
                      conv.remoteJid.split("@")[0]}
                  </p>
                  <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                    {conv.lastMessageAt
                      ? moment(conv.lastMessageAt).fromNow()
                      : ""}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  {conv.lastMessage.fromMe && "You: "}
                  {conv.lastMessage.body ||
                    (conv.lastMessage.type !== "conversation"
                      ? `[${conv.lastMessage.type}]`
                      : "")}
                </p>
              </div>
              {conv.unreadCount > 0 && (
                <Badge className="rounded-full size-5 p-0 flex items-center justify-center text-[10px] shrink-0">
                  {conv.unreadCount}
                </Badge>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
