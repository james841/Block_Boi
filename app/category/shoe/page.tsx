import CategoryPageClient from "@/app/components/CategoryPageClient";
import CategorySkeleton from "@/app/components/SkeletonLoader";

import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Shoes Collection | Your Store",
  description: "Explore our exclusive collection of stylish shoes.",
};

export default function ShoesPage() {
  return (
    <div className="mt-16">
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryPageClient
          category="shoes"
          title="Shoes Collection"
          description="Explore our exclusive collection of stylish shoes."
        />
      </Suspense>
    </div>
  );
}