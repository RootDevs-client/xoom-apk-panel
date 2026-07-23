"use client";

import { useState, useRef } from "react";
import { sendWhatsAppMessage } from "@/actions/whatsapp/whatsappActions";
import { uploadFile } from "@/actions/fileUpload/fileUploadActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Button } from "@/components/ui/button";
import {
  Send,
  Loader2,
  Paperclip,
  Image,
  Video,
  FileText,
  Music,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  _id: string;
  keyId: string;
  fromMe: boolean;
  pushName?: string;
  body: string;
  type: string;
  status: string;
  timestamp: string;
  mediaUrl?: string;
  fileName?: string;
}

interface Props {
  sessionId: string;
  remoteJid: string;
  onMessageSent: (message: Message) => void;
}

type MediaType = "image" | "video" | "document" | "audio";

export default function MessageInput({
  sessionId,
  remoteJid,
  onMessageSent,
}: Props) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    file: File;
    preview?: string;
    type: MediaType;
  } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileType, setFileType] = useState<MediaType>("image");

  const handleSend = async () => {
    if (sending) return;
    const hasText = text.trim().length > 0;
    if (!hasText && !selectedFile) return;

    setSending(true);

    try {
      let mediaUrl: string | undefined;
      let mediaType: MediaType | undefined;
      let fileName: string | undefined;

      // Upload file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile.file);
        const uploadRes = await uploadFile(formData);
        if (!uploadRes?.status || !uploadRes.data?.url) {
          ToastMessage.error({
            title: "Failed to upload file",
          });
          setSending(false);
          return;
        }
        mediaUrl = uploadRes.data.url;
        mediaType = selectedFile.type;
        fileName = selectedFile.file.name;
      }

      const optimisticId = `opt_${Date.now()}`;
      const optimistic: Message = {
        _id: optimisticId,
        keyId: optimisticId,
        fromMe: true,
        body: text.trim(),
        type: mediaType ? `${mediaType}Message` : "conversation",
        status: "pending",
        timestamp: new Date().toISOString(),
        mediaUrl,
        fileName,
      };
      onMessageSent(optimistic);
      setText("");
      setSelectedFile(null);

      const result = await sendWhatsAppMessage({
        sessionId,
        remoteJid,
        body: text.trim(),
        mediaType,
        mediaUrl,
        fileName,
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

  const triggerFilePicker = (type: MediaType) => {
    setFileType(type);
    // Set accept based on type
    if (fileInputRef.current) {
      fileInputRef.current.accept =
        type === "image"
          ? "image/*"
          : type === "video"
            ? "video/*"
            : type === "audio"
              ? "audio/*"
              : "*/*";
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview for images
    let preview: string | undefined;
    if (fileType === "image") {
      preview = URL.createObjectURL(file);
    }

    setSelectedFile({ file, preview, type: fileType });
    // Reset the input so the same file can be selected again
    e.target.value = "";
  };

  const clearSelectedFile = () => {
    if (selectedFile?.preview) {
      URL.revokeObjectURL(selectedFile.preview);
    }
    setSelectedFile(null);
  };

  const getFileIcon = (type: MediaType) => {
    switch (type) {
      case "image":
        return <Image className="size-4" />;
      case "video":
        return <Video className="size-4" />;
      case "audio":
        return <Music className="size-4" />;
      case "document":
        return <FileText className="size-4" />;
    }
  };

  return (
    <div className="flex flex-col">
      {/* File preview */}
      {selectedFile && (
        <div className="flex items-center gap-2 px-3 py-2 border-t bg-muted/30">
          <div className="relative size-10 shrink-0 rounded overflow-hidden bg-muted flex items-center justify-center">
            {selectedFile.preview ? (
              <img
                src={selectedFile.preview}
                alt="Preview"
                className="size-full object-cover"
              />
            ) : (
              getFileIcon(selectedFile.type)
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate flex-1">
            {selectedFile.file.name}
          </span>
          <button
            onClick={clearSelectedFile}
            className="size-5 rounded-full hover:bg-muted flex items-center justify-center cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </div>
      )}

      <div className="flex items-center gap-2 p-3 border-t">
        {/* Attachment button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full size-9 shrink-0 cursor-pointer"
              disabled={sending}
            >
              <Paperclip className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem
              onClick={() => triggerFilePicker("image")}
              className="cursor-pointer"
            >
              <Image className="size-4 mr-2" />
              Photo
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => triggerFilePicker("video")}
              className="cursor-pointer"
            >
              <Video className="size-4 mr-2" />
              Video
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => triggerFilePicker("document")}
              className="cursor-pointer"
            >
              <FileText className="size-4 mr-2" />
              Document
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => triggerFilePicker("audio")}
              className="cursor-pointer"
            >
              <Music className="size-4 mr-2" />
              Audio
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelected}
        />

        <input
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            selectedFile
              ? "Add a caption..."
              : "Type a message..."
          }
          disabled={sending}
          className="flex-1 h-9 rounded-full border border-input bg-transparent px-4 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50"
        />
        <Button
          size="icon"
          className="rounded-full size-9 shrink-0 text-white cursor-pointer"
          onClick={handleSend}
          disabled={(!text.trim() && !selectedFile) || sending}
        >
          {sending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
