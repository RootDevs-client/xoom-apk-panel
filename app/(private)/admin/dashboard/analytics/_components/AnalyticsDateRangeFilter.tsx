"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Calendar, CalendarRange, RotateCcw } from "lucide-react";
import moment from "moment-timezone";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useTransition } from "react";

const TZ = "Asia/Dhaka";
const today = () => moment().tz(TZ);
const fmt = (m: moment.Moment) => m.format("YYYY-MM-DD");

type Range = { from: string; to: string } | null;

type Preset = {
  key: string;
  label: string;
  range: () => Range;
};

const presets: Preset[] = [
  {
    key: "today",
    label: "Today",
    range: () => ({ from: fmt(today()), to: fmt(today()) }),
  },
  {
    key: "7d",
    label: "7 Days",
    range: () => ({ from: fmt(today().subtract(6, "days")), to: fmt(today()) }),
  },
  {
    key: "30d",
    label: "30 Days",
    range: () => ({ from: fmt(today().subtract(29, "days")), to: fmt(today()) }),
  },
  {
    key: "month",
    label: "This Month",
    range: () => ({ from: fmt(today().startOf("month")), to: fmt(today()) }),
  },
  {
    key: "90d",
    label: "90 Days",
    range: () => ({ from: fmt(today().subtract(89, "days")), to: fmt(today()) }),
  },
  { key: "all", label: "All Time", range: () => null },
];

export default function AnalyticsDateRangeFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const fromParam = searchParams.get("from") ?? "";
  const toParam = searchParams.get("to") ?? "";

  const inputRef = useRef<HTMLInputElement>(null);
  const pickerRef = useRef<flatpickr.Instance | null>(null);
  /** latest push in a ref so the picker is initialised only once */
  const pushRef = useRef<(next: Range) => void>(() => {});

  const push = (next: Range) => {
    const params = new URLSearchParams(searchParams.toString());
    if (next?.from) params.set("from", next.from);
    else params.delete("from");
    if (next?.to) params.set("to", next.to);
    else params.delete("to");

    const query = params.toString();
    startTransition(() => {
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  };
  pushRef.current = push;

  // init flatpickr range picker once
  useEffect(() => {
    if (!inputRef.current) return;

    pickerRef.current = flatpickr(inputRef.current, {
      mode: "range",
      dateFormat: "Y-m-d",
      maxDate: "today",
      showMonths: 2,
      allowInput: false,
      onClose: (selectedDates) => {
        if (selectedDates.length === 2) {
          pushRef.current({
            from: moment(selectedDates[0]).format("YYYY-MM-DD"),
            to: moment(selectedDates[1]).format("YYYY-MM-DD"),
          });
        } else if (selectedDates.length === 0) {
          pushRef.current(null);
        }
      },
    });

    return () => {
      pickerRef.current?.destroy();
      pickerRef.current = null;
    };
  }, []);

  // keep the picker in sync with the URL (presets, reset, back button)
  useEffect(() => {
    const picker = pickerRef.current;
    if (!picker) return;

    if (fromParam && toParam) {
      picker.setDate([fromParam, toParam], false);
    } else {
      picker.clear(false);
    }
  }, [fromParam, toParam]);

  const activePreset = presets.find((preset) => {
    const range = preset.range();
    if (!range) return !fromParam && !toParam;
    return range.from === fromParam && range.to === toParam;
  })?.key;

  const hasRange = Boolean(fromParam || toParam);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
      {/* Presets */}
      <div className="flex flex-wrap items-center gap-1.5">
        <CalendarRange className="mr-1 size-4 text-muted-foreground/60" />
        {presets.map((preset) => (
          <Button
            key={preset.key}
            variant={activePreset === preset.key ? "default" : "outline"}
            size="sm"
            disabled={isPending}
            className="h-8 rounded-full px-3 text-xs font-medium"
            onClick={() => push(preset.range())}
          >
            {preset.label}
          </Button>
        ))}
      </div>

      {/* Custom range — flatpickr */}
      <div className="flex items-center gap-2">
        <div className="relative">
          <Input
            ref={inputRef}
            type="text"
            readOnly
            disabled={isPending}
            placeholder="Custom range"
            className="h-8 w-60 cursor-pointer pr-8 text-xs"
            aria-label="Custom date range"
          />
          <Calendar className="pointer-events-none absolute right-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground/60" />
        </div>

        {hasRange && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            className="h-8 px-2 text-xs text-muted-foreground"
            onClick={() => push(null)}
            aria-label="Reset date range"
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
        )}

        {isPending && (
          <span className="text-xs text-muted-foreground/70">Loading…</span>
        )}
      </div>
    </div>
  );
}
