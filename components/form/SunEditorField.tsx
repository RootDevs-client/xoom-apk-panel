"use client";

import { Label } from "@/components/ui/label";
import { BadgeAlert } from "lucide-react";
import dynamic from "next/dynamic";
import "suneditor/dist/css/suneditor.min.css";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

// Dynamically import SunEditor to avoid SSR issues
const SunEditor = dynamic(() => import("suneditor-react"), { ssr: false });

// ── Toolbar button list ──────────────────────────────────────────────────────
const DEFAULT_BUTTON_LIST = [
  ["undo", "redo"],
  ["font", "fontSize", "formatBlock"],
  ["bold", "underline", "italic", "strike"],
  ["fontColor", "hiliteColor"],
  ["removeFormat"],
  ["outdent", "indent"],
  ["align", "list", "lineHeight"],
  ["link", "image", "video"],
  ["fullScreen", "showBlocks", "codeView"],
];

// ── Props ────────────────────────────────────────────────────────────────────
interface SunEditorFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  height?: string;
  className?: string;
}

// ── Component ────────────────────────────────────────────────────────────────
export default function SunEditorField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Start writing...",
  required = false,
  height = "300",
  className = "",
}: SunEditorFieldProps<T>) {
  return (
    <div className={`w-full space-y-1 ${className}`}>
      {label && (
        <Label className="text-sm font-dm-sans font-medium block">
          {label}
          {required && (
            <span className="text-red-500 ml-0.5 font-bold">*</span>
          )}
        </Label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState: { error } }) => (
          <div>
            <div
              className={`rounded-lg overflow-hidden border transition-colors ${
                error ? "border-red-400" : "border-input"
              }`}
            >
              <SunEditor
                key={name}
                setContents={field.value ?? ""}
                onChange={(content) => field.onChange(content)}
                setOptions={{
                  placeholder,
                  height,
                  buttonList: DEFAULT_BUTTON_LIST,
                  defaultStyle:
                    "font-family: 'DM Sans', sans-serif; font-size: 15px;",
                }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-1 mt-2">
                <BadgeAlert className="text-red-500 h-4 w-4 shrink-0" />
                <p className="text-red-500 text-xs font-dm-sans font-medium">
                  {error.message}
                </p>
              </div>
            )}
          </div>
        )}
      />
    </div>
  );
}
