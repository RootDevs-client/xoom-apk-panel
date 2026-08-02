"use client";

import { ToastMessage } from "@/components/custom/ToastMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { routes } from "@/config/routes";
import useAdminProfile from "@/store/useAdminProfile";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { useSidebar } from "@/components/ui/sidebar";

export default function AppSidebarFooter() {
  const { adminData, clearAdminData } = useAdminProfile();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const handleLogout = async () => {
    await signOut({ redirect: false });
    clearAdminData();
    ToastMessage.success({ title: "Logged out successfully!" });
    window.location.href = routes.publicRoutes.adminLogin;
  };

  return (
    <div className="relative border-t border-border/30 px-3 py-2.5 transition-all duration-200 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:py-2">
      {/* Subtle gradient line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-linear-to-r from-transparent via-primary/10 to-transparent group-data-[collapsible=icon]:opacity-0" />

      <div className="flex w-full items-center gap-2.5 rounded-xl p-1.5 transition-all duration-200 group-data-[collapsible=icon]:mx-auto group-data-[collapsible=icon]:w-fit group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-default">
              <Avatar className="size-8 shrink-0 ring-2 ring-primary/10 ring-offset-1 ring-offset-sidebar">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt={adminData?.name || "Admin"}
                />
                <AvatarFallback className="bg-primary/10 text-xs font-bold text-primary">
                  {adminData?.name?.charAt(0) || "A"}
                </AvatarFallback>
              </Avatar>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" align="center" hidden={!isCollapsed}>
            {adminData?.name || "Admin"}
          </TooltipContent>
        </Tooltip>

        {/* Name + email - hidden in collapsed */}
        <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
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
          className="size-7 rounded-md text-muted-foreground/30 transition-all duration-200 hover:bg-red-500/10 hover:text-red-500 group-data-[collapsible=icon]:hidden"
        >
          <LogOut className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
