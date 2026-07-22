"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ConfirmScreenProps {
  fullPhone: string;
  onConfirm: () => void;
}

export function ConfirmScreen({ fullPhone, onConfirm }: ConfirmScreenProps) {
  return (
    <Card className="w-full max-w-md mx-auto border-[#333230] bg-[#181818]">
      <CardHeader className="space-y-2 text-center">
        <CardTitle className="text-2xl font-bold text-white">
          Confirm Subscription
        </CardTitle>
        <CardDescription className="text-sm text-gray-500 leading-relaxed">
          You are subscribing for
          <br />
          <strong className="text-white">{fullPhone}</strong>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          id="Confirm"
          onClick={onConfirm}
          className="w-full h-12 bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-semibold text-base rounded-full transition-all"
        >
          Confirm
        </Button>
      </CardContent>
    </Card>
  );
}
