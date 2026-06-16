"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { COUNTRIES } from "@/lib/evina/constants";
import { Country } from "@/lib/evina/types";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { CountryDropdown } from "./CountryDropdown";

interface PhoneScreenProps {
  onSubmit: (fullPhone: string, raw: string, country: Country) => Promise<void>;
  error?: string | null;
}

export function PhoneScreen({ onSubmit, error: externalError = null }: PhoneScreenProps) {
  const [selected, setSelected] = useState<Country>(COUNTRIES[0]);
  const [phone, setPhone] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [internalError, setInternalError] = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const displayError = externalError ?? internalError;

  function validate(raw: string, country: Country): string {
    if (!raw) return "Please enter your phone number";
    if (raw.length < country.min || raw.length > country.max)
      return `Enter a valid ${country.name} number (${country.min} digits)`;
    return "";
  }

  async function handleContinue() {
    const raw = phone.replace(/\D/g, "");
    const err = validate(raw, selected);
    if (err) {
      setInternalError(err);
      return;
    }
    setInternalError("");
    setLoading(true);
    try {
      await onSubmit(selected.dialCode + raw, raw, selected);
    } catch (e: any) {
      setInternalError(e.message || "Unable to send PIN. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-[#333230] bg-[#181818]">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold text-white">
          Enter your number
        </CardTitle>

        <CardDescription className="text-sm text-gray-500 leading-relaxed">
          We&apos;ll send a verification PIN to your mobile.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="relative">
          {/* Phone field */}
          <div
            className={`bg-white rounded-xl flex items-stretch border transition-all duration-200 ${
              displayError
                ? "border-red-500"
                : focused
                  ? "border-red-500 ring-[3px] ring-red-500/20"
                  : "border-transparent"
            }`}
          >
            {/* Country button */}
            <button
              type="button"
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 px-3.5 bg-transparent border-r border-gray-200 cursor-pointer h-[52px] shrink-0 rounded-l-xl min-w-[90px] font-[inherit]"
            >
              <span className="text-xl">{selected.flag}</span>
              <span className="text-sm font-medium text-gray-800">
                +{selected.dialCode}
              </span>
            </button>

            {/* Number input */}
            <input
              type="tel"
              inputMode="numeric"
              placeholder="Mobile Number"
              value={phone}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "");
                setPhone(v);
                setInternalError(validate(v, selected));
              }}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleContinue();
              }}
              className="flex-1 bg-transparent border-none outline-none px-3.5 h-[52px] text-[15px] text-gray-800 rounded-r-xl placeholder:text-gray-400/70"
            />
          </div>

          <CountryDropdown
            countries={COUNTRIES}
            selected={selected}
            open={dropdownOpen}
            onSelect={(c) => {
              setSelected(c);
              setPhone("");
              setInternalError("");
            }}
            onClose={() => setDropdownOpen(false)}
          />
        </div>

        {displayError && (
          <p className="mt-1.5 pl-1 text-sm text-white">{displayError}</p>
        )}

        <Button
          onClick={handleContinue}
          disabled={loading}
          className="w-full h-12 mt-5 bg-red-600 hover:bg-red-700 active:scale-[0.98] disabled:bg-red-600/60 text-white font-semibold text-base rounded-full transition-all"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Continue"}
        </Button>
      </CardContent>
    </Card>
  );
}