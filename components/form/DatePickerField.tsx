"use client";

import { Label } from "@/components/ui/label";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { BadgeAlert, Calendar } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  Control,
  Controller,
  FieldError,
  FieldValues,
  Path,
} from "react-hook-form";
import { Input } from "../ui/input";

interface DatePickerFieldProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  required?: boolean;
  rules?: object;
  disabled?: boolean;
  error?: FieldError;
  containerClassName?: string;

  // Flatpickr options
  enableTime?: boolean;
  noCalendar?: boolean;
  dateFormat?: string;
  minDate?: string | Date;
  maxDate?: string | Date;
  mode?: "single" | "multiple" | "range";
  defaultDate?: string | Date;
  time_24hr?: boolean;
  minuteIncrement?: number;
  defaultHour?: number;
  defaultMinute?: number;
  errorBadge?: boolean;
  labelClassName?: string;
}

export default function DatePickerField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder = "Select date",
  required = false,
  rules,
  disabled = false,
  error,
  containerClassName = "",

  enableTime = false,
  noCalendar = false,
  dateFormat = "Y-m-d",
  minDate,
  maxDate,
  mode = "single",
  defaultDate,
  time_24hr = false,
  minuteIncrement = 1,
  defaultHour = 12,
  defaultMinute = 0,
  errorBadge = true,
  labelClassName = "text-base",
}: DatePickerFieldProps<T>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const flatpickrInstanceRef = useRef<flatpickr.Instance | null>(null);

  return (
    <div className={containerClassName}>
      {label && (
        <Label className={` text-sm font-dm-sans font-medium mb-1 block`}>
          {label}
          {required && (
            <span className="text-red-500 ml-0.5 font-dm-sans font-bold">
              *
            </span>
          )}
        </Label>
      )}

      <Controller
        name={name}
        control={control}
        rules={rules}
        render={({ field }) => {
          // Initialize Flatpickr once when component mounts
          useEffect(() => {
            if (!inputRef.current) return;

            // Destroy existing instance if any
            if (flatpickrInstanceRef.current) {
              flatpickrInstanceRef.current.destroy();
            }
            // Parse initial value if it exists
            let initialDate = field.value || defaultDate;

            // If field.value is an ISO string or timestamp, convert it to Date object
            if (initialDate && typeof initialDate === "string") {
              // Check if it's an ISO date string
              const parsedDate = new Date(initialDate);
              if (!isNaN(parsedDate.getTime())) {
                initialDate = parsedDate;
              }
            }

            // Create new Flatpickr instance
            flatpickrInstanceRef.current = flatpickr(inputRef.current, {
              enableTime,
              noCalendar,
              dateFormat,
              minDate,
              maxDate,
              mode,
              defaultDate: initialDate,
              time_24hr,
              minuteIncrement,
              defaultHour,
              defaultMinute,
              onChange: (selectedDates) => {
                // Store as ISO string for consistency
                if (selectedDates.length > 0) {
                  field.onChange(selectedDates[0].toISOString());
                } else {
                  field.onChange("");
                }
              },
              onClose: () => {
                field.onBlur();
              },
            });

            // Cleanup on unmount
            return () => {
              if (flatpickrInstanceRef.current) {
                flatpickrInstanceRef.current.destroy();
                flatpickrInstanceRef.current = null;
              }
            };
          }, [
            enableTime,
            noCalendar,
            dateFormat,
            minDate,
            maxDate,
            mode,
            time_24hr,
            minuteIncrement,
            defaultHour,
            defaultMinute,
          ]);

          // Sync external field value with Flatpickr
          useEffect(() => {
            if (flatpickrInstanceRef.current && field.value) {
              const date = new Date(field.value); // convert string → Date
              if (!isNaN(date.getTime())) {
                flatpickrInstanceRef.current.setDate(date, false);
              }
            }
          }, [field.value]);

          return (
            <div className="relative">
              <Input
                ref={inputRef}
                type="text"
                placeholder={placeholder}
                disabled={disabled}
                readOnly // Added this to prevent manual input
                className={`
                  w-full h-11 px-4 pr-10 text-sm rounded-md border transition-all bg-transparent
                  placeholder:text-gray-400 border-[#E2E2E2] dark:border-[#0F141B]
                  disabled:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed
                  focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1B2A41] outline-none
                  ${error ? "border-red-500!" : ""}
                `}
              />

              {/* Calendar Icon */}
              <Calendar
                className={`
                  absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none
                  ${error ? "text-[#830E0E]" : "text-gray-500"}
                `}
              />
            </div>
          );
        }}
      />

      {/* Error Message */}
      {error && (
        <div className="flex items-center mt-2 gap-1">
          {errorBadge && <BadgeAlert className="text-red-500 h-4 w-4" />}
          <p className="text-red-500 text-sm">{error.message as string}</p>
        </div>
      )}
    </div>
  );
}
