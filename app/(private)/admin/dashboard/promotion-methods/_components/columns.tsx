"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import moment from "moment-timezone";
import DeletePromotionMethodCell from "./DeletePromotionMethodCell";
import EditPromotionMethodCell from "./EditPromotionMethodCell";

export type PromotionMethod = {
  _id: string;
  operator: string;
  promotional: boolean;
  non_promotional: boolean;
  is_active: boolean;
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
}): ColumnDef<PromotionMethod>[] => [
  {
    accessorKey: "operator",
    header: "Operator",
  },
  {
    accessorKey: "promotional",
    header: "Promotional",
    cell: ({ row }) => (
      <Badge variant={row.original.promotional ? "default" : "secondary"}>
        {row.original.promotional ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "non_promotional",
    header: "Non-Promotional",
    cell: ({ row }) => (
      <Badge variant={row.original.non_promotional ? "default" : "secondary"}>
        {row.original.non_promotional ? "Yes" : "No"}
      </Badge>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Active",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "destructive"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
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
        <EditPromotionMethodCell row={row.original} onSuccess={onSuccess} />
        <DeletePromotionMethodCell row={row.original} onSuccess={onSuccess} />
      </div>
    ),
  },
];
