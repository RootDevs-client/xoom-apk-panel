"use client";

import { updateCategory } from "@/actions/category/categoryActions";
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
import { Edit } from "lucide-react";
import { useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { type Category } from "./columns";

interface Props {
  row: Category;
  onSuccess: () => void;
}

export default function EditCategoryCell({ row, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(row.name);

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconRemoved, setIconRemoved] = useState(false);
  const [iconUploading, setIconUploading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let iconUrl: string | null | undefined = row.icon;

      if (iconRemoved) {
        iconUrl = null;
      } else if (iconFile) {
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

      const res = await updateCategory(row._id, {
        name: name.trim(),
        icon: iconUrl || undefined,
      });

      if (res?.status) {
        ToastMessage.success({
          title: res?.message || "Category updated successfully!",
        });
        setOpen(false);
        onSuccess();
      } else {
        setError(res?.message || "Failed to update category");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 cursor-pointer"
        onClick={() => {
          setName(row.name);
          setIconFile(null);
          setIconRemoved(false);
          setError("");
          setOpen(true);
        }}
      >
        <Edit className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        <DialogContent className="max-w-sm">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Category Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter category name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (error) setError("");
                  }}
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Category Icon</Label>
                <FileUploadComponent
                  accept="image"
                  maxSize={5}
                  maxFiles={1}
                  onFilesChange={(files) => setIconFile(files[0] || null)}
                  existingImageUrl={!iconRemoved ? row.icon || "" : ""}
                  onRemoveExisting={() => {
                    setIconRemoved(true);
                    setIconFile(null);
                  }}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || iconUploading}>
                {(loading || iconUploading) && (
                  <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />
                )}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
