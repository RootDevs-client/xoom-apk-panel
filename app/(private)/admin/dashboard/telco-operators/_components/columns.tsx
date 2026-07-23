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
  telcoParameterValues?: string;
  variant: "STANDARD" | "EVINA" | "CG_CALLBACK";
  configs: { label: string; id: string; type: string; order: number }[];
  settings?: {
    mode: "instant" | "hold" | "hold_until_admin_change";
    hold?: { duration?: number; unit?: "minute" | "hour" | "day" };
  };
  isActive: boolean;
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
    accessorKey: "settings.mode",
    header: "Mode",
    cell: ({ row }) => {
      const mode = row.original.settings?.mode ?? "instant";
      const colorMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
        instant: "default",
        hold: "secondary",
        hold_until_admin_change: "outline",
      };
      return <Badge variant={colorMap[mode] ?? "default"}>{mode}</Badge>;
    },
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "destructive"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
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
