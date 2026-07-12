import type React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 antialiased selection:bg-primary selection:text-white font-dmSans">
      <main className="grow">{children}</main>
    </div>
  );
}
