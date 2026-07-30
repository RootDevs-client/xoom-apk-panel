"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTableState } from "@/store/useTableStore";
import { X } from "lucide-react";
import { DynamicBreadcrumb } from "../../settings/_components/DynamicBreadcrumb";
import SearchBar from "../../topics/_components/SearchBar";

const breadcrumbItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Devices" },
];

export interface DeviceToolbarProps {
  tableId: string;
}

export default function DeviceToolbar({ tableId }: DeviceToolbarProps) {
  const { search, searchInput, setSearch, setSearchInput } =
    useTableState(tableId);

  const handleClearFilters = () => {
    setSearch("");
  };

  const activeFilters: { label: string; key: string; onRemove: () => void }[] =
    [];

  if (search) {
    activeFilters.push({
      label: `Search: ${search}`,
      key: "search",
      onRemove: () => setSearch(""),
    });
  }

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-start justify-between flex-wrap">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">Devices</h2>
            <DynamicBreadcrumb items={breadcrumbItems} />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 flex-wrap">
        <SearchBar
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by mobile number, device name, model..."
        />
        <div>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                Active Search :
              </span>
              {activeFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="gap-1 pr-1 text-xs capitalize dark:bg-gray-950"
                >
                  {filter.label}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-4 hover:bg-transparent hover:text-background/70"
                    onClick={filter.onRemove}
                  >
                    <X className="size-3" />
                    <span className="sr-only">Remove filter</span>
                  </Button>
                </Badge>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="h-6 gap-1 text-xs"
              >
                Clear all
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
