"use client";

import { createTopic } from "@/actions/topic/topicActions";
import FileUploadComponent from "@/components/custom/FileUploadComponent";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadSingleFile } from "@/lib/fileUpload";
import { useState } from "react";
import { ImSpinner9 } from "react-icons/im";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreateTopicModal({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [name, setName] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconUploading, setIconUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setIconFile(null);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Topic name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let iconUrl: string | undefined;

      if (iconFile) {
        setIconUploading(true);
        const uploaded = await uploadSingleFile(iconFile);
        if (uploaded?.url) {
          iconUrl = uploaded.url;
        } else {
          setError("Failed to upload icon");
          setLoading(false);
          setIconUploading(false);
          return;
        }
        setIconUploading(false);
      }

      const res = await createTopic({
        name: name.trim(),
        icon: iconUrl,
      });

      if (res?.status) {
        ToastMessage.success({
          title: res?.message || "Topic created successfully!",
        });
        resetForm();
        onOpenChange(false);
        onSuccess();
      } else {
        setError(res?.message || "Failed to create topic");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (loading) return;
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Topic</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Topic Name</Label>
              <Input
                id="name"
                placeholder="Enter topic name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError("");
                }}
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Topic Icon</Label>
              <FileUploadComponent
                accept="image"
                maxSize={5}
                maxFiles={1}
                onFilesChange={(files) => setIconFile(files[0] || null)}
              />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || iconUploading}>
              {(loading || iconUploading) && (
                <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
