import { DynamicBreadcrumb } from "../../settings/_components/DynamicBreadcrumb";
import NewsForm from "../_components/NewsForm";

const breadcrumbItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "News", href: "/admin/dashboard/news" },
  { label: "Create News" },
];

export default function CreateNewsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-dm-sans font-medium text-lg">Create News</h2>
        <DynamicBreadcrumb items={breadcrumbItems} />
      </div>
      <NewsForm mode="create" />
    </div>
  );
}
