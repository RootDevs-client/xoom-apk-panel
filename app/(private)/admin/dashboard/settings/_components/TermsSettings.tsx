"use client";
import { updateGeneralSettings } from "@/actions/settings/settingsActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { FileText, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { SettingsCard } from "./SettingsCard";

interface TermsFormData {
  content: string;
}

export default function TermsSettings({ termsSettings }: any) {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<TermsFormData>({
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
      const result = await updateGeneralSettings({ termsOfService: data.content });
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
      <SettingsCard
        icon={FileText}
        title="Terms & Conditions"
        description="Manage your app's terms and conditions"
      >
        <div className="space-y-2">
          <Label
            htmlFor="terms-content"
            className="text-sm font-medium text-foreground"
          >
            Terms &amp; Conditions
          </Label>
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
      </SettingsCard>

      {/* ── Sticky save bar ─────────────────────────────────────────────────── */}
      <div className="sticky bottom-4 z-10">
        <div className="flex flex-col-reverse items-stretch justify-between gap-3 rounded-2xl border border-border/80 bg-card/95 px-5 py-4 shadow-lg shadow-primary/5 backdrop-blur sm:flex-row sm:items-center">
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">
              Terms &amp; Conditions
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
                Update Terms &amp; Conditions
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
