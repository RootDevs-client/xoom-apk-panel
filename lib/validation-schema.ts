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
export const settingsGeneralSchema = z.object({
  companyName: z.string().optional(),
  companyAddress: z.string().optional(),
  supportEmail: z.string().email().optional(),
  ownerName: z.string().optional(),
  ownerEmail: z.string().email().optional(),

  webviewUrl: z.string().optional(),
  webhookUrl: z.string().optional(),
  sportsUrl: z.string().optional(),
  sportsToken: z.string().optional(),

  manual_flow_enabled: z.boolean().optional(),
  web_view_enabled: z.boolean().optional(),

  // new filed added
  country: z.string().optional(),
  userTelcoServiceId: z
    .union([z.number(), z.null()])
    .optional()
    .transform((val) => val ?? undefined),
  adAgencyCampaignId: z
    .union([z.number(), z.null()])
    .optional()
    .transform((val) => val ?? undefined),

  sports_url_enabled: z.boolean().optional(),
  redirect_url_enabled: z.boolean().optional(),
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
  status: z.boolean().optional(),
});
export const updateSubscribeSchema = z.object({
  phone: z.string().optional(),
  reference: z.string().optional(),
  platform: z.string().optional(),
  status: z.boolean().optional(),
});

// Validation schema
export const unsubscribeSchema = z.object({
  phone: z.string().min(1, "Phone number is required!"),
});
