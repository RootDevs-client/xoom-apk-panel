import { Users } from "lucide-react";
import StatCard from "./StatCard";

interface StatsData {
  total: number;
  active: number;
  inactive: number;
}

const DashboardStats = ({ statsData }: { statsData: StatsData }) => {
  return (
    <div className="w-full p-4 min-h-screen">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          Dashboard Overview
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Subscribe"
            icon={Users}
            total={statsData?.total || 0}
            active={statsData?.active || 0}
            inactive={statsData?.inactive || 0}
            gradient="from-blue-500 to-cyan-500"
            bgLight="bg-blue-50"
            bgDark="dark:bg-blue-950/30"
            iconColor="text-blue-600 dark:text-blue-400"
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
