import { TableCell, TableRow } from "@/components/ui/table";

interface TableBodySkeletonProps {
  columns: number;
  rows: number;
}

export default function TableBodySkeleton({
  columns,
  rows,
}: TableBodySkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex} className="border-b border-border/30">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <div className="h-8 w-full animate-pulse rounded-md bg-muted/50" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
