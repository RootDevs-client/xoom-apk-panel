"use client";

import { updateCategory } from "@/actions/category/categoryActions";
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
import { Pencil } from "lucide-react";
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
      const res = await updateCategory(row._id, name.trim());

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
        size="sm"
        className="h-7 text-xs"
        onClick={() => {
          setName(row.name);
          setError("");
          setOpen(true);
        }}
      >
        <Pencil className="size-3" />
      </Button>

      <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        <DialogContent className="max-w-sm">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Edit Category</DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-3">
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
              <Button type="submit" disabled={loading}>
                {loading && (
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
