import CategoryPageClient from "@/app/components/CategoryPageClient";
import CategorySkeleton from "@/app/components/SkeletonLoader";

import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "T-Shirts Collection | Your Store",
  description: "Explore our exclusive collection of stylish shirts.",
};

export default function ShirtsPage() {
  return (
    <div className="mt-16">
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryPageClient
          category="shirt"
          title="Shirts Collection"
          description="Explore our exclusive collection of stylish shirts."
        />
      </Suspense>
    </div>
  );
}