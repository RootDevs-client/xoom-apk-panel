"use client";

import { updateGeneralSettings } from "@/actions/settings/settingsActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import InputField from "@/components/form/InputField";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Globe, Link, Save, ToggleLeft, Webhook } from "lucide-react";
import { useEffect } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";

interface GeneralFormData {
  companyName: string;
  supportEmail: string;
  companyAddress: string;
  ownerName: string;
  ownerEmail: string;
  webviewUrl: string;
  webhookUrl: string;
  universalSubscriptionApiUrl: string;
  xoomSportsUrl: string;
  manual_flow_enabled: boolean;
  web_view_enabled: boolean;
}

export default function GeneralSettings({ general }: any) {
  const methods = useForm<GeneralFormData>({
    defaultValues: {
      companyName: "",
      supportEmail: "",
      companyAddress: "",
      ownerName: "",
      ownerEmail: "",
      webviewUrl: "",
      webhookUrl: "",
      universalSubscriptionApiUrl: "",
      xoomSportsUrl: "",
      manual_flow_enabled: false,
      web_view_enabled: true,
    },
  });

  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { isSubmitting, errors },
  } = methods;

  // ── Populate form when data arrives ───────────────────────────────────────
  useEffect(() => {
    if (general) {
      reset({
        companyName: general.companyName || "",
        supportEmail: general.supportEmail || "",
        companyAddress: general.companyAddress || "",
        ownerName: general.ownerName || "",
        ownerEmail: general.ownerEmail || "",
        webviewUrl: general.webviewUrl || "",
        webhookUrl: general.webhookUrl || "",
        universalSubscriptionApiUrl: general.universalSubscriptionApiUrl || "",
        xoomSportsUrl: general.xoomSportsUrl || "",
        manual_flow_enabled: general.manual_flow_enabled ?? false,
        web_view_enabled: general.web_view_enabled ?? true,
      });
    }
  }, [general, reset]);

  // ── Submit ─────────────────────────────────────────────────────────────────
  const onSubmit = async (data: GeneralFormData) => {
    const loadingToast = ToastMessage.loading({
      title: "Updating general settings...",
    });
    try {
      const payload: GeneralFormData = {
        ...data,
        webviewUrl: data.webviewUrl?.trim() || "",
        webhookUrl: data.webhookUrl?.trim() || "",
        universalSubscriptionApiUrl: data.universalSubscriptionApiUrl?.trim() || "",
        xoomSportsUrl: data.xoomSportsUrl?.trim() || "",
      };

      const result = await updateGeneralSettings(payload);

      if (!result.status) {
        ToastMessage.error(
          { title: result?.message || "Failed to save general settings" },
          { id: loadingToast },
        );
        return;
      }

      ToastMessage.success(
        { title: result?.message || "General settings updated!" },
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
    <FormProvider {...methods}>
      <div className="space-y-6">
        {/* ── Company Information ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>
              Basic details about your organisation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="companyName"
                label="Company Name"
                placeholder="XoomSports Ltd."
                rules={{ required: "Required!" }}
              />
              <InputField
                name="supportEmail"
                label="Support Email"
                type="email"
                placeholder="support@xoomsports.com"
                rules={{
                  required: "Required!",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyAddress">Company Address</Label>
              <Textarea
                id="companyAddress"
                placeholder="Adabor, Dhaka 1207"
                rows={3}
                className="focus-visible:ring-primary"
                {...register("companyAddress")}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Owner Information ───────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle>Owner Information</CardTitle>
            <CardDescription>Primary account holder details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                name="ownerName"
                label="Owner Name"
                placeholder="Joynal Khan"
                rules={{ required: "Required!" }}
              />
              <InputField
                name="ownerEmail"
                label="Owner Email"
                type="email"
                placeholder="joynal@email.com"
                rules={{
                  required: "Required!",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* ── App URL Configuration ───────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              App URL Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-4 grid-cols-1">
              <div>
                <InputField
                  name="webviewUrl"
                  label="WebView URL"
                  placeholder="https://xoomsports.com"
                  prefix={<Globe size={16} />}
                  rules={{
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Must start with http:// or https://",
                    },
                  }}
                />
              </div>

              <div className="space-y-1">
                <InputField
                  name="webhookUrl"
                  label="Unsubscribe Webhook URL"
                  placeholder="https://your-system.com/api/webhook/unsubscribe"
                  prefix={<Webhook size={16} />}
                  rules={{
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Must start with http:// or https://",
                    },
                  }}
                />
              </div>

              <div className="space-y-1">
                <InputField
                  name="universalSubscriptionApiUrl"
                  label="Universal Subscription API URL"
                  placeholder="https://api.example.com/api/v1"
                  prefix={<Link size={16} />}
                  rules={{
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Must start with http:// or https://",
                    },
                  }}
                />
              </div>

              <div className="space-y-1">
                <InputField
                  name="xoomSportsUrl"
                  label="Xoom Sports Payment Gateway URL"
                  placeholder="https://backend.xoomsports.com"
                  prefix={<Link size={16} />}
                  rules={{
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Must start with http:// or https://",
                    },
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── App Flow Control ────────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ToggleLeft className="h-4 w-4 text-primary" />
              App Flow Control
            </CardTitle>
            <CardDescription>
              Toggle mobile app behaviour instantly — no app release required
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-0 divide-y">
            <div className="flex items-center justify-between py-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Manual flow</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  When ON, the app shows phone number and OTP input screens
                  instead of auto-detecting. Enable for Play Store review or
                  when auto-detection fails.
                </p>
              </div>
              <Controller
                name="manual_flow_enabled"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            <div className="flex items-center justify-between py-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium flex items-center gap-1.5">
                  Web View
                </p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  When enabled, content will open inside the app using a web
                  view. Turn it off to open links in your default browser.
                </p>
              </div>
              <Controller
                name="web_view_enabled"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
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
            {isSubmitting ? "Updating..." : "Update General Settings"}
          </Button>
        </div>
      </div>
    </FormProvider>
  );
}
