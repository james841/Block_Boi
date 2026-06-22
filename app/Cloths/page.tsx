import CategoryShowcase from "@/Product UI/CategoriesShowcase";
import ProductList from "@/Product UI/ProductList";
import CategorySkeleton from "@/app/components/SkeletonLoader"; 

import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Shop All Clothes | Block Boi",
  description:
    "Explore our complete collection of premium clothing. Architectural silhouettes and timeless construction — find your piece today.",
};

export default function ClothesPage() {
  return (
    <main className="mt-10 lg:mt-32 bg-white">
     
      {/* 2. CATEGORY CURATION */}
      <section className="bg-white">
        <div className="max-w-[1400px] mx-auto py-12">
          <CategoryShowcase />
        </div>
      </section>

      {/* 3. STRUCTURAL DIVIDER */}
      <div className="w-full border-y border-black/5 py-8 bg-black/[0.02]">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center">
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20 italic">Block Boi Collective</span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-black/20">All Rights Reserved</span>
        </div>
      </div>

      {/* 4. MAIN PRODUCT FEED */}
      <section className="px-6 py-24">
        <div className="max-w-[1400px] mx-auto">
          <div className="mb-20 space-y-4">
             <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">
                The Collections<span className="text-black/20">/</span>
             </h2>
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">
               Browse full range of curated arrivals — updated weekly.
             </p>
          </div>

          <Suspense fallback={<CategorySkeleton />}>
            <ProductList />
          </Suspense>
        </div>
      </section>
    </main>
  );
}