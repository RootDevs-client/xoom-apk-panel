/**
 * Loading state for the analytics dashboard.
 * Placeholders use the global `.shimmer` utility (app/globals.css), which is
 * token-driven and therefore correct in both light and dark mode.
 */
export function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading analytics data">
      {/* ─── Charts Row 1 ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Status Chart */}
        <ChartCardSkeleton
          titleWidth="w-40"
          descWidth="w-28"
          bars={false}
          donut
        />
        {/* Download Trends Chart */}
        <ChartCardSkeleton
          titleWidth="w-36"
          descWidth="w-32"
          bars={[75, 40, 90, 60]}
          donut={false}
        />
      </div>

      {/* Separator */}
      <div className="h-px w-full shimmer rounded-full opacity-50" />

      {/* ─── 3-Column Cards Row ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Platform Breakdown */}
        <DetailCardSkeleton type="progress" />
        {/* Conversion Metrics */}
        <DetailCardSkeleton type="conversion" />
        {/* Quick Stats */}
        <DetailCardSkeleton type="badges" />
      </div>

      {/* ─── PIN Conversion Chart ─── */}
      <div className={cardShell}>
        <div className="space-y-4">
          <CardHeaderSkeleton titleWidth="w-40" descWidth="w-32" />
          <div className="flex items-end justify-center gap-16 pt-4 h-44">
            {[80, 55].map((h, i) => (
              <div
                key={`pbar-${i}`}
                className="flex flex-col items-center gap-2 w-24"
              >
                <div
                  className="w-full shimmer rounded-t-lg"
                  style={{ height: `${h}%` }}
                />
                <div className="h-3 w-20 shimmer rounded-full" />
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-3 pt-3 border-t border-border/50">
            <div className="h-7 w-28 shimmer rounded-lg" />
            <div className="h-4 w-4 shimmer rounded-sm" />
            <div className="h-7 w-28 shimmer rounded-lg" />
            <div className="h-7 w-16 shimmer rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

const cardShell =
  "rounded-xl border border-border/60 bg-card p-5 shadow-sm overflow-hidden";

function CardHeaderSkeleton({
  titleWidth,
  descWidth,
}: {
  titleWidth: string;
  descWidth: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-8 w-8 shimmer rounded-lg" />
      <div className="space-y-1.5">
        <div className={`h-4 ${titleWidth} shimmer rounded-md`} />
        <div className={`h-3 ${descWidth} shimmer rounded-md`} />
      </div>
    </div>
  );
}

function ChartCardSkeleton({
  titleWidth,
  descWidth,
  bars,
  donut,
}: {
  titleWidth: string;
  descWidth: string;
  bars: number[] | false;
  donut: boolean;
}) {
  return (
    <div className={cardShell}>
      <div className="space-y-4">
        <CardHeaderSkeleton titleWidth={titleWidth} descWidth={descWidth} />
        {donut && (
          <>
            <div className="flex justify-center py-4">
              <div className="h-52 w-52 shimmer rounded-full" />
            </div>
            <div className="flex justify-center gap-6 pt-2 border-t border-border/50">
              {[...Array(3)].map((_, i) => (
                <div key={`legend-${i}`} className="text-center space-y-1">
                  <div className="h-3 w-14 shimmer rounded-full mx-auto" />
                  <div className="h-4 w-10 shimmer rounded-md mx-auto" />
                </div>
              ))}
            </div>
          </>
        )}
        {bars && (
          <div className="flex items-end justify-around gap-3 pt-4 pb-2 h-52">
            {bars.map((h, i) => (
              <div
                key={`bar-${i}`}
                className="flex-1 flex flex-col items-center gap-2"
              >
                <div
                  className="w-full shimmer rounded-t-lg"
                  style={{ height: `${h}%` }}
                />
                <div className="h-3 w-14 shimmer rounded-full" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailCardSkeleton({
  type,
}: {
  type: "progress" | "conversion" | "badges";
}) {
  return (
    <div className={cardShell}>
      <div className="space-y-4">
        <CardHeaderSkeleton titleWidth="w-32" descWidth="w-24" />

        {type === "progress" && (
          <div className="space-y-5 pt-1">
            {[...Array(2)].map((_, j) => (
              <div key={`prog-${j}`} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-20 shimmer rounded-md" />
                  <div className="h-4 w-24 shimmer rounded-md" />
                </div>
                <div className="h-2.5 w-full shimmer rounded-full" />
              </div>
            ))}
            <div className="pt-3 border-t border-border/50">
              <div className="flex justify-between items-center">
                <div className="h-4 w-24 shimmer rounded-md" />
                <div className="h-5 w-16 shimmer rounded-md" />
              </div>
            </div>
          </div>
        )}

        {type === "conversion" && (
          <>
            {[...Array(2)].map((_, j) => (
              <div
                key={`conv-${j}`}
                className="flex justify-between items-center p-3 rounded-xl bg-muted/20"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 shimmer rounded-lg" />
                  <div className="h-4 w-28 shimmer rounded-md" />
                </div>
                <div className="h-5 w-16 shimmer rounded-md" />
              </div>
            ))}
            <div className="space-y-2 pt-2 border-t border-border/50">
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 shimmer rounded-md" />
                <div className="h-5 w-14 shimmer rounded-full" />
              </div>
              <div className="h-3 w-full shimmer rounded-full" />
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 shimmer rounded-full" />
                <div className="h-3 w-24 shimmer rounded-md" />
              </div>
            </div>
          </>
        )}

        {type === "badges" && (
          <div className="space-y-3 pt-1">
            {[...Array(3)].map((_, k) => (
              <div key={`badge-${k}`} className="flex items-center gap-3">
                <div className="h-9 w-9 shimmer rounded-lg" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 w-20 shimmer rounded-full" />
                  <div className="h-4 w-16 shimmer rounded-md" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
