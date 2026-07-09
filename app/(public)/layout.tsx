import { getOpenSettings } from "@/actions/settings/settingsActions";
import { prependAwsBaseUrl } from "@/lib/server.utils";
import type React from "react";
import PublicFooter from "./_components/PublicFooter";
import PublicNavbar from "./_components/PublicNavbar";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const setting = await getOpenSettings();

  const appName = setting?.data?.appName || "Xoom Sports";
  const rawLogo = setting?.data?.appLogo;
  const appLogo = rawLogo ? prependAwsBaseUrl(rawLogo) : null;
  const companyName = setting?.data?.companyName || appName;
  const aboutUs = setting?.data?.aboutUs || "";
  const supportEmail = setting?.data?.supportEmail || "";
  const companyAddress = setting?.data?.companyAddress || "";

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
