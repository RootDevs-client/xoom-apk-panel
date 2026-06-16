"use client";

interface SubscriptionAppBarProps {
  title?: string;
}

export function SubscriptionAppBar({
  title = "Xoom Sports",
}: SubscriptionAppBarProps) {
  return (
    <div className="w-full bg-red-600 h-14 flex items-center px-4 sticky top-0 z-50">
      <span className="text-lg font-semibold text-white">{title}</span>
    </div>
  );
}
