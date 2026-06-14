"use client";

import FileUploadComponent from "@/components/custom/FileUploadComponent";
import InputField from "@/components/form/InputField";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageIcon } from "lucide-react";
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4 text-primary" />
          App Branding
        </CardTitle>
        <CardDescription>
          App name and logo shown across the mobile application
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* App Logo */}
          <div className="space-y-1.5">
            <Label>App Logo</Label>
            <FileUploadComponent
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
          <div className="space-y-1.5">
            <Label>Background Image</Label>
            <FileUploadComponent
              accept="image"
              maxSize={10}
              maxFiles={1}
              onFilesChange={(files) => {
                setBgFile(files);
                if (files.length > 0) setBgRemoved(false);
              }}
              existingImageUrl={
                !bgRemoved ? general?.backgroundImage || "" : ""
              }
              onRemoveExisting={() => {
                setBgRemoved(true);
                setBgFile([]);
              }}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InputField
            name="appName"
            label="App Name"
            placeholder="Xoom Sports"
            rules={{ required: "Required!" }}
          />
          <div className="space-y-2">
            <Label>About Us</Label>
            <Textarea
              placeholder="Write about your company..."
              rows={4}
              className="focus-visible:ring-primary"
              {...register("aboutUs")}
            />
          </div>
        </div>

        {/* Offer */}
        <div className="grid md:grid-cols-2 gap-4">
          <InputField
            name="offerTitle"
            label="Offer Title"
            placeholder="Summer Special"
          />
          <InputField
            name="offerDescription"
            label="Offer Description"
            placeholder="Get 50% off on all subscriptions"
          />
        </div>

        {/* Policies */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Privacy Policy</Label>
            <Textarea
              rows={5}
              className="focus-visible:ring-primary"
              {...register("privacyPolicy")}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Terms of Service</Label>
            <Textarea
              rows={5}
              className="focus-visible:ring-primary"
              {...register("termsOfService")}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
