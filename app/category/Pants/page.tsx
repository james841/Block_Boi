import CategoryPageClient from "@/app/components/CategoryPageClient";
import CategorySkeleton from "@/app/components/SkeletonLoader";

import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Pants Collection | Your Store",
  description: "Explore our exclusive collection of stylish pants.",
};

export default function PantsPage() {
  return (
    <div className="mt-16">
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryPageClient
          category="pants"
          title="Pants Collection"
          description="Explore our exclusive collection of stylish pants."
        />
      </Suspense>
    </div>
  );
}