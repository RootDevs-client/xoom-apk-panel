"use client";

import { ColumnDef } from "@tanstack/react-table";
import moment from "moment-timezone";
import Image from "next/image";
import DeleteNewsCell from "./DeleteNewsCell";
import EditNewsCell from "./EditNewsCell";

export type NewsItem = {
  _id: string;
  title: string;
  description: string;
  image?: string;
  categories: { _id: string; name: string; slug: string }[];
  topics: string[];
  publishedDate: string;
  createdAt: string;
  updatedAt: string;
  icon?: string;
};

const formatDate = (date: string) => {
  return moment(date).tz("Asia/Dhaka").format("DD MMM YYYY, HH:mm [hrs]");
};

export const columns = ({
  onSuccess,
}: {
  onSuccess: () => void;
}): ColumnDef<NewsItem>[] => [
  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) =>
      row.original.icon ? (
        <div className="max-w-xs truncate font-medium">
          <Image
            src={row.original.icon}
            alt="Icon"
            width={50}
            height={50}
            className="object-contain w-12 h-12"
          />
        </div>
      ) : (
        ""
      ),
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="max-w-xs truncate font-medium">{row.original.title}</div>
    ),
  },
  {
    accessorKey: "categories",
    header: "Categories",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.categories?.map((cat) => (
          <span
            key={cat._id}
            className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {cat.name}
          </span>
        ))}
      </div>
    ),
  },
  {
    accessorKey: "topics",
    header: "Topics",
    cell: ({ row }) => (
      <div className="flex flex-wrap gap-1">
        {row.original.topics?.length ? (
          row.original.topics.map((topic, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
            >
              {topic}
            </span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "publishedDate",
    header: "Published",
    cell: ({ row }) => formatDate(row.original.publishedDate),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <EditNewsCell row={row.original} onSuccess={onSuccess} />
        <DeleteNewsCell row={row.original} onSuccess={onSuccess} />
      </div>
    ),
  },
];
