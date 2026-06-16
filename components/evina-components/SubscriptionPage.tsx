"use client";

import { API } from "@/lib/evina/constants";
import { Evina } from "@/lib/evina/evina";
import { Country } from "@/lib/evina/types";
import { generateTransactionId } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { PhoneScreen } from "./PhoneScreen";
import { PinScreen } from "./PinScreen";
import { SuccessScreen } from "./SuccessScreen";

export function SubscriptionPage() {
  const [screen, setScreen] = useState<"phone" | "pin" | "success" | "loading">("phone");
  const [fullPhone, setFullPhone] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const { phoneNumber } = useParams<{ phoneNumber: string }>();

  const dummyCountry: Country = {
    name: "",
    flag: "",
    code: "",
    dialCode: "",
    min: 0,
    max: 0,
  };

  const formatKuwaitMsisdn = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    if (!cleaned.startsWith('965')) {
      return '965' + cleaned;
    }
    return cleaned;
  };

  async function handlePinRequest(
    fullPhoneNumber: string,
    _raw: string,
    _country: Country,
  ) {
    const txnId = generateTransactionId();
    setTransactionId(txnId);

    const response = await fetch(API.pinRequest, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        msisdn: fullPhoneNumber,
        userTelcoServiceId: 100,
        adAgencyCampaignId: 100,
        adAgencyCampaignTransactionId: txnId,
        userIP: "3.2.56.255",
        ua: navigator.userAgent || "Xoom-Webview",
      }),
    });

    const data = await response.json();

    if (data.status === "Fail")
      throw new Error(
        data.responseMessage ||
          data.message ||
          "PIN request failed. Please try again.",
      );

    if (!response.ok || (data.status !== "success" && data.errorCode !== 20000))
      throw new Error(
        data.message ||
          data.error ||
          data.responseMessage ||
          "PIN request failed",
      );

    if (data.status === "success" || data.errorCode === 20000) {
      Evina.load(data.responseMessage);
      setFullPhone(fullPhoneNumber);
      setScreen("pin");
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
        userIP: "3.2.56.255",
        ua: navigator.userAgent,
      }),
    });

    const data = await resp.json();

    if (data.status === "Fail")
      throw new Error(
        data.responseMessage || "Failed to resend PIN. Please try again.",
      );
    if (!resp.ok) throw new Error("Resend failed");

    Evina.reset();
    Evina.load(data.responseMessage);
  }

  useEffect(() => {
    if (phoneNumber && phoneNumber.trim() !== "") {
      const formatted = formatKuwaitMsisdn(phoneNumber);
      setFullPhone(formatted);
      
      // Show loading state initially
      setScreen("loading");

      const handler = setTimeout(async () => {
        try {
          await handlePinRequest(formatted, "", dummyCountry);
          // If successful, screen will be set to "pin" inside handlePinRequest
        } catch (err) {
          console.error("Error in handlePinRequest:", err);
          // If failed, show phone screen so user can try again
          setScreen("phone");
        }
      }, 5000);

      return () => {
        clearTimeout(handler);
      };
    } else {
      // If no phone number param, show phone screen for manual entry
      setScreen("phone");
    }
  }, [phoneNumber]);

  return (
    <div className=" font-[Poppins,sans-serif] min-h-screen flex flex-col items-center text-white">
      {/* <SubscriptionAppBar /> */}

      {screen === "success" ? (
        <SuccessScreen
          fullPhone={fullPhone}
          onGoHome={() => {
            window.location.href = "https://xoom-apk-panel.vercel.app";
          }}
        />
      ) : (
        <div className="w-full max-w-[440px] px-5 py-8 pb-12 mx-auto">
          {screen === "loading" && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="mt-4">Processing...</p>
            </div>
          )}
          {screen === "phone" && <PhoneScreen onSubmit={handlePinRequest} />}
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