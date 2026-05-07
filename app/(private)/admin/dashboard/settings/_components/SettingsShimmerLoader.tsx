import { Skeleton } from "@/components/ui/skeleton";

const SettingsShimmerLoader = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        <Skeleton className="h-9 w-32 mb-4" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-8">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 w-28" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sidebar */}
          {/* <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
              <div className="bg-orange-500 p-4">
                <Skeleton className="h-5 w-20 bg-white/20" />
              </div>

              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="p-4 border-b border-gray-200 dark:border-gray-700"
                >
                  <Skeleton className="h-5 w-24" />
                </div>
              ))}
            </div>
          </div> */}

          {/* Main Content */}
          <div className="col-span-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
              {/* Section Title */}
              <div className="mb-2">
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-80" />
              </div>

              <div className="mt-8 space-y-6">
                {/* Company Name & Support Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-32 mb-2" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>
                </div>

                {/* Phone Number & Home View Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>
                </div>

                {/* Company Address */}
                <div>
                  <Skeleton className="h-4 w-36 mb-2" />
                  <Skeleton className="h-24 w-full rounded-md" />
                </div>

                {/* Owner Name & Owner Email Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>
                  <div>
                    <Skeleton className="h-4 w-28 mb-2" />
                    <Skeleton className="h-12 w-full rounded-md" />
                  </div>
                </div>

                {/* Logo & Favicon Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Logo */}
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <div className="relative">
                      <Skeleton className="h-48 w-full rounded-lg" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Skeleton className="h-5 w-28 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>

                  {/* Favicon */}
                  <div>
                    <Skeleton className="h-4 w-16 mb-2" />
                    <div className="relative">
                      <Skeleton className="h-48 w-full rounded-lg" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Skeleton className="h-5 w-28 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsShimmerLoader;
