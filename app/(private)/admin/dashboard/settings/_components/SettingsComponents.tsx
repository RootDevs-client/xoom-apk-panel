import { getGeneralSettings } from "@/actions/settings/settingsActions";
import { Settings } from "lucide-react";
import { DynamicBreadcrumb } from "./DynamicBreadcrumb";
import TabsSettings from "./TabsSettings";

const breadcrumbItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "General Setting" },
];

export default async function SettingsComponents() {
  const [generalSettings] = await Promise.all([
    getGeneralSettings(),
  ]);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <Settings className="size-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-foreground">
              Settings
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Manage your application configuration
            </p>
          </div>
        </div>
        <DynamicBreadcrumb items={breadcrumbItems} />
      </div>

      <TabsSettings
        generalSettings={generalSettings?.data?.general || {}}
        privacySettings={{ content: generalSettings?.data?.general?.privacyPolicy || "" }}
        termsSettings={{ content: generalSettings?.data?.general?.termsOfService || "" }}
      />
    </div>
  );
}
