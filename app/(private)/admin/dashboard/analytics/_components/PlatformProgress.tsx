"use client";

interface PlatformProgressProps {
  label: string;
  value: number;
  total: number;
  iconColor: string;
  barClassName: string;
  icon: React.ElementType;
}

export function PlatformProgress({
  label,
  value,
  total,
  iconColor,
  barClassName,
  icon: Icon,
}: PlatformProgressProps) {
  const safeValue = Number(value) || 0;
  const safeTotal = Number(total) || 0;
  const percentage =
    safeTotal > 0 ? Math.round((safeValue / safeTotal) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-lg ${iconColor.replace("text-", "bg-")}/10`}>
            <Icon className={`h-4 w-4 ${iconColor}`} />
          </div>
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold">{safeValue.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground ml-1">
            ({percentage}%)
          </span>
        </div>
      </div>
      <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 rounded-full transition-all duration-1000 ease-out ${barClassName}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
