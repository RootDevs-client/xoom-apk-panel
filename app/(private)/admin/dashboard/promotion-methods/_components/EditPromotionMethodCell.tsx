"use client";

import { updatePromotionMethod } from "@/actions/promotion-method/promotionMethodActions";
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
import { Switch } from "@/components/ui/switch";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { ImSpinner9 } from "react-icons/im";
import { type PromotionMethod } from "./columns";

interface Props {
  row: PromotionMethod;
  onSuccess: () => void;
}

export default function EditPromotionMethodCell({ row, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [operator, setOperator] = useState(row.operator);
  const [promotional, setPromotional] = useState(row.promotional);
  const [nonPromotional, setNonPromotional] = useState(row.non_promotional);
  const [isActive, setIsActive] = useState(row.is_active);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!operator.trim()) {
      setError("Operator name is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await updatePromotionMethod(row._id, {
        operator: operator.trim(),
        promotional,
        non_promotional: nonPromotional,
        is_active: isActive,
      });

      if (res?.status) {
        ToastMessage.success({
          title: res?.message || "Promotion method updated successfully!",
        });
        setOpen(false);
        onSuccess();
      } else {
        setError(res?.message || "Failed to update promotion method");
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
          setOperator(row.operator);
          setPromotional(row.promotional);
          setNonPromotional(row.non_promotional);
          setIsActive(row.is_active);
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
              <DialogTitle>Edit Promotion Method</DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-operator">Operator</Label>
                <Input
                  id="edit-operator"
                  placeholder="Enter operator name"
                  value={operator}
                  onChange={(e) => {
                    setOperator(e.target.value);
                    if (error) setError("");
                  }}
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="edit-promotional">Promotional</Label>
                <Switch
                  id="edit-promotional"
                  checked={promotional}
                  onCheckedChange={setPromotional}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="edit-non-promotional">Non-Promotional</Label>
                <Switch
                  id="edit-non-promotional"
                  checked={nonPromotional}
                  onCheckedChange={setNonPromotional}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="edit-is-active">Active</Label>
                <Switch
                  id="edit-is-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
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
