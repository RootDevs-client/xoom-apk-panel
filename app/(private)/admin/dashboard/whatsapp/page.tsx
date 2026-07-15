"use client";

import { useState } from "react";
import { Smartphone, MessageSquare } from "lucide-react";
import WhatsAppSessionList from "./_components/WhatsAppSessionList";
import ConversationPanel from "./_components/ConversationPanel";

const tabs = [
  { id: "sessions", label: "Channels", icon: Smartphone },
  { id: "conversations", label: "Conversations", icon: MessageSquare },
];

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState("sessions");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "sessions" && <WhatsAppSessionList />}
      {activeTab === "conversations" && <ConversationPanel />}
    </div>
  );
}
