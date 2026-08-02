"use client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { type IconType } from "react-icons";
import {
  FaBalanceScale,
  FaShieldAlt,
  FaSlidersH,
} from "react-icons/fa";
import GeneralSettings from "./GeneralSettings";
import PrivacyPolicySettings from "./PrivacyPolicySettings";
import TermsSettings from "./TermsSettings";

interface TabItem {
  id: string;
  label: string;
  description: string;
  icon: IconType;
}

const TABS: TabItem[] = [
  {
    id: "general",
    label: "General",
    description: "Branding, URLs and app flow",
    icon: FaSlidersH,
  },
  {
    id: "privacy",
    label: "Privacy Policy",
    description: "Legal document content",
    icon: FaShieldAlt,
  },
  {
    id: "terms",
    label: "Terms & Conditions",
    description: "Usage terms for the app",
    icon: FaBalanceScale,
  },
];

export default function TabsSettings({
  generalSettings,
  privacySettings,
  termsSettings,
}: any) {
  const [activeTab, setActiveTab] = useState("general");

  const renderContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings general={generalSettings} />;
      case "privacy":
        return <PrivacyPolicySettings privacySettings={privacySettings} />;
      case "terms":
        return <TermsSettings termsSettings={termsSettings} />;
      default:
        return (
          <div>
            <p>No Page</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* ── Sidebar Navigation ─────────────────────────────────────────────── */}
        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-72">
          {/* Mobile nav — equal width, fits any screen */}
          <nav className="lg:hidden">
            <div className="grid grid-cols-3 gap-2">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex min-w-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-all duration-200",
                      isActive
                        ? "border-primary/30 bg-primary/10 text-primary shadow-sm"
                        : "border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="w-full truncate text-center">
                      {tab.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Desktop sidebar */}
          <nav className="hidden lg:block">
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
              <div className="border-b border-border/60 px-5 py-4">
                <p className="text-sm font-semibold text-foreground">
                  Settings
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Manage your application
                </p>
              </div>
              <div className="space-y-1 p-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "group relative flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {/* Active indicator bar */}
                      <span
                        className={cn(
                          "absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200",
                          isActive
                            ? "opacity-100"
                            : "opacity-0 group-hover:opacity-40",
                        )}
                      />
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "bg-muted text-muted-foreground group-hover:bg-border/60 group-hover:text-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {tab.label}
                        </span>
                        <span
                          className={cn(
                            "block truncate text-xs transition-colors",
                            isActive
                              ? "text-primary/70"
                              : "text-muted-foreground/70",
                          )}
                        >
                          {tab.description}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </aside>

        {/* ── Content Area ───────────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1">{renderContent()}</main>
      </div>
    </div>
  );
}
