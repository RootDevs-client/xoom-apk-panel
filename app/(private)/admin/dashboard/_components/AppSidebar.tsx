"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { adminDashboardMenu } from "@/public/sample-data/navitems-data";
import AppSidebarFooter from "./AppSidebarFooter";
import AppSidebarHeader from "./AppSidebarHeader";
import NavMenuItems from "./NavMenuItems";

export default function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-0">
        <AppSidebarHeader />
      </SidebarHeader>
      <SidebarContent className="sidebar-scroll overflow-x-hidden px-0">
        <NavMenuItems sections={adminDashboardMenu.navSections} />
      </SidebarContent>
      <SidebarFooter className="p-0">
        <AppSidebarFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
