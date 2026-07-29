"use client";
import { getGeneralSettings } from "@/actions/settings/settingsActions";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { MessageCirclePlus } from "lucide-react";
import { useEffect, useState } from "react";

export default function AppSidebarHeader({ teams }: any) {
  const [appName, setAppName] = useState(teams[0]?.name || "Xoom Sports");

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
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="hover:bg-transparent  active:bg-transparent hover:shadow-none hover:text-black dark:hover:text-white active:text-black"
        >
          <div className="bg-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-sm  ">
            <MessageCirclePlus className="size-6" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight ">
            <span className="truncate text-[24px] font-bold font-dm-sans">
              {appName}
            </span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
