import { getOpenSettings } from "@/actions/settings/settingsActions";
import ToasterComponents from "@/components/custom/ToasterComponents";
import AuthSessionProvider from "@/providers/AuthSessionProvider";
import { DM_Sans, Urbanist } from "next/font/google";
import type { Metadata } from "next/types";
import "./globals.css";

const dmSans = DM_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

const urbanist = Urbanist({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-urbanist",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const setting = await getOpenSettings();
    const appName = setting?.data?.appName || "Xoom Sports";
    const aboutUs = setting?.data?.aboutUs || `Welcome to ${appName}`;
    return {
      title: appName,
      description: aboutUs,
    };
  } catch {
    return {
      title: "Xoom Sports",
      description: "Welcome to Xoom Sports",
    };
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${urbanist.className} ${dmSans.variable}`}
        suppressHydrationWarning
      >
        <AuthSessionProvider>
          {children}
          <ToasterComponents />
        </AuthSessionProvider>
      </body>
    </html>
  );
}
