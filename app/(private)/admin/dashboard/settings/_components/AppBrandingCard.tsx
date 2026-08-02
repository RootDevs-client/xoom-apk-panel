"use client";

import InputField from "@/components/form/InputField";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon } from "lucide-react";
import { SettingsCard } from "./SettingsCard";
import SettingsImageUpload from "./SettingsImageUpload";
import { AppBrandingCardProps } from "./types";

export function AppBrandingCard({
  general,
  register,
  logoError,
  logoRemoved,
  bgRemoved,
  setLogoFile,
  setLogoError,
  setLogoRemoved,
  setBgFile,
  setBgRemoved,
}: AppBrandingCardProps) {
  return (
    <SettingsCard
      icon={ImageIcon}
      title="App Branding"
      description="App name, logo and visual identity shown across the mobile application"
    >
      <div className="space-y-8">
        {/* ── Logos ─────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                App Logo
              </Label>
              <span className="text-xs text-muted-foreground">
                PNG, JPG or SVG
              </span>
            </div>
            <SettingsImageUpload
              accept="image"
              maxSize={10}
              maxFiles={1}
              onFilesChange={(files) => {
                setLogoFile(files);
                if (files.length > 0) setLogoError("");
              }}
              existingImageUrl={!logoRemoved ? general?.appLogo || "" : ""}
              onRemoveExisting={() => {
                setLogoRemoved(true);
                setLogoError("App logo is required");
              }}
              error={logoError}
              required
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-foreground">
                Background Image
              </Label>
              <span className="text-xs text-muted-foreground">
                Optional cover image
              </span>
            </div>
            <SettingsImageUpload
              accept="image"
              maxSize={10}
              maxFiles={1}
              onFilesChange={(files) => {
                setBgFile(files);
                if (files.length > 0) setBgRemoved(false);
              }}
              existingImageUrl={!bgRemoved ? general?.backgroundImage || "" : ""}
              onRemoveExisting={() => {
                setBgRemoved(true);
                setBgFile([]);
              }}
            />
          </div>
        </div>

        {/* ── App name & about ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-2">
          <InputField
            name="appName"
            label="App Name"
            placeholder="Xoom Sports"
            rules={{ required: "Required!" }}
            className="h-11 rounded-xl border-border/80 bg-background/50 shadow-none transition-shadow focus-visible:shadow-sm"
          />
          <div className="space-y-2">
            <Label
              htmlFor="aboutUs"
              className="text-sm font-medium text-foreground"
            >
              About Us
            </Label>
            <Textarea
              id="aboutUs"
              placeholder="Write about your company..."
              rows={4}
              className="min-h-[7.5rem] rounded-xl border-border/80 bg-background/50 text-base font-normal shadow-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-0 md:text-sm"
              {...register("aboutUs")}
            />
          </div>
        </div>

        {/* ── Offer ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <InputField
            name="offerTitle"
            label="Offer Title"
            placeholder="Summer Special"
            className="h-11 rounded-xl border-border/80 bg-background/50 shadow-none transition-shadow focus-visible:shadow-sm"
          />
          <InputField
            name="offerDescription"
            label="Offer Description"
            placeholder="Get 50% off on all subscriptions"
            className="h-11 rounded-xl border-border/80 bg-background/50 shadow-none transition-shadow focus-visible:shadow-sm"
          />
        </div>
      </div>
    </SettingsCard>
  );
}
