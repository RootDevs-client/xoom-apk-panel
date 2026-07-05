"use client";

import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Calendar } from "lucide-react";
import { useEffect, useRef } from "react";
import { Input } from "../ui/input";

interface FlatpickrInputProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  enableTime?: boolean;
  dateFormat?: string;
  minDate?: string | Date;
  maxDate?: string | Date;
}

export default function FlatpickrInput({
  value,
  onChange,
  onBlur,
  id,
  placeholder = "Select date",
  disabled = false,
  error,
  enableTime = false,
  dateFormat = "Y-m-d",
  minDate,
  maxDate,
}: FlatpickrInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const flatpickrRef = useRef<flatpickr.Instance | null>(null);

  useEffect(() => {
    if (!inputRef.current) return;

    if (flatpickrRef.current) {
      flatpickrRef.current.destroy();
    }

    let initialDate = value;
    if (initialDate && typeof initialDate === "string") {
      const parsed = new Date(initialDate);
      if (!isNaN(parsed.getTime())) {
        initialDate = parsed as any;
      }
    }

    flatpickrRef.current = flatpickr(inputRef.current, {
      enableTime,
      dateFormat,
      minDate,
      maxDate,
      defaultDate: initialDate || undefined,
      onChange: (selectedDates) => {
        if (selectedDates.length > 0) {
          onChange(selectedDates[0].toISOString());
        } else {
          onChange("");
        }
      },
      onClose: () => {
        onBlur?.();
      },
    });

    return () => {
      flatpickrRef.current?.destroy();
      flatpickrRef.current = null;
    };
  }, [enableTime, dateFormat, minDate, maxDate]);

  useEffect(() => {
    if (flatpickrRef.current && value) {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        flatpickrRef.current.setDate(date, false);
      }
    }
  }, [value]);

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        id={id}
        type="text"
        placeholder={placeholder}
        disabled={disabled}
        readOnly
        className={`
          w-full h-11 px-4 pr-10 text-sm rounded-md border transition-all bg-transparent
          placeholder:text-gray-400 border-[#E2E2E2] dark:border-[#0F141B]
          disabled:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed
          focus-visible:ring-0 focus-visible:ring-offset-0 focus:border-[#1B2A41] outline-none
          ${error ? "border-red-500!" : ""}
        `}
      />
      <Calendar
        className={`
          absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none
          ${error ? "text-[#830E0E]" : "text-gray-500"}
        `}
      />
    </div>
  );
}
