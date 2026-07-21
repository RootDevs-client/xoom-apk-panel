import { routes } from "@/config/routes";
import {
  BarChart3,
  Cable,
  Hash,
  LayoutDashboard,
  MessageCircle,
  Newspaper,
  Settings2,
  Tags,
  User,
} from "lucide-react";
import { FaFootball } from "react-icons/fa6";

export const adminDashboardMenu = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "Xoom Sports",
      logo: FaFootball,
      // plan: "Enterprise",
    },
  ],
  navMain: [
    {
      title: "Dashboard",
      url: routes.privateRoutes.admin.dashboard,
      icon: LayoutDashboard,
    },

    {
      title: "Categories",
      url: routes.privateRoutes.admin.categories,
      icon: Tags,
    },
    {
      title: "Topics",
      url: routes.privateRoutes.admin.topics,
      icon: Hash,
    },
    {
      title: "News",
      url: routes.privateRoutes.admin.news,
      icon: Newspaper,
    },
    {
      title: "Operators",
      url: routes.privateRoutes.admin.operators,
      icon: Cable,
    },
    {
      title: "WhatsApp",
      url: routes.privateRoutes.admin.whatsapp,
      icon: MessageCircle,
    },
    {
      title: "Subscription",
      url: routes.privateRoutes.admin.subscription,
      icon: User,
    },
    {
      title: "Analytics",
      url: routes.privateRoutes.admin.analytics,
      icon: BarChart3,
    },
    {
      title: "Settings",
      url: routes.privateRoutes.admin.settings,
      icon: Settings2,
    },
  ],
};
