"use client";
import { updateTerms } from "@/actions/settings/settingsActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FileText, Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

interface TermsFormData {
  content: string;
}

export default function TermsSettings({ termsSettings }: any) {
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<TermsFormData>({
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    if (!termsSettings) return;
    reset({
      content: termsSettings.content || "",
    });
  }, [termsSettings, reset]);

  const onSubmit = async (data: TermsFormData) => {
    const loadingToast = ToastMessage.loading({
      title: "Updating terms & conditions...",
    });
    try {
      const result = await updateTerms(data);
      if (!result.status) {
        ToastMessage.error(
          { title: result?.message || "Failed to save terms & conditions" },
          { id: loadingToast },
        );
        return;
      }
      reset({ content: data.content });
      ToastMessage.success(
        { title: result?.message || "Terms & conditions updated!" },
        { id: loadingToast },
      );
    } catch {
      ToastMessage.error(
        { title: "Something went wrong." },
        { id: loadingToast },
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Terms &amp; Conditions
          </CardTitle>
          <CardDescription>
            Manage your app's terms and conditions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label>Terms &amp; Conditions</Label>
            <Controller
              name="content"
              control={control}
              render={({ field: { onChange, value } }) => (
                <RichTextEditor
                  value={value}
                  onChange={onChange}
                  placeholder="Enter your terms and conditions here..."
                />
              )}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="flex items-center gap-2 cursor-pointer text-white rounded-sm"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? "Updating..." : "Update Terms &amp; Conditions"}
        </Button>
      </div>
    </div>
  );
}
