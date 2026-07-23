import mongoose, { Document, Schema } from "mongoose";

export interface IConfigItem {
  key: string;
  label: string;
  type: "string" | "number" | "boolean";
  value: mongoose.Schema.Types.Mixed;
  required: boolean;
}

export interface ITelcoOperator extends Document {
  name: string;
  code: string;
  country: string;
  evinaEnabled: boolean;
  telcoParameterValues: string;
  variant: "STANDARD" | "EVINA" | "CG_CALLBACK";
  pinLocation: "TELCO_PAGE" | "OUR_PAGE";
  configs: IConfigItem[];
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ConfigItemSchema = new Schema<IConfigItem>(
  {
    key: { type: String, required: true, trim: true },
    label: { type: String, required: true, trim: true },
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
    evinaEnabled: { type: Boolean, default: false },
    variant: {
      type: String,
      enum: ["STANDARD", "EVINA", "CG_CALLBACK"],
      required: true,
    },
    pinLocation: {
      type: String,
      enum: ["TELCO_PAGE", "OUR_PAGE"],
      default: "TELCO_PAGE",
    },
    telcoParameterValues: { type: String, default: "" },
    configs: { type: [ConfigItemSchema], default: [] },
    is_active: { type: Boolean, default: true },
  },
  {
    versionKey: false,
    timestamps: true,
  },
);

export const TelcoOperator =
  mongoose.models.TelcoOperator ||
  mongoose.model<ITelcoOperator>("TelcoOperator", TelcoOperatorSchema);
