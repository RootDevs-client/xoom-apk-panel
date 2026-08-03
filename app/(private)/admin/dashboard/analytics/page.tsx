import {
  getAdminDashboardAnalytics,
  getDeviceModels,
  getEventAnalytics,
  getUninstallAnalytics,
} from "@/actions/analytics/analyticsActions";
import { BarChart3 } from "lucide-react";
import { Suspense } from "react";
import { DynamicBreadcrumb } from "../settings/_components/DynamicBreadcrumb";
import AnalyticsDateRangeFilter from "./_components/AnalyticsDateRangeFilter";
import { AnalyticsSkeleton } from "./_components/AnalyticsSkeleton";
import { DashboardAnalyticsCards } from "./_components/DashboardAnalyticsCards";

interface Props {
  searchParams: Promise<{ from?: string; to?: string }>;
}

const breadcrumbItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Analytics" },
];

async function AnalyticsContent({ from, to }: { from?: string; to?: string }) {
  const [dashboardResult, deviceModelsResult, uninstallResult, eventResult] =
    await Promise.all([
      getAdminDashboardAnalytics(from, to),
      getDeviceModels(from, to),
      getUninstallAnalytics(from, to),
      getEventAnalytics(from, to),
    ]);

  const dashboardData = dashboardResult?.data ?? null;
  const deviceModels = deviceModelsResult?.data ?? null;
  const uninstallData = uninstallResult?.data ?? null;
  const eventData = eventResult?.data ?? null;

  return (
    <div className="space-y-10">
      {/* Dashboard Analytics */}
      {dashboardData && (
        <DashboardAnalyticsCards
          data={dashboardData}
          deviceModels={deviceModels}
          uninstallData={uninstallData}
          eventData={eventData}
        />
      )}
    </div>
  );
}

export default async function Analytics({ searchParams }: Props) {
  const { from, to } = await searchParams;

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

      <div className="mb-6">
        <Suspense fallback={null}>
          <AnalyticsDateRangeFilter />
        </Suspense>
      </div>

      {/* re-keyed so the skeleton shows again whenever the range changes */}
      <Suspense
        key={`${from ?? ""}-${to ?? ""}`}
        fallback={<AnalyticsSkeleton />}
      >
        <AnalyticsContent from={from} to={to} />
      </Suspense>
    </>
  );
}
