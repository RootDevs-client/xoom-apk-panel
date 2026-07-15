"use client";

import { deleteWhatsAppConversation } from "@/actions/whatsapp/whatsappActions";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, Trash2, User } from "lucide-react";
import moment from "moment-timezone";
import { useState } from "react";

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

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  isLoading: boolean;
  onSelect: (conv: Conversation) => void;
  onDeleted: (convId: string) => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  isLoading,
  onSelect,
  onDeleted,
}: Props) {
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

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

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    const res = await deleteWhatsAppConversation(deleteTarget._id);
    if (res?.status) {
      ToastMessage.success({ title: "Conversation deleted" });
      onDeleted(deleteTarget._id);
    } else {
      ToastMessage.error({
        title: res?.message || "Failed to delete conversation",
      });
    }
    setIsDeleting(false);
    setDeleteTarget(null);
  };

  return (
    <>
      <Card className="h-full overflow-hidden">
        <CardContent className="p-0 h-full overflow-y-auto divide-y">
          {conversations.map((conv) => {
            const isSelected = conv._id === selectedId;
            const contactDisplay =
              conv.contactName ||
              conv.contactPhone ||
              conv.remoteJid.split("@")[0];
            return (
              <div key={conv._id} className="group relative">
                <div
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
                        {contactDisplay}
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
                    {conv.sessionName && (
                      <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5 flex items-center gap-1">
                        <span className="inline-block size-1.5 rounded-full bg-primary/60" />
                        {conv.sessionName}
                      </p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <Badge className="rounded-full size-5 p-0 flex items-center justify-center text-[10px] shrink-0">
                      {conv.unreadCount}
                    </Badge>
                  )}
                </div>
                {/* Delete button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteTarget(conv);
                  }}
                  className="absolute top-1 right-2 size-6 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 hover:bg-destructive"
                  title="Delete conversation"
                >
                  <Trash2 className="size-3 text-white" />
                </button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this conversation and all its
              messages. This action cannot be undone.
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
    </>
  );
}
