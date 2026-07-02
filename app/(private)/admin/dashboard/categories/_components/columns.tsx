"use client";

import { ColumnDef } from "@tanstack/react-table";
import moment from "moment-timezone";
import DeleteCategoryCell from "./DeleteCategoryCell";
import EditCategoryCell from "./EditCategoryCell";

export type Category = {
  _id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

const formatDate = (date: string) => {
  return moment(date)
    .tz("Asia/Dhaka")
    .format("DD MMM YYYY, HH:mm [hrs]");
};

export const columns = ({
  onSuccess,
}: {
  onSuccess: () => void;
}): ColumnDef<Category>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "slug",
    header: "Slug",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <EditCategoryCell row={row.original} onSuccess={onSuccess} />
        <DeleteCategoryCell row={row.original} onSuccess={onSuccess} />
      </div>
    ),
  },
];
