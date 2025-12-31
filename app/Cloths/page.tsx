import CategoryShowcase from "@/Product UI/CategoriesShowcase";
import ProductList from "@/Product UI/ProductList";
import CategorySkeleton from "@/app/components/SkeletonLoader"; // ← Make sure path is correct

import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Shop All Clothes | Block boi",
  description:
    "Explore our complete collection of premium clothing for men and women. From timeless essentials to bold statement pieces — find your perfect style today.",
};

export default function ClothesPage() {
  return (
    <main className="mt-20 lg:mt-24">
      {/* Hero Header */}
      <section className="py-12 lg:py-20 px-6 bg-gradient-to-b from-gray-50 to-transparent">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-gray-900 mb-6">
            <span className="bg-gradient-to-r from-amber-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
              Shop Your Style
            </span>
          </h1>
          <p className="text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Discover handpicked collections crafted with quality, comfort, and confidence in mind. 
            From everyday essentials to standout pieces — express who you are.
          </p>
        </div>
      </section>

      {/* Categories Showcase */}
      <div className="px-6 mb-12 lg:mb-16">
        <CategoryShowcase />
      </div>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent mb-12" />
      </div>

      {/* All Products Section with Full Skeleton */}
      <section className="px-6 pb-16">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            All Collections
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Browse our full range of trending and classic styles. New arrivals updated weekly.
          </p>
        </div>

        {/* This will now show a clear, full-page skeleton while loading */}
        <Suspense fallback={<CategorySkeleton />}>
          <ProductList />
        </Suspense>
      </section>
    </main>
  );
}