"use client";

import { ColumnDef } from "@tanstack/react-table";
import moment from "moment-timezone";
import Image from "next/image";
import DeleteCategoryCell from "./DeleteCategoryCell";
import EditCategoryCell from "./EditCategoryCell";

export type Category = {
  _id: string;
  name: string;
  slug: string;
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
}): ColumnDef<Category>[] => [
  {
    accessorKey: "icon",
    header: "Icon",
    cell: ({ row }) =>
      row.original.icon ? (
        <Image
          src={row.original.icon}
          alt={row.original.name}
          width={40}
          height={40}
          className="h-10 w-10 rounded object-cover"
        />
      ) : (
        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
          N/A
        </div>
      ),
  },
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
