/**
 * Loading state for the admin dashboard overview.
 * Mirrors the real layout: a section heading, then the "Devices Overview" and
 * "Download Analytics" groups, each a header plus a 4-up row of stat cards.
 *
 * Placeholders use the global `.shimmer` utility (app/globals.css), which is
 * token-driven and therefore correct in both light and dark mode.
 */
export function DashboardShimmerLoader() {
  return (
    <div className="px-4 pb-8" aria-label="Loading dashboard data">
      {/* "Devices & Downloads" heading */}
      <div className="mb-6 h-7 w-52 shimmer rounded-lg" />

      <div className="space-y-6">
        <StatSectionSkeleton titleWidth="w-36" descWidth="w-56" />
        <StatSectionSkeleton titleWidth="w-40" descWidth="w-60" />
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function StatSectionSkeleton({
  titleWidth,
  descWidth,
}: {
  titleWidth: string;
  descWidth: string;
}) {
  return (
    <div className="space-y-4">
      {/* Section header — gradient icon chip + title + subtitle */}
      <div className="flex items-center gap-2.5">
        <div className="h-7 w-7 shimmer rounded-md" />
        <div className="space-y-1.5">
          <div className={`h-4 ${titleWidth} shimmer rounded-md`} />
          <div className={`h-3 ${descWidth} shimmer rounded-md`} />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <StatCardSkeleton key={`stat-${i}`} />
        ))}
      </div>
    </div>
  );
}

/** Matches StatCard: left accent bar, label, value, icon chip. */
function StatCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card">
      <div className="absolute inset-y-0 left-0 w-1 shimmer" />
      <div className="flex items-start justify-between gap-4 py-4 pr-4 pl-5">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-24 shimmer rounded-full" />
          <div className="h-7 w-20 shimmer rounded-md" />
        </div>
        <div className="h-9 w-9 shrink-0 shimmer rounded-lg" />
      </div>
    </div>
  );
}
