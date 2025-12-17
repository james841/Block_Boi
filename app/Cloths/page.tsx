import CategoryShowcase from "@/Product UI/CategoriesShowcase";
import ProductList from "@/Product UI/ProductList";
import type { Metadata } from "next";

 
export const metadata: Metadata = {
  title: "Cloths",
  description: "Learn more about Bloq Boy and our mission.",
};


export default function Cloths() {
  return (
    <main>
      <h1 className="text-3xl font-bold mb-6">Cloths</h1>
      <CategoryShowcase />
      <ProductList  />
    </main>
  );
}