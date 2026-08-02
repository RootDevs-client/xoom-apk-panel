"use client";
import { updateGeneralSettings } from "@/actions/settings/settingsActions";
import { ToastMessage } from "@/components/custom/ToastMessage";
import InputField from "@/components/form/InputField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadSingleFile } from "@/lib/fileUpload";
import {
  Building2,
  Globe,
  KeyRound,
  Link,
  Loader2,
  Save,
  Smartphone,
  ToggleLeft,
  UserRound,
  Webhook,
} from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { AppBrandingCard } from "./AppBrandingCard";
import { GalleryCard } from "./GalleryCard";
import { SettingsCard } from "./SettingsCard";
import ToggleRow from "./ToggleRow";
import { GalleryItem, GallerySlot, GeneralFormData } from "./types";

function emptySlot(index: number): GallerySlot {
  return {
    title: `Gallery ${index + 1}`,
    existingUrl: "",
    newFile: null,
    removedExisting: false,
  };
}

const inputClassName =
  "h-12 rounded-xl border-border/80 bg-background/50 font-normal tracking-normal shadow-none !focus-visible:ring-primary/25 focus-visible:ring-2 transition-shadow focus-visible:shadow-sm";

// ─── Component ────────────────────────────────────────────────────────────────
export default function GeneralSettings({ general }: any) {
  // ── App logo ────────────────────────────────────────────────────────────────
  const [logoFile, setLogoFile] = useState<File[]>([]);
  const [logoError, setLogoError] = useState<string>("");
  const [logoRemoved, setLogoRemoved] = useState(false);
  const [bgFile, setBgFile] = useState<File[]>([]);
  const [bgRemoved, setBgRemoved] = useState(false);
  // ── Gallery slots ───────────────────────────────────────────────────────────
  const [gallerySlots, setGallerySlots] = useState<GallerySlot[]>([]);
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
      geminiApiKey: "",
      telcoProviderWebhookUrl: "",
      manual_flow_enabled: false,
      web_view_enabled: true,
      appLogo: "",
      appName: "",
      aboutUs: "",
      offerTitle: "",
      offerDescription: "",
      galleries: [],
      backgroundImage: "",
    },
  });
  const {
    handleSubmit,
    register,
    reset,
    control,
    formState: { isSubmitting },
  } = methods;
  // ── useFieldArray for galleries ─────────────────────────────────────────────
  const {
    fields: galleryFields,
    append: appendGallery,
    remove: removeGallery,
  } = useFieldArray({
    control,
    name: "galleries",
  });
  // ── Populate when server data arrives ───────────────────────────────────────
  useEffect(() => {
    if (!general) return;
    reset({
      companyName: general.companyName || "",
      supportEmail: general.supportEmail || "",
      companyAddress: general.companyAddress || "",
      ownerName: general.ownerName || "",
      ownerEmail: general.ownerEmail || "",
      webviewUrl: general.webviewUrl || "",
      webhookUrl: general.webhookUrl || "",
      manual_flow_enabled: general.manual_flow_enabled ?? false,
      web_view_enabled: general.web_view_enabled ?? true,
      appLogo: general.appLogo || "",
      appName: general.appName || "",
      aboutUs: general.aboutUs || "",
      offerTitle: general.offerTitle || "",
      offerDescription: general.offerDescription || "",
      galleries: general.galleries || [],
      backgroundImage: general.backgroundImage || "",
      universalSubscriptionApiUrl: general.universalSubscriptionApiUrl || "",
      xoomSportsUrl: general.xoomSportsUrl || "",
      geminiApiKey: general.geminiApiKey || "",
      telcoProviderWebhookUrl: general.telcoProviderWebhookUrl || "",
    });
    // Hydrate gallery slots from server data (one slot per existing gallery item)
    const serverGalleries: GalleryItem[] = general.galleries || [];
    setGallerySlots(
      serverGalleries.map((g, i) => ({
        title: g.title || `Gallery ${i + 1}`,
        existingUrl: g.url || "",
        newFile: null,
        removedExisting: false,
      })),
    );
  }, [general, reset]);

  // ── Gallery slot helpers ────────────────────────────────────────────────────
  const updateSlotTitle = (index: number, title: string) => {
    setGallerySlots((prev) =>
      prev.map((s, i) => (i === index ? { ...s, title } : s)),
    );
  };
  const updateSlotFile = (index: number, files: File[]) => {
    setGallerySlots((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, newFile: files[0] ?? null } : s,
      ),
    );
  };
  const removeSlotExisting = (index: number) => {
    setGallerySlots((prev) =>
      prev.map((s, i) =>
        i === index ? { ...s, existingUrl: "", removedExisting: true } : s,
      ),
    );
  };
  // Add a new empty gallery slot/field
  const addGallerySlot = () => {
    const newIndex = galleryFields.length;
    appendGallery({ title: `Gallery ${newIndex + 1}`, url: "" });
    setGallerySlots((prev) => [...prev, emptySlot(newIndex)]);
  };
  // Remove a gallery slot/field entirely
  const removeGallerySlot = (index: number) => {
    removeGallery(index);
    setGallerySlots((prev) => prev.filter((_, i) => i !== index));
  };
  // ── Submit ──────────────────────────────────────────────────────────────────
  const onSubmit = async (data: GeneralFormData) => {
    const hasExistingLogo = general?.appLogo && !logoRemoved;
    const hasNewLogo = logoFile.length > 0;
    if (!hasExistingLogo && !hasNewLogo) {
      setLogoError("App logo is required");
      return;
    }
    const loadingToast = ToastMessage.loading({
      title: "Updating general settings...",
    });
    try {
      // ── 1. Upload app logo if changed ──────────────────────────────────────
      let appLogoUrl: string = general?.appLogo || "";
      if (hasNewLogo && logoFile[0]) {
        ToastMessage.loading(
          { title: "Uploading app logo..." },
          { id: loadingToast },
        );
        const result = await uploadSingleFile(logoFile[0]);
        if (!result) {
          ToastMessage.error(
            { title: "Failed to upload app logo. Please try again." },
            { id: loadingToast },
          );
          return;
        }
        appLogoUrl = result.imageId; // full S3 URL or relative path from util
      }
      // ── 2. Resolve gallery slots ───────────────────────────────────────────
      // For each slot: upload new file if present, keep existing URL otherwise,
      // skip slot if no image at all.
      const resolvedGalleries: GalleryItem[] = [];
      for (let i = 0; i < gallerySlots.length; i++) {
        const slot = gallerySlots[i];
        if (slot.newFile) {
          // Upload the new file
          const upload = await uploadSingleFile(slot.newFile);
          if (upload?.imageId) {
            resolvedGalleries.push({
              title: slot.title || `Gallery ${i + 1}`,
              url: upload.imageId,
            });
          }
        } else if (slot.existingUrl && !slot.removedExisting) {
          // Keep the existing image
          resolvedGalleries.push({
            title: slot.title || `Gallery ${i + 1}`,
            url: slot.existingUrl,
          });
        }
        // If neither — slot is empty, omit it from the payload
      }
      // ── 2b. Upload background image if changed ────────────────────────────
      let backgroundImageUrl: string = general?.backgroundImage || "";
      if (bgFile.length > 0 && bgFile[0]) {
        const bgResult = await uploadSingleFile(bgFile[0]);
        if (!bgResult) {
          ToastMessage.error(
            { title: "Failed to upload background image. Please try again." },
            { id: loadingToast },
          );
          return;
        }
        backgroundImageUrl = bgResult.url;
      } else if (bgRemoved) {
        backgroundImageUrl = "";
      }
      // ── 3. Build & send payload ────────────────────────────────────────────
      ToastMessage.loading(
        { title: "Saving settings..." },
        { id: loadingToast },
      );
      const payload: GeneralFormData = {
        ...data,
        webviewUrl: data.webviewUrl?.trim() || "",
        webhookUrl: data.webhookUrl?.trim() || "",
        appLogo: appLogoUrl,
        galleries: resolvedGalleries,
        backgroundImage: backgroundImageUrl,
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
      window.dispatchEvent(new CustomEvent("settings-updated"));
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
        {/* ── App Branding ─────────────────────────────────────────────────── */}
        <AppBrandingCard
          general={general}
          register={register}
          logoError={logoError}
          logoRemoved={logoRemoved}
          bgRemoved={bgRemoved}
          setLogoFile={setLogoFile}
          setLogoError={setLogoError}
          setLogoRemoved={setLogoRemoved}
          setBgFile={setBgFile}
          setBgRemoved={setBgRemoved}
        />
        {/* ── Gallery ──────────────────────────────────────────────────────── */}
        <GalleryCard
          galleryFields={galleryFields}
          gallerySlots={gallerySlots}
          addGallerySlot={addGallerySlot}
          removeGallerySlot={removeGallerySlot}
          updateSlotTitle={updateSlotTitle}
          updateSlotFile={updateSlotFile}
          removeSlotExisting={removeSlotExisting}
        />
        {/* ── Company Information ───────────────────────────────────────────── */}
        <SettingsCard
          icon={Building2}
          title="Company Information"
          description="Basic details about your organisation"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <InputField
                name="companyName"
                label="Company Name"
                placeholder="XoomSports Ltd."
                rules={{ required: "Required!" }}
                className={inputClassName}
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
                className={inputClassName}
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="companyAddress"
                className="text-sm font-medium text-foreground"
              >
                Company Address
              </Label>
              <Textarea
                id="companyAddress"
                placeholder="Adabor, Dhaka 1207"
                rows={3}
                className="min-h-[6.5rem] rounded-xl border-border/80 bg-background/50 text-base font-normal shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 md:text-sm"
                {...register("companyAddress")}
              />
            </div>
          </div>
        </SettingsCard>
        {/* ── Owner Information ─────────────────────────────────────────────── */}
        <SettingsCard
          icon={UserRound}
          title="Owner Information"
          description="Primary account holder details"
        >
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <InputField
              name="ownerName"
              label="Owner Name"
              placeholder="Joynal Khan"
              rules={{ required: "Required!" }}
              className={inputClassName}
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
              className={inputClassName}
            />
          </div>
        </SettingsCard>
        {/* ── App URL Configuration ─────────────────────────────────────────── */}
        <SettingsCard
          icon={Globe}
          title="App URL Configuration"
          description="Endpoints and API URLs used across the app"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
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
              className={inputClassName}
            />
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
              className={inputClassName}
            />
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
              className={inputClassName}
            />
            <InputField
              name="xoomSportsUrl"
              label="Xoom Sports URL"
              placeholder="https://backend.xoomsports.com"
              prefix={<Link size={16} />}
              rules={{
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "Must start with http:// or https://",
                },
              }}
              className={inputClassName}
            />
            <InputField
              name="geminiApiKey"
              label="Gemini API Key"
              placeholder="AIzaSy..."
              type="password"
              showPassword
              prefix={<KeyRound size={16} />}
              className={inputClassName}
            />
            <InputField
              name="telcoProviderWebhookUrl"
              label="Telco Provider Webhook URL"
              placeholder="https://your-system.com/api/webhook/telco"
              prefix={<Webhook size={16} />}
              rules={{
                pattern: {
                  value: /^https?:\/\/.+/,
                  message: "Must start with http:// or https://",
                },
              }}
              className={inputClassName}
            />
          </div>
        </SettingsCard>
        {/* ── App Flow Control ──────────────────────────────────────────────── */}
        <SettingsCard
          icon={ToggleLeft}
          title="App Flow Control"
          description="Toggle mobile app behaviour instantly — no app release required"
          noPadding
        >
          <div className="divide-y divide-border/60 px-2 py-2 sm:px-3">
            <ToggleRow
              name="manual_flow_enabled"
              control={control}
              title="Manual flow"
              description="When ON, the app shows phone number and OTP input screens instead of auto-detecting. Enable for Play Store review or when auto-detection fails."
              icon={Smartphone}
            />
            <ToggleRow
              name="web_view_enabled"
              control={control}
              title="Web View"
              description="When enabled, content will open inside the app using a web view. Turn it off to open links in your default browser."
              icon={Globe}
            />
          </div>
        </SettingsCard>

        {/* ── Sticky save bar ───────────────────────────────────────────────── */}
        <div className="sticky bottom-4 z-10">
          <div className="flex flex-col-reverse items-stretch justify-between gap-3 rounded-2xl border border-border/80 bg-card/95 px-5 py-4 shadow-lg shadow-primary/5 backdrop-blur sm:flex-row sm:items-center">
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-foreground">
                General Settings
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
                  Saving changes...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save changes
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
