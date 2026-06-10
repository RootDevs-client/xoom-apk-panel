import { ISettings } from "@/lib/types";
import mongoose, { Schema } from "mongoose";

const general = new mongoose.Schema(
  {
    companyName: { type: String, trim: true },
    companyAddress: { type: String, trim: true },

    supportEmail: { type: String, trim: true },
    ownerName: { type: String, trim: true },
    ownerEmail: { type: String, trim: true },

    webviewUrl: { type: String, trim: true },
    webhookUrl: { type: String, trim: true },

    manual_flow_enabled: { type: Boolean, default: false },
    web_view_enabled: { type: Boolean, default: true },

    // ── Add these three ──────────────────────────────────────
    country: { type: String },
    userTelcoServiceId: { type: Number },
    adAgencyCampaignId: { type: Number },

    sports_url_enabled: { type: Boolean, default: false },
    redirect_url_enabled: { type: Boolean, default: false },
    sportsUrl: { type: String },
    sportsToken: { type: String },
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
