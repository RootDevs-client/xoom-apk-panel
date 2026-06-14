import { ISettings } from "@/lib/types";
import mongoose, { Schema } from "mongoose";

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const general = new mongoose.Schema(
  {
    appLogo: { type: String, trim: true },
    appName: { type: String, trim: true },
    backgroundImage: { type: String, trim: true },

    companyName: { type: String, trim: true },
    companyAddress: { type: String, trim: true },

    supportEmail: { type: String, trim: true, lowercase: true },
    ownerName: { type: String, trim: true },
    ownerEmail: { type: String, trim: true, lowercase: true },

    webviewUrl: { type: String, trim: true },
    webhookUrl: { type: String, trim: true },
    universalSubscriptionApiUrl: { type: String, trim: true },
    xoomSportsUrl: { type: String, trim: true },

    manual_flow_enabled: { type: Boolean, default: false },
    web_view_enabled: { type: Boolean, default: true },

    galleries: { type: [galleryItemSchema], default: [] },
    offerTitle: { type: String, trim: true },
    offerDescription: { type: String, trim: true },

    privacyPolicy: { type: String, default: "" },
    termsOfService: { type: String, default: "" },
    aboutUs: { type: String, default: "" },
  },
  {
    _id: false,
  },
);

const SettingsSchema: Schema = new mongoose.Schema(
  {
    general,
  },
  {
    timestamps: true,
  },
);

const Settings =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema, "settings");

export default Settings;
