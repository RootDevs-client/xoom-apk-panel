"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTableState } from "@/store/useTableStore";
import { Plus, X } from "lucide-react";
import { useState } from "react";
import { DynamicBreadcrumb } from "../../settings/_components/DynamicBreadcrumb";
import CreateNewsModal from "./CreateNewsModal";
import SearchBar from "./SearchBar";

export interface NewsToolbarProps {
  tableId: string;
  onSuccess: () => void;
}

const breadcrumbItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "News" },
];

export default function NewsToolbar({
  tableId,
  onSuccess,
}: NewsToolbarProps) {
  const { search, searchInput, setSearch, setSearchInput, setFilter } =
    useTableState(tableId);
  const [createOpen, setCreateOpen] = useState(false);

  const handleClearFilters = () => {
    setSearch("");
    setFilter("type", "all");
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
    <>
      <div className="flex items-center justify-between">
        <div className="flex flex-col flex-1 gap-2">
          <div className="mb-2 flex items-start justify-between flex-wrap space-y-2">
            <div>
              <h2 className="font-dm-sans font-medium text-lg">
                Manage News
              </h2>
              <DynamicBreadcrumb items={breadcrumbItems} />
            </div>
            <Button
              size="sm"
              className="gap-1.5"
              onClick={() => setCreateOpen(true)}
            >
              <Plus className="size-4" />
              Add News
            </Button>
          </div>
          <div className="flex items-center gap-4 flex-wrap">
            <SearchBar
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <div>
              {hasActiveFilters && (
                <div className="flex items-center gap-2 mt-2 md:mt-0">
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
      </div>

      <CreateNewsModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={onSuccess}
      />
    </>
  );
}
