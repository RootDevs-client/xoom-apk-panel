"use client";

import { useState } from "react";
import { Smartphone, MessageSquare, MessageCircle, MessagesSquare } from "lucide-react";
import WhatsAppSessionList from "./_components/WhatsAppSessionList";
import ConversationPanel from "./_components/ConversationPanel";
import MetaChannelList from "./_components/MetaChannelList";
import MetaConversationPanel from "./_components/MetaConversationPanel";

const tabs = [
  { id: "sessions", label: "Baileys Channels", icon: Smartphone },
  { id: "conversations", label: "Baileys Conversations", icon: MessageSquare },
  { id: "meta", label: "Meta Connection", icon: MessageCircle },
  { id: "meta-convos", label: "Meta Conversations", icon: MessagesSquare },
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
      {activeTab === "conversations" && <ConversationPanel />}
      {activeTab === "meta" && <MetaChannelList />}
      {activeTab === "meta-convos" && <MetaConversationPanel />}
    </div>
  );
}
