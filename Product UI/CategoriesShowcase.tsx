"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

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
          <div className="w-12 h-0.5 bg-black animate-pulse"></div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-black">
            Syncing Collections...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative w-full py-12 bg-white overflow-hidden">
      <div className="relative max-w-[1400px] mx-auto px-6 md:px-10">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-6 bg-black/40" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-black/40">
                Foundations
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-black tracking-tight leading-tight">
              Shop By <span className="text-black/40 font-medium italic">Category</span>
            </h2>
          </div>
          
          {/* Custom Navigation Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => scroll("left")}
              className="p-2.5 border border-black/10 rounded-full hover:bg-black hover:text-white transition-all duration-300"
              aria-label="Previous"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2.5 border border-black/10 rounded-full hover:bg-black hover:text-white transition-all duration-300"
              aria-label="Next"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={getCategoryRoute(cat.slug)}
              className="group relative flex-shrink-0 w-72 md:w-[380px] aspect-[3/4] overflow-hidden rounded-lg border border-black/5"
            >
              {/* Image with subtle scale effect */}
              <div className="absolute inset-0">
                <Image
                  src={cat.imageUrl}
                  alt={cat.title}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 288px, 380px"
                />
              </div>

              {/* Overlay Gradients - Smooth & Balanced */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Content Box */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight mb-2 group-hover:-translate-y-1 transition-transform duration-300">
                  {cat.title}
                </h3>
                
                <div className="flex items-center gap-2 transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <span className="text-xs font-medium uppercase tracking-wider text-white/90">
                    View Lookbook
                  </span>
                  <ArrowRight size={14} className="text-white/90" />
                </div>
              </div>

              {/* Top Right Label */}
              <div className="absolute top-6 right-6">
                 <span className="text-[10px] font-medium text-white/70 uppercase tracking-widest [writing-mode:vertical-lr]">
                   Collection 0{cat.id}
                 </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Progress Bar Indicator */}
        <div className="w-full h-[1px] bg-black/5 mt-4 relative">
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