"use client";

import { API } from "@/lib/evina/constants";
import { Evina } from "@/lib/evina/evina";
import { type SubscriptionStep } from "@/lib/evina/types";
import { generateTransactionId } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { ConfirmScreen } from "./ConfirmScreen";
import { PhoneScreen } from "./PhoneScreen";
import { PinScreen } from "./PinScreen";
import { SuccessScreen } from "./SuccessScreen";

const IP = "3.2.56.255";

export function SubscriptionPage() {
  const [screen, setScreen] = useState<SubscriptionStep>("phone");
  const [fullPhone, setFullPhone] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const { phoneNumber } = useParams<{ phoneNumber: string }>();

  const formatKuwaitMsisdn = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, "");
    if (!cleaned.startsWith("965")) return "965" + cleaned;
    return cleaned;
  };

  const handleGetEvinaJs = useCallback(
    async (fullPhoneNumber: string, _raw: string) => {
      setError(null);
      const txnId = generateTransactionId();
      setTransactionId(txnId);
      setFullPhone(fullPhoneNumber);
      setScreen("loading");

      const res = await fetch(API.getEvinaJs, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          msisdn: fullPhoneNumber,
          userTelcoServiceId: 100,
          adAgencyCampaignId: 100,
          adAgencyCampaignTransactionId: txnId,
          userIP: IP,
          // telco: "Kuwait-stc",
          telco: "UAE",
          ua: navigator.userAgent || "Xoom-Webview",
        }),
      });

      const data = await res.json();
      console.log("data", data);

      if (!res.ok || data.errorCode !== 20000)
        throw new Error(
          data.responseMessage ||
            data.message ||
            "Failed to initialize. Please try again.",
        );

      await Evina.load(data.responseMessage);
      setScreen("confirm");
    },
    [],
  );

  async function handlePinRequest() {
    const res = await fetch(API.pinRequest, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        msisdn: fullPhone,
        userTelcoServiceId: 100,
        adAgencyCampaignId: 100,
        adAgencyCampaignTransactionId: transactionId,
        userIP: IP,
        // telco: "Kuwait-stc",
        telco: "UAE",
        ua: navigator.userAgent || "Xoom-Webview",
      }),
    });

    const data = await res.json();

    if (data.status === "Fail")
      throw new Error(
        data.responseMessage ||
          data.message ||
          "PIN request failed. Please try again.",
      );

    if (!res.ok || (data.status !== "success" && data.errorCode !== 20000))
      throw new Error(
        data.message ||
          data.error ||
          data.responseMessage ||
          "PIN request failed",
      );

    setScreen("pin");
  }

  async function handleConfirm() {
    setError(null);
    setScreen("loading");
    try {
      await handlePinRequest();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred",
      );
      setScreen("apiError");
    }
  }

  async function handlePinVerify(pin: string) {
    await Evina.activate();

    const res = await fetch(API.pinVerify, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pin,
        adAgencyCampaignTransactionId: transactionId,
        msisdn: fullPhone,
      }),
    });

    const result = await res.json();

    if (result.status === "Fail")
      throw new Error(
        result.responseMessage ||
          result.message ||
          "Incorrect PIN. Please try again.",
      );

    if (!res.ok || result.status === "error" || result.error)
      throw new Error(
        result.message ||
          result.error ||
          result.responseMessage ||
          "Verification failed",
      );

    if (result.status === "success") {
      setScreen("success");
    } else {
      throw new Error("Verification failed. Please try again.");
    }
  }

  async function handleResend() {
    const txnId = generateTransactionId();
    setTransactionId(txnId);

    const resp = await fetch(API.pinRequest, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        msisdn: fullPhone,
        userTelcoServiceId: 100,
        adAgencyCampaignId: 100,
        adAgencyCampaignTransactionId: txnId,
        userIP: IP,
        ua: navigator.userAgent,
      }),
    });

    const data = await resp.json();

    if (data.status === "Fail")
      throw new Error(
        data.responseMessage || "Failed to resend PIN. Please try again.",
      );
    if (!resp.ok) throw new Error("Resend failed");
  }

  useEffect(() => {
    if (phoneNumber && phoneNumber.trim() !== "") {
      const formatted = formatKuwaitMsisdn(phoneNumber);
      setScreen("loading");
      setError(null);

      const handler = setTimeout(async () => {
        try {
          await handleGetEvinaJs(formatted, "");
        } catch (err) {
          console.error("Error in handleGetEvinaJs:", err);
          setError(
            err instanceof Error ? err.message : "An unknown error occurred",
          );
          setScreen("apiError");
        }
      }, 5000);

      return () => clearTimeout(handler);
    } else {
      setScreen("phone");
      setError(null);
    }
  }, [phoneNumber, handleGetEvinaJs]);

  return (
    <div className="font-[Poppins,sans-serif] min-h-screen flex flex-col items-center text-white">
      {screen === "success" ? (
        <SuccessScreen
          fullPhone={fullPhone}
          onGoHome={() => {
            window.location.href = "https://xoom-apk-panel.vercel.app";
          }}
        />
      ) : (
        <div className="w-full max-w-110 px-5 py-8 pb-12 mx-auto">
          {screen === "loading" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
              <p className="mt-4">Processing...</p>
            </div>
          )}
          {screen === "apiError" && (
            <div className="text-center">
              <p className="mt-4 text-red-500">{error}</p>
            </div>
          )}
          {screen === "phone" && (
            <PhoneScreen onSubmit={handleGetEvinaJs} error={error} />
          )}
          {screen === "confirm" && (
            <ConfirmScreen fullPhone={fullPhone} onConfirm={handleConfirm} />
          )}
          {screen === "pin" && (
            <PinScreen
              fullPhone={fullPhone}
              onSubmit={handlePinVerify}
              onResend={handleResend}
              onBack={() => setScreen("phone")}
            />
          )}
        </div>
      )}
    </div>
  );
}
