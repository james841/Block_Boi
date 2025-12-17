import CategoryPageClient from "@/app/components/CategoryPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trouser Collection | Your Store",
  description: "Explore our exclusive collection of stylish jackets.",
};

export default function TrouserPage() {
  return (
    <div className="mt-16">
      <CategoryPageClient 
        category="trouser" 
        title="Trousers Collection"
        description="Explore our exclusive collection of stylish trousers."
      />
    </div>
  );
}