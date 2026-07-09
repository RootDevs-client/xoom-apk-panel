import { getGeneralSettings, getPrivacyPolicy, getTerms } from "@/actions/settings/settingsActions";
import { DynamicBreadcrumb } from "./DynamicBreadcrumb";
import TabsSettings from "./TabsSettings";

const breadcrumbItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "General Setting" },
];

export default async function SettingsComponents() {
  const [generalSettings, privacySettings, termsSettings] = await Promise.all([
    getGeneralSettings(),
    getPrivacyPolicy(),
    getTerms(),
  ]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-3 font-bold">Settings</h1>
          <DynamicBreadcrumb items={breadcrumbItems} />
        </div>
      </div>

      <TabsSettings
        generalSettings={generalSettings?.data || {}}
        privacySettings={privacySettings?.data || {}}
        termsSettings={termsSettings?.data || {}}
      />
    </div>
  );
}
