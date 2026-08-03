"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
  Search,
  SearchX,
} from "lucide-react";
import moment from "moment-timezone";
import { useMemo, useState } from "react";
import { formatEventLabel, type DeviceStatusLog } from "./device.utils";

/** dot + text colour per event family */
const eventTone: Record<string, { dot: string; text: string }> = {
  APP_DOWNLOADED: {
    dot: "bg-blue-500",
    text: "text-blue-600 dark:text-blue-400",
  },
  DETAILS_CAPTURED: {
    dot: "bg-violet-500",
    text: "text-violet-600 dark:text-violet-400",
  },
  GET_EVINA_JS_CALLED: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  EVINA_JS_RENDERED: {
    dot: "bg-amber-500",
    text: "text-amber-600 dark:text-amber-400",
  },
  PIN_REQUEST_CALLED: {
    dot: "bg-cyan-500",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  PIN_VERIFY_CALLED: {
    dot: "bg-cyan-500",
    text: "text-cyan-600 dark:text-cyan-400",
  },
  APP_ACTIVE: {
    dot: "bg-emerald-500",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  APP_INACTIVE: {
    dot: "bg-muted-foreground/40",
    text: "text-muted-foreground",
  },
  APP_DELETED: { dot: "bg-red-500", text: "text-red-600 dark:text-red-400" },
};

const toneOf = (event: string) =>
  eventTone[event] ?? {
    dot: "bg-muted-foreground/40",
    text: "text-muted-foreground",
  };

const dhaka = (date: string) => moment(date).tz("Asia/Dhaka");

/** "1h 12m", "45s", "—" */
const formatGap = (from?: string, to?: string) => {
  if (!from || !to) return "—";
  const ms = Math.abs(dhaka(to).valueOf() - dhaka(from).valueOf());
  if (ms < 1000) return "0s";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
};

export default function DeviceEventList({
  statusLogs = [],
}: {
  statusLogs?: DeviceStatusLog[];
}) {
  const [eventFilter, setEventFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [newestFirst, setNewestFirst] = useState(true);

  /** distinct events + how many times each fired */
  const eventTypes = useMemo(() => {
    const counts = new Map<string, number>();
    statusLogs.forEach((log) =>
      counts.set(log.event, (counts.get(log.event) ?? 0) + 1),
    );
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [statusLogs]);

  /** chronological once, so "gap since previous" is stable under any sort */
  const chronological = useMemo(
    () =>
      [...statusLogs]
        .sort(
          (a, b) => dhaka(a.createdAt).valueOf() - dhaka(b.createdAt).valueOf(),
        )
        .map((log, index, all) => ({
          ...log,
          seq: index + 1,
          gap: formatGap(all[index - 1]?.createdAt, log.createdAt),
        })),
    [statusLogs],
  );

  const events = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = chronological.filter((log) => {
      const matchesType = eventFilter === "all" || log.event === eventFilter;
      const matchesSearch =
        !term ||
        log.event.toLowerCase().includes(term) ||
        formatEventLabel(log.event).toLowerCase().includes(term);
      return matchesType && matchesSearch;
    });
    return newestFirst ? filtered.reverse() : filtered;
  }, [chronological, eventFilter, search, newestFirst]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 border-b border-border/50 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-base">Event Logs</CardTitle>
            <Badge variant="secondary" className="text-xs">
              {events.length}
              {events.length !== statusLogs.length && ` / ${statusLogs.length}`}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Lifecycle events recorded for this device
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/50" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search event"
              className="h-8 w-44 pl-8 text-xs"
            />
          </div>

          <Select value={eventFilter} onValueChange={setEventFilter}>
            <SelectTrigger size="sm" className="h-8 w-52 text-xs">
              <SelectValue placeholder="All events" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All events ({statusLogs.length})
              </SelectItem>
              {eventTypes.map(([event, count]) => (
                <SelectItem key={event} value={event} className="text-xs">
                  {formatEventLabel(event)} ({count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={() => setNewestFirst((prev) => !prev)}
          >
            {newestFirst ? (
              <ArrowDownWideNarrow className="size-3.5" />
            ) : (
              <ArrowUpWideNarrow className="size-3.5" />
            )}
            {newestFirst ? "Newest" : "Oldest"}
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
          <div className="max-h-155 overflow-y-auto">
            <Table>
              <TableHeader className="bg-muted/40 sticky top-0 z-10">
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
                {events.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-60 text-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="rounded-full bg-muted/50 p-4">
                          <SearchX className="h-8 w-8 text-muted-foreground/40" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-muted-foreground">
                            No events found
                          </p>
                          <p className="text-xs text-muted-foreground/60 mt-0.5">
                            Try adjusting your search or filter
                          </p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  events.map((log) => {
                    const tone = toneOf(log.event);
                    const at = dhaka(log.createdAt);
                    return (
                      <TableRow
                        key={
                          log._id ?? `${log.event}-${log.createdAt}-${log.seq}`
                        }
                        className="border-b border-border/40 transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="px-3 font-mono text-xs text-muted-foreground/50 tabular-nums">
                          {String(log.seq).padStart(2, "0")}
                        </TableCell>
                        <TableCell className="px-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`size-2 shrink-0 rounded-full ${tone.dot}`}
                            />
                            <span
                              className={`text-sm font-medium ${tone.text}`}
                            >
                              {formatEventLabel(log.event)}
                            </span>
                            <code className="hidden rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground/60 lg:inline">
                              {log.event}
                            </code>
                          </div>
                        </TableCell>
                        <TableCell className="px-3 font-mono text-xs tabular-nums text-muted-foreground">
                          {at.format("DD MMM YYYY")}
                          <span className="ml-2 text-foreground/80">
                            {at.format("HH:mm:ss")}
                          </span>
                        </TableCell>
                        <TableCell className="px-3 text-right font-mono text-xs tabular-nums text-muted-foreground/60">
                          {log.gap === "—" ? "—" : `+${log.gap}`}
                        </TableCell>
                        <TableCell className="px-3 text-right text-xs whitespace-nowrap text-muted-foreground/70">
                          {at.fromNow()}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
