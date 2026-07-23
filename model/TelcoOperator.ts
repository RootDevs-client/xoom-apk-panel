import mongoose, { Document, Schema } from "mongoose";

export type HoldMode = "instant" | "hold" | "hold_until_admin_change";
export type HoldUnit = "minute" | "hour" | "day";

export interface IHoldSettings {
  duration?: number;
  unit?: HoldUnit;
}

export interface IProviderSettings {
  mode?: HoldMode;
  hold?: IHoldSettings;
}

export type CgElementType =
  | "button"
  | "checkbox"
  | "input"
  | "form"
  | "submit"
  | "link"
  | "div"
  | "custom";

export interface ICgElement {
  label: string;
  id: string;
  type: CgElementType;
  order: number;
}

export interface ITelcoOperator extends Document {
  name: string;
  code: string;
  country: string;
  variant: "STANDARD" | "EVINA" | "CG_CALLBACK";
  telcoParameterValues: string;
  configs: ICgElement[];
  settings?: IProviderSettings;
  is_active: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const HoldSettingsSchema = new Schema<IHoldSettings>(
  {
    duration: { type: Number, default: null },
    unit: {
      type: String,
      enum: ["minute", "hour", "day"],
      default: "minute",
    },
  },
  { _id: false },
);

const ProviderSettingsSchema = new Schema<IProviderSettings>(
  {
    mode: {
      type: String,
      enum: ["instant", "hold", "hold_until_admin_change"],
      default: "instant",
    },
    hold: { type: HoldSettingsSchema, default: () => ({}) },
  },
  { _id: false },
);

const CgElementSchema = new Schema<ICgElement>(
  {
    label: { type: String, required: true, trim: true },
    id: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: ["button", "checkbox", "input", "form", "submit", "link", "div", "custom"],
    },
    order: { type: Number, default: 1 },
  },
  { _id: false },
);

const TelcoOperatorSchema = new Schema<ITelcoOperator>(
  {
    name: { type: String, required: true, trim: true },
    code: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      uppercase: true,
    },
    country: { type: String, required: true, trim: true },
    variant: {
      type: String,
      enum: ["STANDARD", "EVINA", "CG_CALLBACK"],
      required: true,
    },
    telcoParameterValues: { type: String, default: "" },
    configs: { type: [CgElementSchema], default: [] },
    settings: { type: ProviderSettingsSchema, default: () => ({}) },
    is_active: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const TelcoOperator =
  mongoose.models.TelcoOperator ||
  mongoose.model<ITelcoOperator>("TelcoOperator", TelcoOperatorSchema);
