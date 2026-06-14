import { UseFormRegister } from "react-hook-form";

export interface GalleryItem {
  title: string;
  url: string; // full S3 URL stored and sent as-is
}

export interface GeneralFormData {
  companyName: string;
  supportEmail: string;
  companyAddress: string;
  ownerName: string;
  ownerEmail: string;
  webviewUrl: string;
  webhookUrl: string;
  manual_flow_enabled: boolean;
  web_view_enabled: boolean;
  appLogo: string;
  appName: string;
  aboutUs: string;
  offerTitle: string;
  offerDescription: string;
  privacyPolicy: string;
  termsOfService: string;
  galleries: GalleryItem[];
  backgroundImage: string;
}

// ─── Gallery slot state ───────────────────────────────────────────────────────
// Each slot tracks: the existing URL from the server, a new File if re-uploaded,
// and the title. This way we never lose existing images when only some slots change.

export interface GallerySlot {
  title: string;
  existingUrl: string; // full S3 URL loaded from server
  newFile: File | null; // set when user picks a new file
  removedExisting: boolean;
}

export interface AppBrandingCardProps {
  general: any;
  register: UseFormRegister<any>;
  logoError: string;
  logoRemoved: boolean;
  bgRemoved: boolean;
  setLogoFile: (files: File[]) => void;
  setLogoError: (msg: string) => void;
  setLogoRemoved: (val: boolean) => void;
  setBgFile: (files: File[]) => void;
  setBgRemoved: (val: boolean) => void;
}
