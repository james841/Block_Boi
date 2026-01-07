import CategoryPageClient from "@/app/components/CategoryPageClient";
import CategorySkeleton from "@/app/components/SkeletonLoader";

import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Hats Collection | Your Store",
  description: "Explore our exclusive collection of stylish hats.",
};

export default function HatsPage() {
  return (
    <div className="mt-16">
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryPageClient
          category="hats"
          title="Hats Collection"
          description="Explore our exclusive collection of stylish hats."
        />
      </Suspense>
    </div>
  );
}