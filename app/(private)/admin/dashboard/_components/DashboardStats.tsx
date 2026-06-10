import { Users } from "lucide-react";
import StatCard from "./StatCard";

interface StatsData {
  total: number;
  active: number;
  inactive: number;
  featured: number;
}

const DashboardStats = ({ statsData }: { statsData: StatsData }) => {
  const statCards = [
    {
      title: "Subscribe",
      icon: Users,
      data: statsData || "",
      gradient: "from-blue-500 to-cyan-500",
      bgLight: "bg-blue-50",
      bgDark: "dark:bg-blue-950/30",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
  ];
  return (
    <div className="w-full p-4  min-h-screen">
      <div className="">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Dashboard Overview
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((card, index) => (
            <StatCard
              key={index}
              title={card.title}
              icon={card.icon}
              total={card.data.total}
              active={card.data.active}
              inactive={card.data.inactive}
              featured={card.data?.featured}
              gradient={card.gradient}
              bgLight={card.bgLight}
              bgDark={card.bgDark}
              iconColor={card.iconColor}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
