"use client";

import { createPromotion } from "@/actions/promotion/promotionActions";
import InputField from "@/components/form/InputField";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ImSpinner9 } from "react-icons/im";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormValues {
  operator: string;
}

export default function CreatePromotionModal({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: { operator: "" },
  });

  const { handleSubmit, setError, reset, formState } = form;

  const resetForm = () => {
    reset({ operator: "" });
    setIsActive(true);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const loadingToast = ToastMessage.loading({ title: "Creating promotion category..." });

    try {
      const res = await createPromotion({
        operator: data.operator.trim(),
        isActive,
      });

      if (res?.status) {
        ToastMessage.success(
          {
            title: res?.message || "Promotion category created successfully!",
          },
          { id: loadingToast },
        );
        resetForm();
        onOpenChange(false);
        onSuccess();
      } else {
        ToastMessage.error(
          {
            title: res?.message || "Failed to create promotion category",
          },
          { id: loadingToast },
        );
      }
    } catch {
      ToastMessage.error(
        {
          title: "Something went wrong",
        },
        { id: loadingToast },
      );
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
        <FormProvider {...form}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>Create Promotion Category</DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <InputField
                name="operator"
                label="Operator"
                placeholder="Enter operator name"
                required
              />

              <div className="flex items-center gap-2">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              {formState.errors.root && (
                <p className="text-sm text-red-500">
                  {formState.errors.root.message}
                </p>
              )}
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
              <Button
                type="submit"
                disabled={loading}
                className="text-white cursor-pointer"
              >
                {loading && (
                  <ImSpinner9 className="mr-2 h-3 w-3 animate-spin" />
                )}
                Create
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
