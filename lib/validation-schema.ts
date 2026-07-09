import { z } from "zod";
// import { Types } from "mongoose";
//-------------------------------api validation schema start-----------------------

//admin auth validation
export const adminLoginSchema = z.object({
  email: z.email("Valid email is required!").min(1, "Required!").trim(),
  password: z.string("Required!").min(1, "Required!"),
});

//admin profile
export const adminProfileSchema = z.object({
  name: z.string().trim().nullable(),
});
//admin pass change
export const passwordChangeSchema = z
  .object({
    oldPassword: z.string("Required").min(1, "Required!"),
    newPassword: z
      .string("Required")
      .min(6, "Password must be at least 6 characters long!"),
    confirmPassword: z.string("Required").min(1, "Required!"),
  })
  .refine((data) => data.newPassword !== data.oldPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match!",
    path: ["confirmPassword"],
  });
const galleryItemSchema = z.object({
  title: z.string(),
  url: z.string(),
});

export const settingsGeneralSchema = z.object({
  appLogo: z.string().optional(),
  appName: z.string().optional(),
  backgroundImage: z.string().optional(),

  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  supportEmail: z.string().email().optional(),
  ownerName: z.string().optional(),
  ownerEmail: z.string().email().optional(),

  webviewUrl: z.string().optional(),
  webhookUrl: z.string().optional(),
  universalSubscriptionApiUrl: z.string().optional(),
  xoomSportsUrl: z.string().optional(),
  geminiApiKey: z.string().optional(),

  manual_flow_enabled: z.boolean().optional(),
  web_view_enabled: z.boolean().optional(),

  galleries: z.array(galleryItemSchema).optional(),
  offerTitle: z.string().optional(),
  offerDescription: z.string().optional(),

  aboutUs: z.string().optional(),
});

export const settingsPrivacyPolicySchema = z.object({
  content: z.string().optional(),
});

export const settingsTermsSchema = z.object({
  content: z.string().optional(),
});

//! stories validation schema
export const dateFromForm = z.preprocess((v) => {
  if (v === "" || v === undefined) return undefined;
  const d = new Date(v as string);
  return isNaN(d.getTime()) ? undefined : d;
}, z.date());

//!subscribe validation schema
export const createSubscribeSchema = z.object({
  phone: z.string().min(1, "Phone number is required!").trim(),
  reference: z.string().min(1, "Reference is required!").trim(),
  platform: z.string().optional().default(""),
  membershipPlan: z.string().optional().default("Daily"),
  status: z.boolean().optional(),
  deviceInfo: z.record(z.string(), z.any()).optional(),
});
export const updateSubscribeSchema = z.object({
  phone: z.string().optional(),
  reference: z.string().optional(),
  platform: z.string().optional(),
  status: z.boolean().optional(),
  deviceInfo: z.array(z.record(z.string(), z.any())).optional(),
});

// Validation schema
export const unsubscribeSchema = z.object({
  phone: z.string().min(1, "Phone number is required!"),
});

export const createEventSchema = z.object({
  deviceId: z.string().min(1, "deviceId is required!"),
  userId: z.string().optional().nullable(),
  sessionId: z.string().optional(),
  event: z.enum(["firstopen", "appopen", "appclose"]),
  eventData: z.record(z.string(), z.any()).optional(),
  ip: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  appVersion: z.string().optional(),
  os: z.string().optional(),
  osVersion: z.string().optional(),
  deviceBrand: z.string().optional(),
  deviceModel: z.string().optional(),
});
