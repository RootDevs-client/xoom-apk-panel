import { getAdminDashboardAnalytics } from "@/actions/analytics/analyticsActions";
import { getDashboardStats } from "@/actions/dashboard/dashboardActions";
import { Suspense } from "react";
import { DashboardAnalyticsOverview } from "./_components/DashboardAnalyticsOverview";

async function DashboardContent() {
  const [stats, analyticsResult] = await Promise.all([
    getDashboardStats(),
    getAdminDashboardAnalytics(),
  ]);

  const analyticsData = analyticsResult?.data ?? null;

  return (
    <>
      {/* <DashboardStats statsData={stats?.data || {}} /> */}

      {analyticsData && (
        <div className="px-4 pb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
            Devices & Downloads
          </h2>
          <DashboardAnalyticsOverview data={analyticsData} />
        </div>
      )}
    </>
  );
}

function DashboardFallback() {
  return (
    <div className="w-full p-4 min-h-screen space-y-6">
      {/* Existing stats skeleton */}
      <div>
        <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(1)].map((_, i) => (
            <div
              key={i}
              className="h-44 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </div>

      {/* Devices & Downloads skeleton */}
      <div className="px-4">
        <div className="h-7 w-48 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
