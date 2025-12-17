import CategoryShowcase from "@/Product UI/CategoriesShowcase";
import ProductList from "@/Product UI/ProductList";

import type { Metadata } from "next";
import { Suspense } from "react";
import CategorySkeleton from "../components/SkeletonLoader";

export const metadata: Metadata = {
  title: "Clothes | Your Store",
  description: "Discover our full collection of stylish clothing.",
};

export default function ClothesPage() {
  return (
    <main className="mt-16"> 
      <h1 className="text-3xl font-bold mb-6 text-center">Clothes</h1>
   
      <CategoryShowcase />

    
      <Suspense fallback={<CategorySkeleton />}>
        <ProductList />
      </Suspense>
    </main>
  );
}