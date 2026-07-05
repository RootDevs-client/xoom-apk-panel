"use client";

import { createPromotionMethod } from "@/actions/promotion-method/promotionMethodActions";
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
import { useState } from "react";
import { ImSpinner9 } from "react-icons/im";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function CreatePromotionMethodModal({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [operator, setOperator] = useState("");
  const [promotional, setPromotional] = useState(false);
  const [nonPromotional, setNonPromotional] = useState(false);
  const [isActive, setIsActive] = useState(true);
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
      const res = await createPromotionMethod({
        operator: operator.trim(),
        promotional,
        non_promotional: nonPromotional,
        is_active: isActive,
      });

      if (res?.status) {
        ToastMessage.success({
          title: res?.message || "Promotion method created successfully!",
        });
        setOperator("");
        setPromotional(false);
        setNonPromotional(false);
        setIsActive(true);
        onOpenChange(false);
        onSuccess();
      } else {
        setError(res?.message || "Failed to create promotion method");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent className="max-w-sm">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Promotion Method</DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="operator">Operator</Label>
              <Input
                id="operator"
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
              <Label htmlFor="promotional">Promotional</Label>
              <Switch
                id="promotional"
                checked={promotional}
                onCheckedChange={setPromotional}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="non-promotional">Non-Promotional</Label>
              <Switch
                id="non-promotional"
                checked={nonPromotional}
                onCheckedChange={setNonPromotional}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is-active">Active</Label>
              <Switch
                id="is-active"
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
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
