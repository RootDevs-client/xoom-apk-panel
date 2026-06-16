"use client";

import { Button } from "@/components/ui/button";

interface SuccessScreenProps {
  fullPhone: string;
  onGoHome: () => void;
}

export function SuccessScreen({ fullPhone, onGoHome }: SuccessScreenProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center min-h-[calc(100vh-56px)] bg-[#181715]">
      <div className="w-[72px] h-[72px] rounded-full bg-green-500/10 border-2 border-green-500 flex items-center justify-center text-3xl mb-5">
        ✓
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Subscription Active!
      </h2>
      <p className="text-sm text-gray-500 mb-8 leading-relaxed">
        Your Xoom Sports subscription is now active for
        <br />
        <strong className="text-white">{fullPhone}</strong>.<br />
        Charges will appear on your mobile bill.
      </p>
      <Button
        onClick={onGoHome}
        className="max-w-[300px] w-full h-12 bg-red-600 hover:bg-red-700 text-white font-semibold text-base rounded-full"
      >
        Go to Xoom Home →
      </Button>
    </div>
  );
}
