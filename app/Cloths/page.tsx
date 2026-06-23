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
    <main className="bg-white min-h-screen pt-16 lg:pt-24 pb-16">
      
      {/* 1. CATEGORY CURATION */}
      <section className="px-4 lg:px-8">
        <div className="max-w-[1400px] mx-auto pb-10 border-b border-black/5">
          <CategoryShowcase />
        </div>
      </section>

      {/* 2. MAIN PRODUCT FEED */}
      <section className="px-4 lg:px-8 pt-12">
        <div className="max-w-[1400px] mx-auto">
          
          {/* Header Context Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-black/10">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-5xl font-black uppercase tracking-tighter">
                The Collections<span className="text-black/20">/</span>
              </h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-black/50">
                Browse full range of curated arrivals — updated weekly.
              </p>
            </div>
            
            {/* Repurposed "Block Boi Collective" text as a sleek contextual accent */}
            <div className="hidden md:flex flex-col items-end text-[9px] font-semibold uppercase tracking-[0.3em] text-black/30">
              <span>Block Boi Collective</span>
              <span>All Rights Reserved ©</span>
            </div>
          </div>

          {/* Product Feed */}
          <Suspense fallback={<CategorySkeleton />}>
            <ProductList />
          </Suspense>
          
        </div>
      </section>
    </main>
  );
}