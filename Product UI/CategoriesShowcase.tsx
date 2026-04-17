"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from "lucide-react";

type Category = {
  id: number;
  title: string;
  imageUrl: string;
  slug: string;
};

export default function CategoryShowcase() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getCategoryRoute = (slug: string) => {
    const routeMap: Record<string, string> = {
      pants: "category/Pants",
      shirt: "category/shirt",
      shirts: "category/shirt",
      shorts: "category/shorts",
      hats: "category/Hats",
      jackets: "category/Jackets",
    };
    return routeMap[slug.toLowerCase()] || `/category/${slug}`;
  };

  useEffect(() => {
    fetch("/api/CategoriesShowcase")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data.categories || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load categories:", err);
        setLoading(false);
      });
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  if (loading) {
    return (
      <div className="w-full px-6 py-24 text-center bg-white">
        <div className="inline-flex flex-col items-center gap-4">
          <div className="w-12 h-1 bg-black animate-pulse"></div>
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black">
            Syncing Collections...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full py-24 bg-white overflow-hidden">
      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-black" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">
                Foundations
              </span>
            </div>
            <h2 className="text-6xl md:text-7xl font-black text-black uppercase tracking-tighter leading-none">
              Shop By <br /> <span className="text-black/20 italic">Category.</span>
            </h2>
          </div>
          
          {/* Custom Navigation Controls */}
          <div className="flex gap-4">
            <button
              onClick={() => scroll("left")}
              className="p-4 border border-black hover:bg-black hover:text-white transition-all duration-300 group"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-4 border border-black hover:bg-black hover:text-white transition-all duration-300 group"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-10"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={getCategoryRoute(cat.slug)}
              className="group relative flex-shrink-0 w-80 md:w-[450px] aspect-[3/4] overflow-hidden border border-black/5"
            >
              {/* Image with subtle scale effect */}
              <div className="absolute inset-0">
                <Image
                  src={cat.imageUrl}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  sizes="(max-width: 768px) 320px, 450px"
                />
                {/* Visual architectural frame */}
                <div className="absolute inset-4 border border-white/20 pointer-events-none group-hover:inset-6 transition-all duration-500" />
              </div>

              {/* Overlay Gradients - Muted */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content Box */}
              <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
                <h3 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4 group-hover:-translate-y-2 transition-transform duration-500">
                  {cat.title}
                </h3>
                
                <div className="flex items-center gap-3 transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">
                    View Lookbook
                  </span>
                  <ArrowRight size={16} className="text-white" />
                </div>
              </div>

              {/* Top Right Label */}
              <div className="absolute top-6 right-6">
                 <span className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em] [writing-mode:vertical-lr]">
                   Collection No. 0{cat.id}
                 </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Progress Bar Indicator */}
        <div className="w-full h-[1px] bg-black/5 mt-8 relative">
           <div className="absolute top-0 left-0 w-1/4 h-full bg-black/20" />
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}