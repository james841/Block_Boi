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
    <main className="min-h-screen bg-[#FAF6F3]">
      
      {/* 1. HERO BANNER WITH BACKGROUND IMAGE */}
      <section className="relative h-48 md:h-64 flex items-center overflow-hidden bg-black">
        {/* Background image container matching reference style */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441984908747-50f98ebb1f41?q=80&w=2070')] bg-cover bg-center opacity-30 mix-blend-luminosity scale-105" />
        
        {/* Visual Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

        <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-10 z-10">
          <div className="space-y-1 md:space-y-2">
            
            {/* Clean Breadcrumb Hierarchy */}
            <div className="flex items-center gap-1.5 text-[10px] md:text-xs uppercase font-medium tracking-wider text-white/50">
              <span>Home</span>
              <span className="text-white/20">/</span>
              <span>{category}</span>
            </div>

            {/* Title styled with clean pink color matching reference */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-tight text-[#c64171]">
              {title}
            </h1>
            
          </div>
        </div>
      </section>

      {/* 2. MAIN PRODUCT FEED CONTAINER */}
      <section className="py-10">
        <div className="max-w-[1400px] mx-auto">
          {/* ProductList now dynamically displays selection underneath */}
          <ProductList category={category} />
        </div>
      </section>

    </main>
  );
}