import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function Bar({ className = "" }: { className?: string }) {
  return <div className={`shimmer h-4 rounded-md ${className}`} />;
}

function FieldSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Bar className="h-2.5 w-20" />
      <Bar className="w-32" />
    </div>
  );
}

function InfoCardSkeleton({ fields }: { fields: number }) {
  return (
    <Card>
      <CardHeader>
        <Bar className="h-4 w-24" />
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        {Array.from({ length: fields }).map((_, i) => (
          <FieldSkeleton key={i} />
        ))}
      </CardContent>
    </Card>
  );
}

export default function DeviceDetailsSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          <Bar className="h-5 w-44" />
          <Bar className="h-3 w-64" />
        </div>
        <div className="shimmer h-8 w-36 rounded-md" />
      </div>

      {/* Info cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCardSkeleton fields={8} />
        <InfoCardSkeleton fields={7} />
      </div>

      {/* Event logs */}
      <Card>
        <CardHeader className="flex flex-col gap-4 border-b border-border/50 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-2">
            <Bar className="h-4 w-28" />
            <Bar className="h-3 w-56" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="shimmer h-8 w-44 rounded-md" />
            <div className="shimmer h-8 w-52 rounded-md" />
            <div className="shimmer h-8 w-24 rounded-md" />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow className="border-b border-border/50 hover:bg-transparent">
                  {["#", "Event", "Timestamp", "Elapsed", "When"].map(
                    (label, i) => (
                      <TableHead
                        key={label}
                        className={`h-11 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/80 ${
                          i === 0 ? "w-14" : ""
                        } ${i > 2 ? "text-right" : ""}`}
                      >
                        {label}
                      </TableHead>
                    ),
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: rows }).map((_, i) => (
                  <TableRow key={i} className="border-b border-border/40">
                    <TableCell className="px-3">
                      <Bar className="h-3 w-6" />
                    </TableCell>
                    <TableCell className="px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="shimmer size-2 rounded-full" />
                        <Bar className="w-36" />
                      </div>
                    </TableCell>
                    <TableCell className="px-3">
                      <Bar className="h-3 w-40" />
                    </TableCell>
                    <TableCell className="px-3">
                      <Bar className="ml-auto h-3 w-14" />
                    </TableCell>
                    <TableCell className="px-3">
                      <Bar className="ml-auto h-3 w-24" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
