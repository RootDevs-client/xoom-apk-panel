"use client";

import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment-timezone";
import { CancelSubscriptionCell } from "./CancelSubscriptionCell";

// Define the type based on API response
export type Subscribe = {
  _id: string;
  phone: string;
  reference: string;
  platform: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
};

const formatDate = (date: string) => {
  return moment(date)
    .tz("Asia/Dhaka") // 🇧🇩 your timezone
    .format("DD MMM YYYY, HH:mm [hrs]");
};
export const columns: ColumnDef<Subscribe>[] = [
  {
    accessorKey: "phone",
    header: "Phone Number",
  },
  {
    accessorKey: "reference",
    header: "Reference",
  },
  {
    accessorKey: "platform",
    header: "Platform",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
  {
    accessorKey: "updatedAt",
    header: "Updated At",
    cell: ({ row }) => formatDate(row.original.updatedAt),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      return (
        <Badge
          variant={`outline`}
          className={`px-2 py-1  text-sm font-medium ${
            status ? " text-green-700" : " text-red-700"
          }`}
        >
          {status ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <CancelSubscriptionCell row={row.original} />,
  },
];
