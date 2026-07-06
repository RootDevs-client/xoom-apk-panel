"use client";

import { createTopic } from "@/actions/topic/topicActions";
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
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { ImSpinner9 } from "react-icons/im";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface FormValues {
  name: string;
}

export default function CreateTopicModal({
  open,
  onOpenChange,
  onSuccess,
}: Props) {
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconUploading, setIconUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    defaultValues: { name: "" },
  });

  const { handleSubmit, setError, reset, formState } = form;

  const resetForm = () => {
    setIconFile(null);
    reset({ name: "" });
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const loadingToast = ToastMessage.loading({ title: "Creating topic..." });

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

      const res = await createTopic({
        name: data.name.trim(),
        icon: iconUrl,
      });

      if (res?.status) {
        ToastMessage.success(
          {
            title: res?.message || "Topic created successfully!",
          },
          { id: loadingToast },
        );
        resetForm();
        onOpenChange(false);
        onSuccess();
      } else {
        ToastMessage.error(
          {
            title: res?.message || "Failed to create topic",
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
              <DialogTitle>Create Topic</DialogTitle>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <InputField
                name="name"
                label="Topic Name"
                required
                placeholder="Enter topic name"
              />

              <div className="space-y-1.5">
                <Label className="text-sm font-medium">Topic Icon</Label>
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
