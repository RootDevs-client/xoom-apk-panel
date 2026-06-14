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
import { Textarea } from "@/components/ui/textarea";
import { uploadSingleFile } from "@/lib/fileUpload";
import { Globe, Link, Save, ToggleLeft, Webhook } from "lucide-react";
import { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { AppBrandingCard } from "./AppBrandingCard";
import { GalleryCard } from "./GalleryCard";
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
      manual_flow_enabled: false,
      web_view_enabled: true,
      appLogo: "",
      appName: "",
      aboutUs: "",
      offerTitle: "",
      offerDescription: "",
      privacyPolicy: "",
      termsOfService: "",
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
      privacyPolicy: general.privacyPolicy || "",
      termsOfService: general.termsOfService || "",
      galleries: general.galleries || [],
      backgroundImage: general.backgroundImage || "",
      universalSubscriptionApiUrl: general.universalSubscriptionApiUrl || "",
      xoomSportsUrl: general.xoomSportsUrl || "",
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

  console.log("general", general);

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

        {/* ── Owner Information ─────────────────────────────────────────────── */}
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

        {/* ── App URL Configuration ─────────────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              App URL Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-4 grid-cols-1">
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
              />
            </div>
          </CardContent>
        </Card>

        {/* ── App Flow Control ──────────────────────────────────────────────── */}
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
            <ToggleRow
              name="manual_flow_enabled"
              control={control}
              title="Manual flow"
              description="When ON, the app shows phone number and OTP input screens instead of auto-detecting. Enable for Play Store review or when auto-detection fails."
            />
            <ToggleRow
              name="web_view_enabled"
              control={control}
              title="Web View"
              description="When enabled, content will open inside the app using a web view. Turn it off to open links in your default browser."
            />
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

// ─── Shared toggle row ────────────────────────────────────────────────────────
