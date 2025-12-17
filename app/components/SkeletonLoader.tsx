// app/components/CategorySkeleton.tsx
export default function CategorySkeleton() {
  return (
    <div className="animate-pulse space-y-8 px-4 md:px-8">
      {/* Page title & description skeleton */}
      <div className="text-center py-8">
        <div className="h-10 bg-gray-300 rounded w-3/4 mx-auto mb-4"></div>
        <div className="h-5 bg-gray-300 rounded w-1/2 mx-auto"></div>
      </div>

      {/* Layout: sidebar + product grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Filters sidebar skeleton */}
        <div className="md:col-span-1 space-y-6">
          <div className="h-6 bg-gray-300 rounded w-32"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 rounded w-full"></div>
            ))}
          </div>
          <div className="h-6 bg-gray-300 rounded w-40 mt-8"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-300 rounded w-full"></div>
            ))}
          </div>
        </div>

        {/* Product grid skeleton */}
        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-gray-300 rounded w-48"></div>
            <div className="h-10 bg-gray-300 rounded w-40"></div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-gray-300 rounded-lg"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}