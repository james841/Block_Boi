"use client";

import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

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
      shoes: "category/shoe",
      "t-shirt": "category/shirt",
      shirts: "category/shirt",
      shorts: "category/shorts",
      'trouser': 'category/trouser',     
      'trousers': 'category/trouser',  
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
      <div className="w-full px-6 py-16 text-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="inline-flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-lg font-medium">
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="w-full px-6 py-16 text-center bg-gradient-to-br from-gray-50 to-gray-100">
        <p className="text-gray-500 text-lg">No categories available yet.</p>
      </div>
    );
  }

  return (
    <section className="relative w-full py-16 bg-gradient-to-br from-gray-50 via-white to-gray-50 overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-20 translate-x-1/2 translate-y-1/2"></div>

      <div className="relative max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Sparkles size={16} />
            <span>Explore Collections</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 mb-4">
            Shop by Category
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our curated collections and find exactly what you're
            looking for
          </p>
        </div>

        
        <div className="relative group">
          
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm hover:bg-white text-gray-800 p-4 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} />
          </button>

          
          <div
            ref={scrollContainerRef}
            className="flex gap-8 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {categories.map((cat, index) => (
              <Link
                key={cat.id}
                href={getCategoryRoute(cat.slug)}
                className="group/card relative flex-shrink-0 w-80 h-[480px] rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:scale-105"
                style={{
                  animation: `slideIn 0.6s ease-out ${index * 0.1}s both`,
                }}
              >
                
                <div className="absolute inset-0">
                  <Image
                    src={cat.imageUrl}
                    alt={cat.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover/card:scale-110"
                    sizes="320px"
                  />
                </div>

                
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70 group-hover/card:opacity-80 transition-opacity duration-500"></div>

                
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover/card:scale-x-100 transition-transform duration-500 origin-left"></div>

                
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div className="transform translate-y-4 group-hover/card:translate-y-0 transition-transform duration-500">
                    <h3 className="text-4xl font-black text-white mb-3 drop-shadow-2xl">
                      {cat.title}
                    </h3>
                    <div className="flex items-center gap-2 text-white/90 font-semibold opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 delay-100">
                      <span>Explore Collection</span>
                      <ChevronRight
                        size={20}
                        className="transform group-hover/card:translate-x-2 transition-transform duration-300"
                      />
                    </div>
                  </div>
                </div>

                
                <div className="absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500">
                  <div className="absolute top-0 -left-full h-full w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent transform skew-x-12 group-hover/card:animate-shimmer"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        
        <div className="flex justify-center gap-2 mt-8">
          {categories.length > 4 && (
            <p className="text-gray-500 text-sm">
              Scroll to see more →
            </p>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes shimmer {
          0% {
            left: -100%;
          }
          100% {
            left: 200%;
          }
        }

        .animate-shimmer {
          animation: shimmer 1.5s ease-in-out;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .shadow-3xl {
          box-shadow: 0 35px 60px -15px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </section>
  );
}