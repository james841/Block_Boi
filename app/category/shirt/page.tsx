
import CategoryPageClient from "@/app/components/CategoryPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "T-Shirts Collection | Your Store",
  description: "Explore our exclusive collection of stylish shirts.",
};

export default function ShirtsPage() {
  return (
     <div className="mt-16">
    <CategoryPageClient 
      category="t-shirt" 
      title="Shirts Collection"
      description="Explore our exclusive collection of stylish shirts."
    />
  </div>
  );
}