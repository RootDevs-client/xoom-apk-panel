import { getNewsById } from "@/actions/news/newsActions";
import { notFound } from "next/navigation";
import { DynamicBreadcrumb } from "../../../settings/_components/DynamicBreadcrumb";
import NewsForm from "../../_components/NewsForm";

interface Props {
  params: Promise<{ id: string }>;
}

const breadcrumbItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "News", href: "/admin/dashboard/news" },
  { label: "Edit News" },
];

export default async function EditNewsPage({ params }: Props) {
  const { id } = await params;
  const res = await getNewsById(id);

  if (!res?.status || !res?.data) {
    notFound();
  }

  const news = res.data;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-dm-sans font-medium text-lg">Edit News</h2>
        <DynamicBreadcrumb items={breadcrumbItems} />
      </div>
      <NewsForm
        mode="edit"
        initialData={{
          _id: news._id,
          title: news.title,
          description: news.description,
          image: news.image,
          categories: news.categories,
          topics: news.topics,
          publishedDate: news.publishedDate,
        }}
      />
    </div>
  );
}
