"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type UniqueIdentifier,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { useTableState } from "@/store/useTableStore";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getSortedRowModel,
  Row,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Grip,
  SearchX,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import toast from "react-hot-toast";
import TableBodySkeleton from "./TableBodySkeleton";

type WithId<T> = T & { _id: string };

// Create a separate component for the drag handle
function DragHandle({ id }: { id: string }) {
  const { attributes, listeners } = useSortable({
    id,
  });

  return (
    <Button
      {...attributes}
      {...listeners}
      variant="ghost"
      size="icon"
      className="text-muted-foreground/40 hover:text-muted-foreground size-7 hover:bg-muted/50 cursor-grab shrink-0"
    >
      <Grip className="size-3.5" />
      <span className="sr-only">Drag to reorder</span>
    </Button>
  );
}

function DraggableRow<T>({
  row,
  draggable,
}: {
  row: Row<WithId<T>>;
  draggable: boolean;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original._id,
  });

  return (
    <TableRow
      data-state={row.getIsSelected() && "selected"}
      data-dragging={isDragging}
      ref={setNodeRef}
      className="relative z-0 data-[dragging=true]:z-10 data-[dragging=true]:opacity-80 transition-all duration-200"
      style={{
        transform: CSS.Transform.toString(transform),
        transition: transition,
      }}
    >
      {draggable && (
        <TableCell className="w-10">
          <DragHandle id={row.original._id} />
        </TableCell>
      )}
      {row.getVisibleCells().map((cell) => (
        <TableCell key={cell.id}>
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </TableCell>
      ))}
    </TableRow>
  );
}

export function DataTableWithPagination<T>({
  data: initialData,
  columns,
  pagination: showPagination = true,
  onSortEnd,
  total = 0,
  tableId,
  isLoading,
}: {
  data: WithId<T>[];
  columns: ColumnDef<WithId<T>>[];
  pagination?: boolean;
  onSortEnd?: (sortedIds: string[]) => Promise<any>;
  total?: number;
  tableId: string;
  isLoading?: boolean;
}) {
  const { page, limit, setPage, setLimit } = useTableState(tableId);
  const [data, setData] = useState(() => initialData ?? []);
  //   const [rowSelection, setRowSelection] = useState({});
  //   const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  //   const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const sortableId = useId();
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data?.map(({ _id }) => _id) || [],
    [data],
  );

  useEffect(() => {
    setData(initialData ?? []);
  }, [initialData]);

  const totalPages = Math.ceil(total / limit);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      // columnVisibility,
      // rowSelection,
      // columnFilters,
    },
    getRowId: (row) => row._id.toString(),
    // enableRowSelection: true,
    // onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    // onColumnFiltersChange: setColumnFilters,
    // onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    // getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    pageCount: totalPages,
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    let newData: WithId<T>[] = [];
    if (active && over && active.id !== over.id) {
      setData((data) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        newData = arrayMove(data, oldIndex, newIndex);
        return newData;
      });

      if (onSortEnd) {
        const sortedIds = newData.map((item) => item._id);
        onSortEnd(sortedIds).catch((error) => {
          toast.error("Failed to save sort order:");
        });
      }
    }
  }

  const draggable = !!onSortEnd;

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleLimitChange = (newLimit: string) => {
    setPage(1);
    setLimit(Number(newLimit));
  };

  const canPreviousPage = page > 1;
  const canNextPage = page < totalPages;

  return (
    <div className="relative flex flex-col gap-4">
      {/* Table wrapper with modern card styling */}
      <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
          id={sortableId}
        >
          <Table>
            <TableHeader className="bg-muted/40 sticky top-0 z-10">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b border-border/50 hover:bg-transparent">
                  {draggable && <TableHead className="w-10" />}
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead
                        key={header.id}
                        colSpan={header.colSpan}
                        className="h-11 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableBodySkeleton
                  columns={
                    table.getHeaderGroups()[0].headers.length +
                    (draggable ? 1 : 0)
                  }
                  rows={limit}
                />
              ) : table.getRowModel().rows?.length ? (
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row, index) => (
                    <DraggableRow
                      key={row.id}
                      row={row}
                      draggable={draggable}
                    />
                  ))}
                </SortableContext>
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length + (draggable ? 1 : 0)}
                    className="h-60 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="rounded-full bg-muted/50 p-4">
                        <SearchX className="h-8 w-8 text-muted-foreground/40" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">
                          No results found
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-0.5">
                          Try adjusting your search or filters
                        </p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </DndContext>
      </div>

      {/* Modern pagination bar */}
      {showPagination && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-border/60 bg-card px-4 py-3 shadow-sm">
          {/* Info text */}
          <div className="text-xs text-muted-foreground/70 order-2 sm:order-1">
            Showing{" "}
            <span className="font-semibold text-muted-foreground">
              {data.length === 0 ? 0 : (page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-muted-foreground">
              {Math.min(page * limit, total)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-muted-foreground">{total}</span>{" "}
            results
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 order-1 sm:order-2">
            {/* Rows per page */}
            <div className="hidden items-center gap-2 sm:flex">
              <Label
                htmlFor="rows-per-page"
                className="text-xs text-muted-foreground/70 whitespace-nowrap"
              >
                Rows
              </Label>
              <Select
                value={limit.toString()}
                onValueChange={handleLimitChange}
              >
                <SelectTrigger
                  size="sm"
                  className="h-8 w-16 text-xs border-muted-foreground/20"
                  id="rows-per-page"
                >
                  <SelectValue placeholder={limit} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[10, 20, 30, 40, 50].map((pageSize) => (
                    <SelectItem key={pageSize} value={`${pageSize}`} className="text-xs">
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Page info */}
            <div className="text-xs text-muted-foreground/70 whitespace-nowrap">
              Page{" "}
              <span className="font-semibold text-muted-foreground">
                {page}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-muted-foreground">
                {totalPages || 1}
              </span>
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50"
                onClick={() => handlePageChange(1)}
                disabled={!canPreviousPage}
              >
                <ChevronsLeft className="h-4 w-4" />
                <span className="sr-only">First page</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50"
                onClick={() => handlePageChange(page - 1)}
                disabled={!canPreviousPage}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous page</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50"
                onClick={() => handlePageChange(page + 1)}
                disabled={!canNextPage}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next page</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50"
                onClick={() => handlePageChange(totalPages)}
                disabled={!canNextPage}
              >
                <ChevronsRight className="h-4 w-4" />
                <span className="sr-only">Last page</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
