import { Suspense } from "react";
import {
  getAdminDashboardAnalytics,
  getSubscribeAnalytics,
} from "@/actions/analytics/analyticsActions";
import { BarChart3 } from "lucide-react";
import { DynamicBreadcrumb } from "../settings/_components/DynamicBreadcrumb";
import { DashboardAnalyticsCards } from "./_components/DashboardAnalyticsCards";
import { AnalyticsSkeleton } from "./_components/AnalyticsSkeleton";

const breadcrumbItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Analytics" },
];

async function AnalyticsContent() {
  const [subscribeResult, dashboardResult] = await Promise.all([
    getSubscribeAnalytics(),
    getAdminDashboardAnalytics(),
  ]);

  const subscribeData = subscribeResult?.data ?? null;
  const dashboardData = dashboardResult?.data ?? null;

  return (
    <div className="space-y-10">
      {/* Dashboard Analytics */}
      {dashboardData && <DashboardAnalyticsCards data={dashboardData} />}
    </div>
  );
}

export default function Analytics() {
  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-linear-to-br from-primary/20 to-primary/5 shadow-sm">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Dashboard Analytics</h3>
            <DynamicBreadcrumb items={breadcrumbItems} />
          </div>
        </div>
      </div>

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsContent />
      </Suspense>
    </>
  );
}
