"use client";

import { ColumnDef } from "@tanstack/react-table";
import moment from "moment-timezone";
import DeleteTopicCell from "./DeleteTopicCell";
import EditTopicCell from "./EditTopicCell";

export type Topic = {
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
}): ColumnDef<Topic>[] => [
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
        <EditTopicCell row={row.original} onSuccess={onSuccess} />
        <DeleteTopicCell row={row.original} onSuccess={onSuccess} />
      </div>
    ),
  },
];
