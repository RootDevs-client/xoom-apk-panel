"use client";

import {
  deleteWhatsAppConversation,
  updateWhatsAppConversationName,
} from "@/actions/whatsapp/whatsappActions";
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
import { Input } from "@/components/ui/input";
import { Check, Loader2, MessageSquare, Pencil, Trash2, User, X } from "lucide-react";
import moment from "moment-timezone";
import { useState } from "react";

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

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  isLoading: boolean;
  onSelect: (conv: Conversation) => void;
  onDeleted: (convId: string) => void;
  onUpdated?: (conv: Conversation) => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  isLoading,
  onSelect,
  onDeleted,
  onUpdated,
}: Props) {
  const [deleteTarget, setDeleteTarget] = useState<Conversation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

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

  const handleStartEdit = (conv: Conversation) => {
    setEditingId(conv._id);
    setEditValue(conv.displayName || conv.contactName || conv.contactPhone || conv.remoteJid.split("@")[0]);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const handleSaveEdit = async (convId: string) => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    const res = await updateWhatsAppConversationName(convId, trimmed);
    if (res?.status) {
      ToastMessage.success({ title: "Name updated" });
      onUpdated?.(res.data?.conversation);
    } else {
      ToastMessage.error({ title: res?.message || "Failed to update name" });
    }
    setEditingId(null);
    setEditValue("");
  };

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
                      {editingId === conv._id ? (
                        <div className="flex items-center gap-1 flex-1 mr-2">
                          <Input
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSaveEdit(conv._id);
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            className="h-7 text-sm py-1 px-2"
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
                              handleCancelEdit();
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
                {/* Edit and Delete buttons on hover */}
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
                    title="Delete conversation"
                  >
                    <Trash2 className="size-3 text-white" />
                  </button>
                </div>
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
