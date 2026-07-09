"use client";
import { useState } from "react";
import { FaBalanceScale, FaShieldAlt, FaSlidersH } from "react-icons/fa";
import GeneralSettings from "./GeneralSettings";
import PrivacyPolicySettings from "./PrivacyPolicySettings";
import TermsSettings from "./TermsSettings";

export default function TabsSettings({
  generalSettings,
  privacySettings,
  termsSettings,
}: any) {
  const [activeTab, setActiveTab] = useState("general");
  const tabs = [
    { id: "general", label: "General", icon: FaSlidersH },
    { id: "privacy", label: "Privacy Policy", icon: FaShieldAlt },
    { id: "terms", label: "Terms & Conditions", icon: FaBalanceScale },
  ];

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
            {" "}
            <p>No Page </p>
          </div>
        );
    }
  };
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Tab Bar */}
          <div className="flex lg:hidden justify-between gap-1 bg-white dark:bg-gray-800 rounded-lg shadow p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  title={tab.label}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center justify-center px-4 py-2 rounded-sm transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-primary dark:hover:bg-primary hover:text-white"
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Icon className="h-4 w-4" />
                    <span className="text-[11px]">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Sidebar Navigation - Desktop */}
          <aside className="hidden lg:block lg:w-72 shrink-0">
            <nav className="space-y-1 bg-white dark:bg-gray-800 rounded-lg shadow p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-sm text-left transition-colors cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-primary text-white"
                        : "text-gray-700 dark:text-gray-300 hover:bg-primary dark:hover:bg-primary hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Content Area */}
          <main className="flex-1">{renderContent()}</main>
        </div>
      </div>
    </div>
  );
}
