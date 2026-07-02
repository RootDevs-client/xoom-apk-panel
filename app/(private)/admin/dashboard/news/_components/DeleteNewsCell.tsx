"use client";

import { deleteNews } from "@/actions/news/newsActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { type NewsItem } from "./columns";

interface Props {
  row: NewsItem;
  onSuccess: () => void;
}

export default function DeleteNewsCell({ row, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const res = await deleteNews(row._id);

      if (res?.status) {
        ToastMessage.success({
          title: res?.message || "News deleted successfully!",
        });
        setOpen(false);
        onSuccess();
      } else {
        ToastMessage.error({
          title: res?.message || "Failed to delete news",
        });
      }
    } catch {
      ToastMessage.error({ title: "Something went wrong" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="h-7 border-red-200 text-xs text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-3" />
      </Button>

      <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete News</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {row.title}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Title</span>
              <span className="font-medium max-w-48 truncate">
                {row.title}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Published</span>
              <span className="font-mono text-xs">
                {new Date(row.publishedDate).toLocaleDateString()}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading && (
                <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
