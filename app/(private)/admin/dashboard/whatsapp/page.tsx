"use client";

import { MessagesSquare, Radio, Smartphone } from "lucide-react";
import { useState } from "react";
import ChannelMessagePanel from "./_components/ChannelMessagePanel";
import WhatsAppChannelList from "./_components/WhatsAppChannelList";
import WhatsAppSessionList from "./_components/WhatsAppSessionList";

const tabs = [
  { id: "sessions", label: "Baileys Channels", icon: Smartphone },
  { id: "channels", label: "Channels", icon: Radio },
  // { id: "conversations", label: "Baileys Conversations", icon: MessageSquare },
  { id: "channel-messages", label: "Channel Messages", icon: MessagesSquare },
];

export default function WhatsAppPage() {
  const [activeTab, setActiveTab] = useState("sessions");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-1 border-b overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
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
      {activeTab === "channels" && <WhatsAppChannelList />}
      {/* {activeTab === "conversations" && <ConversationPanel />} */}
      {activeTab === "channel-messages" && <ChannelMessagePanel />}
    </div>
  );
}
