"use client";
import { getGeneralSettings } from "@/actions/settings/settingsActions";
import { MessageCircleMore } from "lucide-react";
import { useEffect, useState } from "react";

export default function AppSidebarHeader() {
  const [appName, setAppName] = useState("Xoom Sports");

  const fetchSettings = () => {
    getGeneralSettings().then((res: any) => {
      if (res?.status && res?.data?.general?.appName) {
        setAppName(res.data.general.appName);
      }
    });
  };

  useEffect(() => {
    fetchSettings();
    window.addEventListener("settings-updated", fetchSettings);
    return () => window.removeEventListener("settings-updated", fetchSettings);
  }, []);

  return (
    <div className="flex h-18 items-center gap-3 px-4 transition-all duration-300 ease-in-out group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
      <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-[0_10px_24px_-10px_rgba(255,100,43,0.8)] transition-transform duration-300 ease-in-out group-data-[collapsible=icon]:scale-110">
        <MessageCircleMore className="size-5" strokeWidth={2.2} />
        <span className="absolute -right-0.5 -top-0.5 size-2.5 rounded-full border-2 border-sidebar bg-emerald-400" />
      </div>

      <div className="grid min-w-0 flex-1 gap-0.5 group-data-[collapsible=icon]:hidden">
        <span className="truncate font-dm-sans text-[17px] font-semibold leading-tight tracking-tight text-foreground">
          {appName}
        </span>
        <span className="truncate text-xs font-medium text-muted-foreground/70">
          Admin Console
        </span>
      </div>
    </div>
  );
}
