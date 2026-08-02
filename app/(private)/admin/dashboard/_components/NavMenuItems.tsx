"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { cn, isRouteActive } from "@/lib/utils";

export interface NavItem {
  title: string;
  url?: string;
  icon?: React.ElementType;
  items?: NavItem[];
}

export interface NavSection {
  label: string;
  items: NavItem[];
}

const linkClasses = (isActive: boolean) =>
  cn(
    "font-dm-sans h-10 gap-2.5 rounded-xl px-2.5 text-[13.5px] font-medium",
    "transition-all duration-200 ease-in-out hover:translate-x-0.5",
    "group-data-[collapsible=icon]:hover:translate-x-0",
    isActive
      ? "bg-primary text-white shadow-[0_8px_20px_-8px_rgba(255,100,43,0.6)] hover:bg-primary hover:text-white"
      : "text-foreground/70 hover:bg-primary/10 hover:text-primary",
  );

function SidebarItem({ item }: { item: NavItem }) {
  const pathname = usePathname();

  const hasChildren = !!(item.items && item.items.length > 0);

  const isActive = !!(item.url && isRouteActive(pathname, item.url));

  const isChildActive =
    hasChildren &&
    item.items!.some(
      (child) => child.url && isRouteActive(pathname, child.url),
    );

  const isParentActive = isActive || isChildActive;

  if (hasChildren) {
    return (
      <Collapsible defaultOpen={isChildActive} className="group/collapsible">
        <CollapsibleTrigger asChild>
          <SidebarMenuButton tooltip={item.title} className={linkClasses(isParentActive)}>
            {item.icon && (
              <item.icon className="size-5 shrink-0" strokeWidth={2} />
            )}
            <span className="flex-1 truncate">{item.title}</span>
            <ChevronRight
              strokeWidth={2}
              className={cn(
                "ml-auto size-4! shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90",
                isParentActive
                  ? "text-white"
                  : "text-muted-foreground/50 group-data-[state=open]/collapsible:text-primary",
              )}
            />
          </SidebarMenuButton>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <SidebarMenuSub className="ml-3.5 mt-1 space-y-0.5 border-l border-primary/15 px-2.5 py-1">
            {item.items?.map((sub) => {
              const subActive =
                !!sub.url && isRouteActive(pathname, sub.url);
              return (
                <SidebarMenuSubItem key={sub.title}>
                  <SidebarMenuSubButton asChild isActive={subActive}>
                    <Link
                      href={sub.url!}
                      className={cn(
                        "font-dm-sans h-9 rounded-lg px-3 text-[13px] font-medium transition-all duration-200",
                        "hover:translate-x-0.5",
                        subActive
                          ? "bg-primary/10 font-semibold text-primary"
                          : "text-foreground/60 hover:bg-primary/5 hover:text-primary",
                      )}
                    >
                      {sub.title}
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              );
            })}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <SidebarMenuButton asChild tooltip={item.title} className={linkClasses(isActive)}>
      <Link href={item.url!}>
        {item.icon && <item.icon className="size-5 shrink-0" strokeWidth={2} />}
        <span className="flex-1 truncate">{item.title}</span>
      </Link>
    </SidebarMenuButton>
  );
}

function SidebarSection({ section }: { section: NavSection }) {
  return (
    <SidebarGroup className="px-1 py-0">
      <SidebarGroupLabel className="mb-2 h-5 px-3 text-[10.5px] font-semibold uppercase tracking-widest text-muted-foreground/45 group-data-[collapsible=icon]:mt-0 group-data-[collapsible=icon]:mb-0 group-data-[collapsible=icon]:h-0">
        {section.label}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="gap-1">
          {section.items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarItem item={item} />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export default function NavMenuItems({ sections }: { sections: NavSection[] }) {
  return (
    <div className="flex flex-col gap-5 px-2 py-1">
      {sections.map((section) => (
        <SidebarSection key={section.label} section={section} />
      ))}
    </div>
  );
}
