"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  gradient: string;
  iconBg: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  prefix?: string;
  suffix?: string;
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
}: StatCardProps) {
  const displayValue =
    typeof value === "number" ? value.toLocaleString() : value;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 dark:border-white/5 bg-white dark:bg-white/5 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.04)] transition-all duration-500 hover:shadow-[0_8px_32px_-8px_rgba(0,0,0,0.08)] hover:-translate-y-1.5">
      {/* Glass backdrop */}
      <div className="absolute inset-0 bg-linear-to-br from-white/80 to-white/40 dark:from-white/[0.07] dark:to-white/2 backdrop-blur-xl" />

      {/* Diagonal gradient accent */}
      <div
        className={`absolute inset-0 bg-linear-to-br ${gradient} opacity-[0.06] dark:opacity-[0.1] transition-opacity duration-500 group-hover:opacity-[0.1] dark:group-hover:opacity-[0.15]`}
      />

      {/* Animated bottom accent bar */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.75 bg-linear-to-r ${gradient} scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
      />
      <div
        className={`absolute bottom-0 left-0 right-0 h-0.75 bg-linear-to-r ${gradient} opacity-40 blur-sm scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left delay-75`}
      />

      {/* Decorative corner element */}
      <div className="absolute -top-3 -right-3 w-12 h-12 opacity-[0.04] dark:opacity-[0.06] group-hover:opacity-[0.08] transition-opacity duration-500">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="100,0 0,0 100,100"
            fill="currentColor"
            className="text-foreground"
          />
        </svg>
      </div>

      {/* Side accent dot */}
      <div
        className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-linear-to-b ${gradient} opacity-0 group-hover:opacity-100 transition-all duration-500 scale-y-0 group-hover:scale-y-100 origin-center`}
      />

      <div className="relative p-5 flex items-start justify-between gap-4">
        <div className="space-y-2.5 min-w-0 flex-1">
          {/* Label */}
          <p className="text-xs font-bold text-foreground/75 uppercase tracking-[0.08em] flex items-center gap-1.5">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-current opacity-90" />
            {label}
          </p>

          {/* Value with gradient text */}
          <p className="text-2xl font-bold tracking-tight">
            <span
              className={`bg-linear-to-r ${gradient} bg-clip-text text-transparent`}
            >
              {prefix}
              {displayValue}
              {suffix}
            </span>
          </p>

          {/* Trend indicator */}
          {trend && trendLabel && (
            <div className="flex items-center gap-1 pt-0.5">
              {trend === "up" ? (
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
              ) : trend === "down" ? (
                <ArrowDownRight className="h-3.5 w-3.5 text-red-500" />
              ) : null}
              <span
                className={`text-[11px] font-medium ${
                  trend === "up"
                    ? "text-emerald-500"
                    : trend === "down"
                      ? "text-red-500"
                      : "text-muted-foreground"
                }`}
              >
                {trendLabel}
              </span>
            </div>
          )}
        </div>

        {/* Icon with glowing ring */}
        <div className="relative shrink-0 mt-1">
          {/* Glow ring - visible on hover */}
          <div
            className={`absolute inset-0 rounded-2xl bg-linear-to-br ${gradient} opacity-0 blur-xl transition-all duration-500 group-hover:opacity-30 group-hover:scale-150`}
          />
          {/* Icon container */}
          <div
            className={`relative p-3 rounded-2xl ${iconBg} transition-all duration-500 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-current/10`}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </div>
  );
}
