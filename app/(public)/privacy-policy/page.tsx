import { getOpenSettings } from "@/actions/settings/settingsActions";
import PrivacyContent from "@/components/terms-policy/privacy-content";
import dbConnect from "@/config/database";
import Settings from "@/model/Settings";

export async function generateMetadata() {
  try {
    await dbConnect();
    const settings = await Settings.findOne({}).select("general").lean();
    const appName = settings?.general?.appName || "Xoom Sports";
    return {
      title: `Privacy Policy | ${appName}`,
      description: `Read the privacy policy for ${appName} to understand how we collect, use, and protect your personal information.`,
    };
  } catch {
    return {
      title: "Privacy Policy | Xoom Sports",
      description: "Read our privacy policy.",
    };
  }
}

export default async function PrivacyPolicyPage() {
  const setting = await getOpenSettings();

  console.log("settings", setting);

  const privacyContent = setting?.data?.privacyPolicy || "";
  const updatedAt = setting?.data?.updatedAt
    ? new Date(setting.data.updatedAt).toISOString()
    : null;

  return <PrivacyContent html={privacyContent} updatedAtISO={updatedAt} />;
}
