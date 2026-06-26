"use client";

import { useState, useEffect } from "react";
import { Heart, ShoppingCart, RefreshCw } from "lucide-react";
import ProductFilter from "./ProductFilter";
import Link from "next/link";
import { useCurrency } from '@/app/contexts/CurrencyContext';

type Product = {
  id: number;
  name: string;
  description: string | null;
  oldPrice: number | null;
  price: number;
  imageUrl: string | null;
  category?: string;
  featuredOnHomepage?: boolean;
};

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [likedProducts, setLikedProducts] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { formatPrice } = useCurrency();

  // Derive unique categories directly from fetched products — no hardcoding
  const categories = Array.from(
    new Set(products.map((p) => p.category).filter(Boolean))
  ) as string[];

  useEffect(() => {
    fetchProducts();
    loadLikedProducts();
    // Clean up any old localStorage cache that was causing cross-browser issues
    localStorage.removeItem("featured_products_cache");
  }, []);

  const fetchProducts = async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    try {
      const response = await fetch(`/api/Products/Featured`, {
        next: { revalidate: 300 },
      });

      if (!response.ok) throw new Error("Failed to fetch");

      const data = await response.json();
      if (data.success && Array.isArray(data.products)) {
        const normalized = data.products.map((p: Product) => ({
          ...p,
          oldPrice: p.oldPrice === 0 ? null : p.oldPrice,
        }));
        setProducts(normalized);
        if (isManualRefresh) setActiveFilter("all");
      }
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const toggleLike = (productId: number) => {
    setLikedProducts((prev) => {
      const newLiked = new Set(prev);
      newLiked.has(productId) ? newLiked.delete(productId) : newLiked.add(productId);
      localStorage.setItem("likedProducts", JSON.stringify([...newLiked]));
      return newLiked;
    });
  };

  const loadLikedProducts = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("likedProducts");
      if (saved) setLikedProducts(new Set(JSON.parse(saved)));
    }
  };

  const filteredProducts = products.filter((p) =>
    activeFilter === "all" ? true : p.category?.toLowerCase() === activeFilter.toLowerCase()
  );

  if (isLoading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center bg-white border-y border-black/5">
        <div className="w-10 h-10 border-2 border-black/10 border-t-black rounded-full animate-spin mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Loading Collection</span>
      </div>
    );
  }

  return (
    <section className="bg-white py-24 border-t border-black/5">
      <div className="max-w-[1400px] mx-auto px-6">

        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black">
              The <span className="text-black/20">Edit</span>
            </h2>
            <p className="max-w-md text-xs font-bold uppercase tracking-[0.2em] text-black/40 leading-relaxed">
              Curated essentials defined by architectural silhouettes and premium construction.
            </p>
          </div>

          <button
            onClick={() => fetchProducts(true)}
            disabled={isRefreshing}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] hover:text-black/50 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Inventory
          </button>
        </div>

        <div className="mb-12 border-b border-black/5 pb-8">
          <ProductFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            categories={categories}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-32 text-center border border-dashed border-black/10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">
              {products.length === 0
                ? "No featured products yet"
                : "Selected category is currently empty"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-black/5 border border-black/5">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="group bg-white relative overflow-hidden transition-all duration-500 opacity-0 animate-fadeIn"
                style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
              >
                <Link href={`/Cloths/${product.id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-50">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-black/20">
                      No Preview Available
                    </div>
                  )}

                  {product.oldPrice && product.oldPrice > product.price && (
                    <div className="absolute top-0 left-0 bg-black text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest">
                      Reduced
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleLike(product.id);
                    }}
                    className="absolute top-4 right-4 z-20"
                  >
                    <Heart
                      className={`w-5 h-5 transition-all duration-300 ${
                        likedProducts.has(product.id)
                          ? "fill-black text-black scale-110"
                          : "text-black/20 hover:text-black hover:scale-110"
                      }`}
                    />
                  </button>
                </Link>

                <div className="p-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-black/30 uppercase tracking-[0.2em]">
                      {product.category || "Collection"}
                    </span>
                    <Link href={`/Cloths/${product.id}`}>
                      <h3 className="text-sm font-black text-black uppercase tracking-tight line-clamp-1 hover:underline decoration-1 underline-offset-4">
                        {product.name}
                      </h3>
                    </Link>
                  </div>

                  <div className="flex items-end justify-between">
                    <div className="flex flex-col">
                      {product.oldPrice && (
                        <span className="text-[10px] text-black/30 line-through font-bold">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                      <span className="text-lg font-black tracking-tighter text-black">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <button className="flex items-center justify-center w-10 h-10 border border-black/10 hover:bg-black hover:text-white transition-all duration-300">
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }
      `}</style>
    </section>
  );
}