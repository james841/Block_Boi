import CategoryPageClient from "@/app/components/CategoryPageClient";
import CategorySkeleton from "@/app/components/SkeletonLoader";

import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Trousers Collection | Your Store",
  description: "Explore our exclusive collection of stylish trousers.",
};

export default function TrousersPage() {
  return (
    <div className="mt-16">
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryPageClient
          category="trouser"
          title="Trousers Collection"
          description="Explore our exclusive collection of stylish trousers."
        />
      </Suspense>
    </div>
  );
}