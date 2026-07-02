"use client";

import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { useRouter } from "next/navigation";
import { type NewsItem } from "./columns";

interface Props {
  row: NewsItem;
  onSuccess: () => void;
}

export default function EditNewsCell({ row }: Props) {
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8 text-xs"
      onClick={() => router.push(`/admin/dashboard/news/edit/${row._id}`)}
    >
      <Edit className="size-4" />
    </Button>
  );
}
