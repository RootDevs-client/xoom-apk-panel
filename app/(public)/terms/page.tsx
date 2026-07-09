import TermsContent from "@/components/terms-policy/terms-content";
import dbConnect from "@/config/database";
import Settings from "@/model/Settings";

export async function generateMetadata() {
  try {
    await dbConnect();
    const settings = await Settings.findOne({}).select("general").lean();
    const appName = settings?.general?.appName || "Xoom Sports";
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
  await dbConnect();
  const doc = await Settings.findOne({})
    .select("termsOfService updatedAt")
    .lean();

  const termsContent = doc?.termsOfService?.content || "";
  const updatedAt = doc?.updatedAt
    ? new Date(doc.updatedAt).toISOString()
    : null;

  return <TermsContent html={termsContent} updatedAtISO={updatedAt} />;
}
