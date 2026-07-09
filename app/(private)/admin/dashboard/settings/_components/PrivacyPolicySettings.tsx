"use client";
import { updatePrivacyPolicy } from "@/actions/settings/settingsActions";
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
import { Save, Shield } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";

interface PrivacyFormData {
  content: string;
}

export default function PrivacyPolicySettings({ privacySettings }: any) {
  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<PrivacyFormData>({
    defaultValues: {
      content: "",
    },
  });

  useEffect(() => {
    if (!privacySettings) return;
    reset({
      content: privacySettings.content || "",
    });
  }, [privacySettings, reset]);

  const onSubmit = async (data: PrivacyFormData) => {
    const loadingToast = ToastMessage.loading({
      title: "Updating privacy policy...",
    });
    try {
      const result = await updatePrivacyPolicy(data);
      if (!result.status) {
        ToastMessage.error(
          { title: result?.message || "Failed to save privacy policy" },
          { id: loadingToast },
        );
        return;
      }
      reset({ content: data.content });
      ToastMessage.success(
        { title: result?.message || "Privacy policy updated!" },
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
            <Shield className="h-4 w-4 text-primary" />
            Privacy Policy
          </CardTitle>
          <CardDescription>
            Manage your app's privacy policy content
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <Label>Privacy Policy</Label>
            <Controller
              name="content"
              control={control}
              render={({ field: { onChange, value } }) => (
                <RichTextEditor
                  value={value}
                  onChange={onChange}
                  placeholder="Enter your privacy policy here..."
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
          {isSubmitting ? "Updating..." : "Update Privacy Policy"}
        </Button>
      </div>
    </div>
  );
}
