"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { Calendar, CalendarRange, RotateCcw } from "lucide-react";
import moment from "moment-timezone";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

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
    range: () => ({
      from: fmt(today().subtract(29, "days")),
      to: fmt(today()),
    }),
  },
  {
    key: "month",
    label: "This Month",
    range: () => ({ from: fmt(today().startOf("month")), to: fmt(today()) }),
  },
  {
    key: "90d",
    label: "90 Days",
    range: () => ({
      from: fmt(today().subtract(89, "days")),
      to: fmt(today()),
    }),
  },
  { key: "all", label: "All Time", range: () => null },
];

/** shown when the URL range was picked with the calendar, not a preset */
const CUSTOM_KEY = "custom";

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
  /** current range in a ref so a re-init can restore the selection */
  const rangeRef = useRef<Range>(null);

  /** two months side by side need ~620px — show one below the md breakpoint,
      which is also where the responsive calendar CSS takes over */
  const [months, setMonths] = useState(1);

  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const apply = () => setMonths(query.matches ? 2 : 1);

    apply();
    query.addEventListener("change", apply);
    return () => query.removeEventListener("change", apply);
  }, []);

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
  rangeRef.current =
    fromParam && toParam ? { from: fromParam, to: toParam } : null;

  // (re)init flatpickr — re-created only when the month count changes
  useEffect(() => {
    if (!inputRef.current) return;

    const current = rangeRef.current;

    pickerRef.current = flatpickr(inputRef.current, {
      mode: "range",
      dateFormat: "Y-m-d",
      maxDate: "today",
      showMonths: months,
      allowInput: false,
      /* On touch devices flatpickr swaps itself for a native <input type="date">,
         which cannot express a range at all — keep our own calendar. */
      disableMobile: true,
      /* Rendered into <body> (not inline) so no ancestor's overflow can clip it. */
      static: false,
      appendTo: document.body,
      /* One month: centre it under the full-width input on phones.
         Two months: flatpickr's default left-anchored placement. */
      position: months === 1 ? "auto center" : "auto left",
      defaultDate: current ? [current.from, current.to] : undefined,
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
  }, [months]);

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
      <div className="flex items-center gap-2">
        <CalendarRange className="size-4 shrink-0 text-muted-foreground/60" />
        <Select
          value={activePreset ?? CUSTOM_KEY}
          disabled={isPending}
          onValueChange={(key) => {
            const preset = presets.find((item) => item.key === key);
            if (preset) push(preset.range());
          }}
        >
          <SelectTrigger
            className="w-full py-2.5 text-sm data-[size=default]:h-11 lg:w-44"
            aria-label="Date range preset"
          >
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {presets.map((preset) => (
              <SelectItem
                key={preset.key}
                value={preset.key}
                className="py-2 text-sm"
              >
                {preset.label}
              </SelectItem>
            ))}
            {/* only reachable when the URL holds a range no preset matches */}
            {!activePreset && (
              <SelectItem value={CUSTOM_KEY} className="py-2 text-sm">
                Custom range
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Custom range — flatpickr */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 lg:flex-none">
          <Input
            ref={inputRef}
            type="text"
            readOnly
            disabled={isPending}
            placeholder="Custom range"
            className="h-11 w-full cursor-pointer py-2.5 pr-9 text-base md:text-sm lg:w-60"
            aria-label="Custom date range"
          />
          <Calendar className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground/60" />
        </div>

        {hasRange && (
          <Button
            variant="ghost"
            size="sm"
            disabled={isPending}
            className="h-11 px-3 text-xs text-muted-foreground"
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
