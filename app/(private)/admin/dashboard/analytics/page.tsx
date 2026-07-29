import { getSubscribeAnalytics } from "@/actions/analytics/analyticsActions";
import { DynamicBreadcrumb } from "../settings/_components/DynamicBreadcrumb";
import { SubscriptionAnalyticsDashboard } from "./_components/SubscriptionAnalyticsDashboard";

const breadcrumbItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Analytics" },
];
export default async function Analytics() {
  const result = await getSubscribeAnalytics();

  const data = result?.data ?? null;

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-col flex-1 gap-2">
          <div className="mb-2 flex items-start justify-between flex-wrap space-y-2">
            <div>
              <h2 className="font-dm-sans font-medium text-lg">
                Subscription Analytics
              </h2>
              <DynamicBreadcrumb items={breadcrumbItems} />
            </div>
          </div>
        </div>
      </div>

      <div className="">
        <SubscriptionAnalyticsDashboard data={data} />
      </div>
    </>
  );
}
