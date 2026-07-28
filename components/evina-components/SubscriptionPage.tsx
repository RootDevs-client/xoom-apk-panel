"use client";

import {
  getSubscriptionBySession,
  initiateTelcoPin,
  submitTelcoOtp,
} from "@/actions/evina-actions/evinaActions";
import { Evina } from "@/lib/evina/evina";
import { type SubscriptionStep } from "@/lib/evina/types";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ConfirmScreen } from "./ConfirmScreen";
import { PinScreen } from "./PinScreen";
import { SessionExpiredScreen } from "./SessionExpiredScreen";
import { SuccessScreen } from "./SuccessScreen";

export function SubscriptionPage({
  sessionData: propSessionData,
  sessionError: propSessionError,
}: {
  sessionData?: any;
  sessionError?: string;
}) {
  const [screen, setScreen] = useState<SubscriptionStep>("phone");
  const [fullPhone, setFullPhone] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [telcoServiceId, setTelcoServiceId] = useState("");
  const [campaignId, setCampaignId] = useState("");
  const [userAgent, setUserAgent] = useState("");
  const { sessionId } = useParams<{
    sessionId: string;
  }>();

  async function handlePinRequest() {
    const res = await initiateTelcoPin({
      msisdn: fullPhone,
      userTelcoServiceId: telcoServiceId,
      adAgencyCampaignId: campaignId,
      adAgencyCampaignTransactionId: transactionId,
      ua: userAgent,
    });

    if (res?.data?.status !== "Success")
      throw new Error(
        res?.data?.responseMessage || res.message || "PIN request failed",
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

    const res = await submitTelcoOtp({
      otp: pin,
      transactionId: transactionId,
    });

    if (res?.data?.status !== "Success")
      throw new Error(
        res?.data?.responseMessage ||
          res.message ||
          "Incorrect PIN. Please try again.",
      );

    setScreen("success");
  }

  async function handleResend() {
    const res = await initiateTelcoPin({
      msisdn: fullPhone,
      userTelcoServiceId: telcoServiceId,
      adAgencyCampaignId: campaignId,
      adAgencyCampaignTransactionId: transactionId,
      ua: userAgent,
    });

    if (res?.data?.status !== "Success")
      throw new Error(
        res?.data?.responseMessage ||
          res.message ||
          "Failed to resend PIN. Please try again.",
      );
  }
  const sessionTxnId = sessionId || "";
  function processSessionData(data: any) {
    // Normalize: handle both { success, data: { msisdn, ... } } and flat { msisdn, ... }
    const d = data?.data?.msisdn ? data.data : data;

    const msisdn = d?.msisdn || "";
    const responseMessage = d?.evinaResponse?.responseMessage || "";
    const txnId =
      d?.evinaResponse?.transactionId || d?.transactionId || sessionTxnId;

    if (!msisdn || !responseMessage) {
      setError("Invalid session data");
      setScreen("apiError");
      return;
    }

    setTransactionId(txnId);
    setTelcoServiceId(d?.userTelcoServiceId || "");
    setCampaignId(d?.adAgencyCampaignId || "");
    setUserAgent(d?.ua || navigator.userAgent || "Xoom-Webview");

    setFullPhone(msisdn);
    Evina.load(responseMessage);
    setScreen("confirm");
  }

  useEffect(() => {
    if (propSessionError) {
      setError(propSessionError);
      setScreen("sessionExpired");
      return;
    }
    if (propSessionData) {
      setScreen("loading");
      const timer = setTimeout(() => {
        processSessionData(propSessionData);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [propSessionData, propSessionError]);

  useEffect(() => {
    if (sessionId && sessionId.trim() !== "" && !propSessionData && !propSessionError) {
      setScreen("loading");
      getSubscriptionBySession(sessionId)
        .then((res: any) => {
          if (res?.status === true) {
            processSessionData(res?.data?.data);
          } else {
            const msg =
              res.message || "Failed to load subscription";
            setError(msg);
            if (
              msg.toLowerCase().includes("session") ||
              /expir/i.test(msg)
            ) {
              setScreen("sessionExpired");
            } else {
              setScreen("apiError");
            }
          }
        })
        .catch((err: any) => {
          setError(err instanceof Error ? err.message : "An error occurred");
          setScreen("apiError");
        });
      return;
    }
  }, [sessionId, propSessionData, propSessionError]);

  return (
    <div className="font-[Poppins,sans-serif] min-h-screen flex flex-col items-center text-white">
      {screen === "success" ? (
        <SuccessScreen
          fullPhone={fullPhone}
          onGoHome={() => {
            window.location.href = "https://xoom-apk-panel.vercel.app";
          }}
        />
      ) : screen === "sessionExpired" ? (
        <SessionExpiredScreen
          message={error || "Session not found or expired"}
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
          {/* {screen === "phone" && (
            <PhoneScreen onSubmit={handleGetEvinaJs} error={error} />
          )} */}
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
