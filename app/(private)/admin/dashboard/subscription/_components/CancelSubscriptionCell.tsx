"use client";

import { cancelSubscription } from "@/actions/subscribe/subscribeActions";
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
import { useTableStore } from "@/store/useTableStore";
import { useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { type Subscribe } from "./columns";

interface Props {
  row: Subscribe;
}

export function CancelSubscriptionCell({ row }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const handleRefresh = useTableStore((s) => s.handleRefresh);

  if (!row.status) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const res = await cancelSubscription(row._id);
      if (res?.ok) {
        ToastMessage.success("Subscription cancelled successfully!");
        setOpen(false);
        handleRefresh("subscribe");
      } else {
        ToastMessage.error(res?.message || "Failed to cancel subscription");
      }
    } catch {
      ToastMessage.error("Something went wrong");
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
        Cancel Sub
      </Button>

      <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              This will unsubscribe{" "}
              <span className="font-semibold text-foreground">{row.phone}</span>{" "}
              from the external service and mark them inactive in the database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-1.5 rounded-lg border bg-muted/40 px-4 py-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Phone</span>
              <span className="font-medium">{row.phone}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Platform</span>
              <span className="font-medium">{row.platform || "—"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Reference</span>
              <span className="max-w-40 truncate font-mono text-xs">
                {row.reference}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Keep Active
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading && (
                <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />
              )}
              Confirm Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
