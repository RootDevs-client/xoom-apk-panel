"use client";

import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import moment from "moment-timezone";
import DeleteTelcoOperatorCell from "./DeleteTelcoOperatorCell";
import EditTelcoOperatorCell from "./EditTelcoOperatorCell";

export type TelcoOperator = {
  _id: string;
  name: string;
  code: string;
  country: string;
  evinaEnabled: boolean;
  telcoParameterValues?: string;
  variant: "STANDARD" | "EVINA" | "CG_CALLBACK";
  pinLocation: "TELCO_PAGE" | "OUR_PAGE";
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
};

const variantColors: Record<string, "default" | "secondary" | "outline"> = {
  STANDARD: "default",
  EVINA: "secondary",
  CG_CALLBACK: "outline",
};

const formatDate = (date: string) => {
  return moment(date).tz("Asia/Dhaka").format("DD MMM YYYY, HH:mm [hrs]");
};

export const columns = ({
  onSuccess,
}: {
  onSuccess: () => void;
}): ColumnDef<TelcoOperator>[] => [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.code}
      </Badge>
    ),
  },
  {
    accessorKey: "telcoParameterValues",
    header: "Telco Parameters",
    cell: ({ row }) => {
      const value = row.getValue("telcoParameterValues") as string;
      return (
        <Badge variant="outline" className="max-w-80 truncate">
          {value}
        </Badge>
      );
    },
  },
  {
    accessorKey: "country",
    header: "Country",
  },
  {
    accessorKey: "variant",
    header: "Variant",
    cell: ({ row }) => (
      <Badge variant={variantColors[row.original.variant] ?? "default"}>
        {row.original.variant}
      </Badge>
    ),
  },
  {
    accessorKey: "evinaEnabled",
    header: "EVINA",
    cell: ({ row }) =>
      row.original.evinaEnabled ? (
        <Badge variant="default">Enabled</Badge>
      ) : (
        <Badge variant="destructive">Disabled</Badge>
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
  // {
  //   accessorKey: "updatedAt",
  //   header: "Updated At",
  //   cell: ({ row }) => formatDate(row.original.updatedAt),
  // },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <EditTelcoOperatorCell row={row.original} onSuccess={onSuccess} />
        <DeleteTelcoOperatorCell row={row.original} onSuccess={onSuccess} />
      </div>
    ),
  },
];
