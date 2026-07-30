"use client";

interface MetricBadgeProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
}

export function MetricBadge({
  label,
  value,
  icon: Icon,
  color,
}: MetricBadgeProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl border bg-card/50 hover:bg-accent/50 transition-all duration-200 hover:shadow-sm">
      <div className={`p-2.5 rounded-lg ${color}/10 shrink-0`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground truncate">{label}</p>
        <p className="text-sm font-semibold">{value}</p>
      </div>
    </div>
  );
}
