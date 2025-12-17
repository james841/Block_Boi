
import CategoryPageClient from "@/app/components/CategoryPageClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shorts Collection | Your Store",
  description: "Explore our exclusive collection of stylish shorts.",
};

export default function ShortsPage() {
  return (
     <div className="mt-16">
    <CategoryPageClient 
      category="shorts" 
      title="Shorts Collection"
      description="Explore our exclusive collection of stylish shorts."
    />
  </div>
  );
}