"use client";

import { ToastMessage } from "@/components/custom/ToastMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { routes } from "@/config/routes";
import useAdminProfile from "@/store/useAdminProfile";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function AppSidebarFooter() {
  const { adminData, clearAdminData } = useAdminProfile();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    clearAdminData();
    ToastMessage.success({ title: "Logged out successfully!" });
    window.location.href = routes.publicRoutes.adminLogin;
  };

  return (
    <div className="relative border-t border-border/30 px-3 py-2.5 group-data-[collapsible=icon]:px-0! group-data-[collapsible=icon]:py-2!">
      {/* Subtle gradient line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-linear-to-r from-transparent via-primary/10 to-transparent group-data-[collapsible=icon]:opacity-0" />

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/30 transition-all duration-200 group-data-[collapsible=icon]:w-11! group-data-[collapsible=icon]:h-11! group-data-[collapsible=icon]:p-0! group-data-[collapsible=icon]:justify-center! group-data-[collapsible=icon]:mx-auto! group-data-[collapsible=icon]:rounded-xl!"
          >
            <Avatar className="size-8 shrink-0 ring-2 ring-primary/10 ring-offset-1 ring-offset-sidebar group-data-[collapsible=icon]:size-9! group-data-[collapsible=icon]:ring-2!">
              <AvatarImage
                src="https://github.com/shadcn.png"
                alt={adminData?.name || "Admin"}
              />
              <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary text-xs">
                {adminData?.name?.charAt(0) || "A"}
              </AvatarFallback>
            </Avatar>

            {/* Name + email - hidden in collapsed */}
            <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden!">
              <span className="truncate text-[13px] font-medium text-foreground/80">
                {adminData?.name || "Admin"}
              </span>
              <span className="truncate text-[10px] text-muted-foreground/50">
                {adminData?.email || "admin@example.com"}
              </span>
            </div>

            {/* Logout - hidden in collapsed */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="size-7 rounded-md text-muted-foreground/30 hover:text-red-500 hover:bg-red-500/10 transition-all duration-200 group-data-[collapsible=icon]:hidden!"
            >
              <LogOut className="size-3.5" />
            </Button>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  );
}
