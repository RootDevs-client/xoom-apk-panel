"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  /** Tailwind gradient stops, e.g. "from-blue-600 to-cyan-400". */
  gradient: string;
  /** Tailwind bg + text classes for the icon chip. */
  iconBg: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  prefix?: string;
  suffix?: string;
  /** Position in the grid — drives the staggered entrance delay. */
  index?: number;
}

const COUNT_UP_DURATION = 900;

/** Eases a numeric value from 0 to `target` on mount. Non-numeric values pass through. */
function useCountUp(target: number, enabled: boolean) {
  const [current, setCurrent] = useState(enabled ? 0 : target);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) {
      setCurrent(target);
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion || target === 0) {
      setCurrent(target);
      return;
    }

    let start: number | null = null;

    const step = (timestamp: number) => {
      start ??= timestamp;
      const progress = Math.min((timestamp - start) / COUNT_UP_DURATION, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(target * eased));
      if (progress < 1) frameRef.current = requestAnimationFrame(step);
    };

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, enabled]);

  return current;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  gradient,
  iconBg,
  trend,
  trendLabel,
  prefix,
  suffix,
  index = 0,
}: StatCardProps) {
  const isNumeric = typeof value === "number";
  const counted = useCountUp(isNumeric ? value : 0, isNumeric);
  const displayValue = isNumeric ? counted.toLocaleString() : value;

  return (
    <div
      style={{ animationDelay: `${index * 80}ms` }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/15 hover:shadow-lg hover:shadow-foreground/5 animate-in fade-in slide-in-from-bottom-3 fill-mode-both duration-500"
    >
      {/* Gradient wash — deepens on hover */}
      <div
        className={`pointer-events-none absolute inset-0 bg-linear-to-br ${gradient} opacity-[0.05] transition-opacity duration-300 group-hover:opacity-[0.12] dark:opacity-[0.08] dark:group-hover:opacity-[0.16]`}
      />

      {/* Light sweep on hover */}
      <div className="sheen pointer-events-none absolute inset-0 overflow-hidden" />

      {/* Left accent bar with panning gradient */}
      <div
        className={`absolute inset-y-0 left-0 w-1 bg-linear-to-b ${gradient} animate-gradient-x`}
      />

      <div className="relative flex items-start justify-between gap-4 py-4 pr-4 pl-5">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>

          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            <span
              className={`bg-linear-to-r ${gradient} animate-gradient-x bg-clip-text text-transparent`}
            >
              {prefix}
              {displayValue}
              {suffix}
            </span>
          </p>

          {trend && trendLabel && (
            <div className="flex items-center gap-1">
              {trend === "up" ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 transition-transform duration-300 group-hover:-translate-y-0.5 dark:text-emerald-400" />
              ) : trend === "down" ? (
                <ArrowDownRight className="h-3.5 w-3.5 text-red-600 transition-transform duration-300 group-hover:translate-y-0.5 dark:text-red-400" />
              ) : null}
              <span
                className={`text-[11px] font-medium ${
                  trend === "up"
                    ? "text-emerald-600 dark:text-emerald-400"
                    : trend === "down"
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                }`}
              >
                {trendLabel}
              </span>
            </div>
          )}
        </div>

        {/* Icon chip with gradient glow on hover */}
        <div className="relative shrink-0">
          <div
            className={`absolute inset-0 rounded-lg bg-linear-to-br ${gradient} opacity-0 blur-md transition-all duration-300 group-hover:opacity-40 group-hover:scale-125`}
          />
          <div
            className={`relative rounded-lg p-2 ${iconBg} transition-transform duration-300 group-hover:scale-110`}
          >
            <Icon className="h-4.5 w-4.5" />
          </div>
        </div>
      </div>
    </div>
  );
}
