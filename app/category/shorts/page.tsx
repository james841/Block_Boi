import CategoryPageClient from "@/app/components/CategoryPageClient";
import CategorySkeleton from "@/app/components/SkeletonLoader";

import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Shorts Collection | Your Store",
  description: "Explore our exclusive collection of stylish shorts.",
};

export default function ShortsPage() {
  return (
    <div className="mt-16">
      <Suspense fallback={<CategorySkeleton />}>
        <CategoryPageClient
          category="shorts"
          title="Shorts Collection"
          description="Explore our exclusive collection of stylish shorts."
        />
      </Suspense>
    </div>
  );
}