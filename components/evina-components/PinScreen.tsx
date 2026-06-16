"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface PinScreenProps {
  fullPhone: string;
  onSubmit: (pin: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

export function PinScreen({
  fullPhone,
  onSubmit,
  onResend,
  onBack,
}: PinScreenProps) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const refs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  useEffect(() => {
    refs[0].current?.focus();
    setCountdown(60);
    setCanResend(false);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  function handleDigit(idx: number, value: string) {
    const v = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = v;
    setDigits(next);
    setError("");
    if (v && idx < 3) refs[idx + 1].current?.focus();
  }

  function handleKeyDown(idx: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0)
      refs[idx - 1].current?.focus();
    if (e.key === "Enter") handleVerify();
  }

  async function handleVerify() {
    const pin = digits.join("");
    if (pin.length < 4) {
      setError("Enter the 4-digit PIN from your SMS.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit(pin);
    } catch (e: any) {
      setError(e.message || "Verification failed. Please try again.");
      setDigits(["", "", "", ""]);
      refs[0].current?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setCanResend(false);
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    try {
      await onResend();
    } catch {
      setError("Could not resend PIN. Try again later.");
      setTimeout(() => setError(""), 3000);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-[#333230] bg-[#181818]">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold text-white">
          Enter PIN
        </CardTitle>

        <CardDescription className="text-sm text-gray-500 leading-relaxed">
          A 4-digit code was sent to
          <br />
          <strong className="text-white">{fullPhone}</strong>
        </CardDescription>
      </CardHeader>

      <CardContent>
        {/* PIN boxes */}
        <div className="flex justify-center gap-3 mb-1">
          {digits.map((d, idx) => (
            <input
              key={idx}
              ref={refs[idx]}
              type="tel"
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => handleDigit(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className={`w-14 h-[60px] rounded-xl text-center text-[22px] font-bold text-gray-900 outline-none transition-all duration-200 border-[1.5px] bg-white focus:border-red-500 focus:ring-[3px] focus:ring-red-500/20 ${
                d ? "border-red-500" : "border-transparent"
              }`}
            />
          ))}
        </div>

        {error && <p className="mt-1.5 pl-1 text-sm text-white">{error}</p>}

        <Button
          onClick={handleVerify}
          disabled={loading}
          className="mt-5 h-12 w-full rounded-full bg-red-600 text-base font-semibold text-white hover:bg-red-700 active:scale-[0.98] disabled:bg-red-600/60"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Subscribe"}
        </Button>

        {/* Countdown / Resend */}
        <div className="mt-4 text-center text-sm text-gray-500">
          {canResend ? (
            <button
              onClick={handleResend}
              className="cursor-pointer border-none bg-transparent text-sm font-semibold text-red-500"
            >
              Resend Code
            </button>
          ) : (
            <span>
              Resend code in <strong className="text-white">{countdown}</strong>
              s
            </span>
          )}
        </div>

        {/* Back button */}
        <Button
          variant="outline"
          onClick={onBack}
          className="mt-3 h-11 w-full rounded-full border border-[#333230] bg-transparent text-sm font-medium text-gray-500 hover:border-gray-500 hover:text-white"
        >
          ← Change number
        </Button>
      </CardContent>
    </Card>
  );
}
