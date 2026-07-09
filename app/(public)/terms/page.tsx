import { getOpenSettings } from "@/actions/settings/settingsActions";
import TermsContent from "@/components/terms-policy/terms-content";

export async function generateMetadata() {
  try {
    const setting = await getOpenSettings();
    const appName = setting?.data?.appName || "Xoom Sports";
    return {
      title: `Terms & Conditions | ${appName}`,
      description: `Read the terms and conditions for using ${appName}.`,
    };
  } catch {
    return {
      title: "Terms & Conditions | Xoom Sports",
      description: "Read our terms and conditions.",
    };
  }
}

export default async function TermsPage() {
  const setting = await getOpenSettings();
  console.log("terms", setting);

  const termsContent = setting?.data?.termsOfService || "";
  const updatedAt = setting?.data?.updatedAt || null;

  return <TermsContent html={termsContent} updatedAtISO={updatedAt} />;
}
