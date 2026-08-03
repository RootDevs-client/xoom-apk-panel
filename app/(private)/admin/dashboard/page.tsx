import { getAdminDashboardAnalytics } from "@/actions/analytics/analyticsActions";
import { getDashboardStats } from "@/actions/dashboard/dashboardActions";
import { Suspense } from "react";
import { DashboardAnalyticsOverview } from "./_components/DashboardAnalyticsOverview";
import { DashboardShimmerLoader } from "./_components/DashboardShimmerLoader";

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

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardShimmerLoader />}>
      <DashboardContent />
    </Suspense>
  );
}
