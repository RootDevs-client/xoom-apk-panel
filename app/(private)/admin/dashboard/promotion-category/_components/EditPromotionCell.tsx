"use client";

import { updatePromotion } from "@/actions/promotion/promotionActions";
import FileUploadComponent from "@/components/custom/FileUploadComponent";
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
import { uploadSingleFile } from "@/lib/fileUpload";
import { Edit } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ImSpinner9 } from "react-icons/im";
import { Input } from "@/components/ui/input";
import { type PromotionCategory } from "./columns";

interface Props {
  row: PromotionCategory;
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

export default function EditPromotionCell({ row, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconRemoved, setIconRemoved] = useState(false);
  const [iconUploading, setIconUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const slugManuallyEdited = useRef(false);

  const form = useForm<FormValues>({
    defaultValues: { name: row.name, slug: row.slug },
  });

  const { handleSubmit, setError, reset, formState, register, watch, setValue } = form;

  const nameValue = watch("name");

  useEffect(() => {
    if (open) {
      slugManuallyEdited.current = false;
      reset({ name: row.name, slug: row.slug });
    }
  }, [open, row.name, row.slug, reset]);

  useEffect(() => {
    if (!slugManuallyEdited.current && nameValue) {
      setValue("slug", generateSlug(nameValue));
    }
  }, [nameValue, setValue]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const loadingId = ToastMessage.loading({ title: "Updating promotion category..." });

    try {
      let iconUrl: string | null | undefined;

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
      } else if (iconRemoved) {
        iconUrl = null;
      } else {
        iconUrl = row.icon;
      }

      const res = await updatePromotion(row._id, {
        name: data.name.trim(),
        slug: data.slug.trim() || generateSlug(data.name),
        icon: iconUrl,
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
      setIconUploading(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 cursor-pointer"
        onClick={() => {
          setIconFile(null);
          setIconRemoved(false);
          setOpen(true);
        }}
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
                  name="name"
                  label="Category Name"
                  placeholder="Enter category name"
                  required
                />

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Slug</Label>
                  <Input
                    defaultValue={row.slug}
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
                    onFilesChange={(files) => {
                      setIconFile(files[0] || null);
                      if (files.length > 0) setIconRemoved(false);
                    }}
                    existingImageUrl={!iconRemoved ? row.icon || "" : ""}
                    onRemoveExisting={() => {
                      setIconRemoved(true);
                      setIconFile(null);
                    }}
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
                  onClick={() => setOpen(false)}
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
