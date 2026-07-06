"use client";

import { updatePromotionMethod } from "@/actions/promotion-method/promotionMethodActions";
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
import { Edit } from "lucide-react";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { ImSpinner9 } from "react-icons/im";
import { type PromotionMethod } from "./columns";

interface Props {
  row: PromotionMethod;
  onSuccess: () => void;
}

interface FormValues {
  operator: string;
  is_active: boolean;
}

export default function EditPromotionMethodCell({ row, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const methods = useForm<FormValues>({
    defaultValues: {
      operator: row.operator,
      is_active: row.is_active,
    },
  });

  const handleSubmit = methods.handleSubmit(async (values) => {
    setLoading(true);
    setError("");
    const toastId = ToastMessage.loading({
      title: "Conversession updating...",
    });

    try {
      const res = await updatePromotionMethod(row._id, {
        operator: values.operator.trim(),
        is_active: values.is_active,
      });

      if (res?.status) {
        ToastMessage.success(
          {
            title: res?.message || "Promotion method updated successfully!",
          },
          { id: toastId },
        );
        setOpen(false);
        onSuccess();
      } else {
        ToastMessage.error(
          {
            title: res?.message || "Failed to update promotion method",
          },
          { id: toastId },
        );
      }
    } catch {
      ToastMessage.error(
        {
          title: "Failed to update promotion method",
        },
        { id: toastId },
      );
    } finally {
      setLoading(false);
    }
  });

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 cursor-pointer"
        onClick={() => {
          methods.reset({
            operator: row.operator,
            is_active: row.is_active,
          });
          setError("");
          setOpen(true);
        }}
      >
        <Edit className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        <DialogContent className="max-w-sm">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>Edit Conversession Name</DialogTitle>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <InputField
                    type="text"
                    label="Conversession name"
                    name="operator"
                    placeholder="Enter conversession name"
                    required
                  />
                </div>

                <div className="flex items-center justify-between bg-gray-100 px-4 py-3 rounded-md">
                  <Label
                    htmlFor="edit-is-active"
                    className="text-lg font-dm-sans font-medium block"
                  >
                    Active
                  </Label>
                  <Controller
                    control={methods.control}
                    name="is_active"
                    render={({ field }) => (
                      <Switch
                        id="edit-is-active"
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
                  onClick={() => setOpen(false)}
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
                  Save
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>
    </>
  );
}
