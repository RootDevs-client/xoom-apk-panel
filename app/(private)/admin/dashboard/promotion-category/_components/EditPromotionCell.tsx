"use client";

import { updatePromotion } from "@/actions/promotion/promotionActions";
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
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ImSpinner9 } from "react-icons/im";
import { type PromotionCategory } from "./columns";

interface Props {
  row: PromotionCategory;
  onSuccess: () => void;
}

interface FormValues {
  operator: string;
}

export default function EditPromotionCell({ row, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [isActive, setIsActive] = useState(row.isActive);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: { operator: row.operator },
  });

  const { handleSubmit, setError, reset, formState } = form;

  useEffect(() => {
    if (open) {
      reset({ operator: row.operator });
      setIsActive(row.isActive);
    }
  }, [open, row.operator, row.isActive, reset]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const loadingId = ToastMessage.loading({ title: "Updating promotion category..." });

    try {
      const res = await updatePromotion(row._id, {
        operator: data.operator.trim(),
        isActive,
      });

      if (res?.status) {
        ToastMessage.success(
          {
            title: res?.message || "Promotion category updated successfully!",
          },
          { id: loadingId },
        );
        setOpen(false);
        onSuccess();
      } else {
        ToastMessage.error(
          {
            title: res?.message || "Failed to update promotion category",
          },
          { id: loadingId },
        );
      }
    } catch {
      ToastMessage.error(
        {
          title: "Something went wrong",
        },
        { id: loadingId },
      );
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
        onClick={() => setOpen(true)}
      >
        <Edit className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={(v) => !loading && setOpen(v)}>
        <DialogContent className="max-w-sm">
          <FormProvider {...form}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <DialogHeader>
                <DialogTitle>Edit Promotion Category</DialogTitle>
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
