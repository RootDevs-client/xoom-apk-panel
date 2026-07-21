"use client";

import { deleteTelcoOperator } from "@/actions/telco-operator/telcoOperatorActions";
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
import { type TelcoOperator } from "./columns";

interface Props {
  row: TelcoOperator;
  onSuccess: () => void;
}

export default function DeleteTelcoOperatorCell({ row, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const res = await deleteTelcoOperator(row._id);

      if (res?.status) {
        ToastMessage.success({
          title: res?.message || "Operator deleted successfully!",
        });
        setOpen(false);
        onSuccess();
      } else {
        ToastMessage.error({
          title: res?.message || "Failed to delete operator",
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
        size="icon"
        className="h-8 w-8 cursor-pointer bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600"
        onClick={() => setOpen(true)}
      >
        <Trash2 className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Operator</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <span className="font-semibold text-foreground">
                {row.name}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Name</span>
              <span className="font-medium">{row.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Code</span>
              <span className="font-medium">{row.code}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Country</span>
              <span className="font-medium">{row.country}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active</span>
              <span>{row.is_active ? "Active" : "Inactive"}</span>
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
              {loading && <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
