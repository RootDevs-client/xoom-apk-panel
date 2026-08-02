import { Skeleton } from "@/components/ui/skeleton";

const SettingsShimmerLoader = () => {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-11 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Sidebar */}
        <div className="w-full shrink-0 lg:w-72">
          <div className="space-y-4 lg:space-y-2 lg:rounded-2xl lg:border lg:border-border/80 lg:bg-card lg:p-2 lg:shadow-sm">
            {[0, 1, 2].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-xl p-2.5"
              >
                <Skeleton className="size-9 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* App Branding */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border/60 pb-5">
              <Skeleton className="size-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-3 w-56" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-52 rounded-xl" />
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-32" />
                <Skeleton className="h-52 rounded-xl" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-12 rounded-xl" />
              </div>
              <div>
                <Skeleton className="mb-2 h-4 w-20" />
                <Skeleton className="h-[7.5rem] rounded-xl" />
              </div>
            </div>
          </div>

          {/* URL Configuration */}
          <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-border/60 pb-5">
              <Skeleton className="size-10 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-52" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
              {[0, 1, 2, 3].map((item) => (
                <div key={item}>
                  <Skeleton className="mb-2 h-4 w-32" />
                  <Skeleton className="h-12 rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          {/* Save bar */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card/95 px-5 py-4 shadow-lg shadow-primary/5">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
            <Skeleton className="h-11 w-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsShimmerLoader;
