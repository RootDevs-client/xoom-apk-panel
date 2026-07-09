import dbConnect from "@/config/database";
import { prependAwsBaseUrl } from "@/lib/server.utils";
import Settings from "@/model/Settings";
import type React from "react";
import PublicFooter from "./_components/PublicFooter";
import PublicNavbar from "./_components/PublicNavbar";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await dbConnect();
  const doc = await Settings.findOne({}).select("general").lean();

  const appName = doc?.general?.appName || "Xoom Sports";
  const rawLogo = doc?.general?.appLogo;
  const appLogo = rawLogo ? prependAwsBaseUrl(rawLogo) : null;
  const companyName = doc?.general?.companyName || appName;
  const aboutUs = doc?.general?.aboutUs || "";
  const supportEmail = doc?.general?.supportEmail || "";
  const companyAddress = doc?.general?.companyAddress || "";

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 antialiased selection:bg-primary selection:text-white font-dmSans">
      <PublicNavbar appName={appName} appLogo={appLogo} />
      <main className="grow">{children}</main>
      <PublicFooter
        appName={appName}
        appLogo={appLogo}
        companyName={companyName}
        aboutUs={aboutUs}
        supportEmail={supportEmail}
        companyAddress={companyAddress}
      />
    </div>
  );
}
