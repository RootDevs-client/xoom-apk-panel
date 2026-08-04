"use client";

import { MessagesSquare, Radio, Smartphone } from "lucide-react";
import { useState } from "react";
import ChannelMessagePanel from "./_components/ChannelMessagePanel";
import WhatsAppChannelList from "./_components/WhatsAppChannelList";
import WhatsAppSessionList from "./_components/WhatsAppSessionList";

const tabs = [
  { id: "sessions", label: "Connected Devices", icon: Smartphone },
  { id: "channels", label: "Channels", icon: Radio },
  // { id: "conversations", label: "Baileys Conversations", icon: MessageSquare },
  { id: "channel-messages", label: "Channel Messages", icon: MessagesSquare },
];

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState("sessions");

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-1 border-b sm:flex sm:items-center sm:gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center gap-1 px-2 py-3 text-xs font-medium leading-tight text-center border-b-2 -mb-px transition-colors cursor-pointer sm:flex-row sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm sm:whitespace-nowrap ${
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="size-5 sm:size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "sessions" && <WhatsAppSessionList />}
      {activeTab === "channels" && <WhatsAppChannelList />}
      {/* {activeTab === "conversations" && <ConversationPanel />} */}
      {activeTab === "channel-messages" && <ChannelMessagePanel />}
    </div>
  );
}
