"use client";

import { createPromotion } from "@/actions/promotion/promotionActions";
import FileUploadComponent from "@/components/custom/FileUploadComponent";
import InputField from "@/components/form/InputField";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { uploadSingleFile } from "@/lib/fileUpload";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ImSpinner9 } from "react-icons/im";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const generateSlug = (text: string) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

interface FormValues {
  name: string;
  slug: string;
}

export default function CreatePromotionModal({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconUploading, setIconUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const slugManuallyEdited = useRef(false);

  const form = useForm<FormValues>({
    defaultValues: { name: "", slug: "" },
  });

  const { handleSubmit, setError, reset, formState, register, watch, setValue } = form;

  const nameValue = watch("name");

  useEffect(() => {
    if (!slugManuallyEdited.current && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, setValue]);

  const resetForm = () => {
    setIconFile(null);
    slugManuallyEdited.current = false;
    reset({ name: "", slug: "" });
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const loadingToast = ToastMessage.loading({ title: "Creating promotion category..." });

    try {
      let iconUrl: string | undefined;

      if (iconFile) {
        setIconUploading(true);
        const uploaded = await uploadSingleFile(iconFile);
        if (uploaded?.url) {
          iconUrl = uploaded.url;
        } else {
          setError("root", { message: "Failed to upload icon" });
          setLoading(false);
          setIconUploading(false);
          return;
        }
        setIconUploading(false);
      }

      const res = await createPromotion({
        name: data.name.trim(),
        slug: data.slug.trim() || generateSlug(data.name),
        icon: iconUrl || "",
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
      setIconUploading(false);
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
                name="name"
                label="Category Name"
                placeholder="Enter category name"
                required
              />

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Slug</Label>
                <Input
                  defaultValue=""
                  placeholder="Auto-generated from name"
                  {...register("slug", {
                    onChange: () => { slugManuallyEdited.current = true; },
                  })}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Category Icon</Label>
                <FileUploadComponent
                  accept="image"
                  maxSize={5}
                  maxFiles={1}
                  onFilesChange={(files) => setIconFile(files[0] || null)}
                />
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
                disabled={loading || iconUploading}
                className="text-white cursor-pointer"
              >
                {(loading || iconUploading) && (
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
