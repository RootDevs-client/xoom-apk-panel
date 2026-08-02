"use client";
import { updateGeneralSettings } from "@/actions/settings/settingsActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Loader2, Save, Shield } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { SettingsCard } from "./SettingsCard";

interface PrivacyFormData {
  content: string;
}

export default function PrivacyPolicySettings({ privacySettings }: any) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PrivacyFormData>({
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
      const result = await updateGeneralSettings({ privacyPolicy: data.content });
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
      <SettingsCard
        icon={Shield}
        title="Privacy Policy"
        description="Manage your app's privacy policy content"
      >
        <div className="space-y-2">
          <Label
            htmlFor="privacy-content"
            className="text-sm font-medium text-foreground"
          >
            Privacy Policy
          </Label>
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
      </SettingsCard>

      {/* ── Sticky save bar ─────────────────────────────────────────────────── */}
      <div className="sticky bottom-4 z-10">
        <div className="flex flex-col-reverse items-stretch justify-between gap-3 rounded-2xl border border-border/80 bg-card/95 px-5 py-4 shadow-lg shadow-primary/5 backdrop-blur sm:flex-row sm:items-center">
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">
              Privacy Policy
            </p>
            <p className="text-xs text-muted-foreground">
              Review and save your changes
            </p>
          </div>
          <Button
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            size="lg"
            className="w-full cursor-pointer rounded-xl bg-primary font-semibold shadow-sm transition-all duration-200 hover:-translate-y-px hover:bg-primary/90 hover:shadow-md disabled:hover:translate-y-0 disabled:hover:shadow-none sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Updating...
              </>
            ) : (
              <>
                <Save className="size-4" />
                Update Privacy Policy
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
