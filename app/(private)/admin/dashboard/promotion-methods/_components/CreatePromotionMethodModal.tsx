"use client";

import { createPromotionMethod } from "@/actions/promotion-method/promotionMethodActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import InputField from "@/components/form/InputField";
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
import { Controller, FormProvider, useForm } from "react-hook-form";
import { ImSpinner9 } from "react-icons/im";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormValues {
  operator: string;
  is_active: boolean;
}

export default function CreatePromotionMethodModal({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const methods = useForm<FormValues>({
    defaultValues: {
      operator: "",
      is_active: true,
    },
  });

  const handleSubmit = methods.handleSubmit(async (values) => {
    setLoading(true);
    setError("");

    try {
      const res = await createPromotionMethod({
        operator: values.operator.trim(),
        is_active: values.is_active,
      });

      if (res?.status) {
        ToastMessage.success({
          title: res?.message || "Promotion method created successfully!",
        });
        methods.reset();
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
  });

  return (
    <Dialog open={open} onOpenChange={(v) => !loading && onOpenChange(v)}>
      <DialogContent className="max-w-sm">
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Add Conversion</DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-4">
                <InputField
                  type="text"
                  label="Conversion name"
                  name="operator"
                  placeholder="Enter conversion name"
                  required
                />
              </div>
              <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-md">
                <Label
                  htmlFor="is-active"
                  className="text-lg font-dm-sans font-medium block"
                >
                  Active
                </Label>
                <Controller
                  control={methods.control}
                  name="is_active"
                  render={({ field }) => (
                    <Switch
                      id="is-active"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
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
