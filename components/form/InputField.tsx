"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormInputProps } from "@/lib/types";
import { cn } from "@/lib/utils";
import { BadgeAlert, Info } from "lucide-react";
import { FieldError, FieldValues, get, useFormContext } from "react-hook-form";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ✅ Extend FormInputProps inline or update your types file
type ExtendedInputProps<TFieldValues extends FieldValues> =
  FormInputProps<TFieldValues> & {
    required?: boolean;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    tooltip?: string;
  };

export default function InputField<TFieldValues extends FieldValues>({
  id,
  label,
  type = "text",
  placeholder = "",
  name,
  rules = {},
  className = "",
  prefix,
  postfix,
  required = false,
  min,
  max,
  minLength,
  maxLength,
  tooltip,
}: ExtendedInputProps<TFieldValues>) {
  const {
    register,
    trigger,
    formState: { errors },
  } = useFormContext<TFieldValues>();

  const fieldError = get(errors, name) as FieldError | undefined;
  //  Auto-map min/max to minLength/maxLength for text inputs
  const isNumberType = type === "number";

  const mergedRules = {
    ...rules,
    ...(required && {
      required:
        typeof rules.required === "string"
          ? rules.required
          : "This field is required",
    }),

    // For number inputs → use min/max
    ...(isNumberType &&
      min !== undefined && {
        min: { value: min, message: `Minimum value is ${min}` },
      }),
    ...(isNumberType &&
      max !== undefined && {
        max: { value: max, message: `Maximum value is ${max}` },
      }),

    // For text inputs → auto convert min/max to minLength/maxLength
    ...(!isNumberType &&
      min !== undefined && {
        minLength: {
          value: min,
          message: `Minimum ${min} characters required`,
        },
      }),
    ...(!isNumberType &&
      max !== undefined && {
        maxLength: { value: max, message: `Maximum ${max} characters allowed` },
      }),

    // Explicit minLength/maxLength props always apply
    ...(minLength !== undefined && {
      minLength: {
        value: minLength,
        message: `Minimum ${minLength} characters required`,
      },
    }),
    ...(maxLength !== undefined && {
      maxLength: {
        value: maxLength,
        message: `Maximum ${maxLength} characters allowed`,
      },
    }),
  };

  const registerProps = register(name, mergedRules);

  return (
    <div className="w-full relative z-0!">
      {label && (
        <div className="flex items-center gap-1.5 mb-1">
          <Label
            htmlFor={id || name}
            className="text-sm font-dm-sans font-medium block"
          >
            {label}
            {/*  Show * if required */}
            {required && (
              <span className="text-red-500 ml-0.5 font-dm-sans font-bold">
                *
              </span>
            )}
          </Label>
          {tooltip && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Info className="size-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3 pointer-events-none">{prefix}</div>
        )}

        <Input
          id={id || name}
          type={type}
          placeholder={placeholder}
          {...registerProps}
          onChange={async (e) => {
            await registerProps.onChange(e);
            trigger(name);
          }}
          className={cn(
            `h-11 rounded-lg text-[16px] font-semibold border-gray-200  tracking-[0.5px] font-dm-sans focus-visible:ring-0 ${
              fieldError
                ? "focus-visible:ring-red-500"
                : "!focus-visible:ring-red-700"
            } transition-all w-full`,
            prefix ? "pl-9" : "",
            postfix ? "pr-9" : "",
            className,
          )}
        />

        {postfix && (
          <div className="absolute right-3 pointer-events-none">{postfix}</div>
        )}
      </div>

      {fieldError && (
        <div className="flex items-center mt-2 gap-1">
          <BadgeAlert className="text-red-500 h-4 w-4" />
          <p className="text-red-500 text-xs font-dm-sans font-medium">
            {fieldError.message}
          </p>
        </div>
      )}
    </div>
  );
}
