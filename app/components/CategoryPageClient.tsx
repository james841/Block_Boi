'use client';

import ProductList from "@/Product UI/ProductList";

type CategoryPageClientProps = {
  category: string;
  title: string;
  description: string;
};

export default function CategoryPageClient({ 
  category, 
  title, 
  description 
}: CategoryPageClientProps) {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-400 to-orange-500 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            {title}
          </h1>
          <p className="text-orange-100 text-lg">
            {description}
          </p>
        </div>
      </div>

     
      {/* ✅ Use the category prop passed from parent component */}
      <ProductList category={category} />
    </main>
  );
}
