"use client";

import { ColumnDef } from "@tanstack/react-table";
import moment from "moment-timezone";
import { Badge } from "@/components/ui/badge";
import DeletePromotionCell from "./DeletePromotionCell";
import EditPromotionCell from "./EditPromotionCell";

export type PromotionCategory = {
  _id: string;
  operator: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

const formatDate = (date: string) => {
  return moment(date).tz("Asia/Dhaka").format("DD MMM YYYY, HH:mm [hrs]");
};

export const columns = ({
  onSuccess,
}: {
  onSuccess: () => void;
}): ColumnDef<PromotionCategory>[] => [
  {
    accessorKey: "operator",
    header: "Operator",
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "secondary"}>
        {row.original.isActive ? "Active" : "Inactive"}
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
        <EditPromotionCell row={row.original} onSuccess={onSuccess} />
        <DeletePromotionCell row={row.original} onSuccess={onSuccess} />
      </div>
    ),
  },
];
