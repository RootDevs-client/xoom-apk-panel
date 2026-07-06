"use client";

import { updateCategory } from "@/actions/category/categoryActions";
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
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ImSpinner9 } from "react-icons/im";
import { type Category } from "./columns";

interface Props {
  row: Category;
  onSuccess: () => void;
}

interface FormValues {
  name: string;
}

export default function EditCategoryCell({ row, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconRemoved, setIconRemoved] = useState(false);
  const [iconUploading, setIconUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: { name: row.name },
  });

  const { handleSubmit, setError, reset, formState } = form;

  useEffect(() => {
    if (open) {
      reset({ name: row.name });
    }
  }, [open, row.name, reset]);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const loadingId = ToastMessage.loading({ title: "Updating category..." });

    try {
      let iconUrl: string | null | undefined = row.icon;

      if (iconRemoved) {
        iconUrl = null;
      } else if (iconFile) {
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

      const res = await updateCategory(row._id, {
        name: data.name.trim(),
        icon: iconUrl,
      });

      if (res?.status) {
        ToastMessage.success(
          {
            title: res?.message || "Category updated successfully!",
          },
          { id: loadingId },
        );
        setOpen(false);
        onSuccess();
      } else {
        ToastMessage.error(
          {
            title: res?.message || "Failed to update category",
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
                <DialogTitle>Edit Category</DialogTitle>
              </DialogHeader>

              <div className="py-4 space-y-4">
                <InputField
                  name="name"
                  label="Category Name"
                  placeholder="Enter category name"
                  required
                />

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">Category Icon</Label>
                  <FileUploadComponent
                    accept="image"
                    maxSize={5}
                    maxFiles={1}
                    onFilesChange={(files) => setIconFile(files[0] || null)}
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
