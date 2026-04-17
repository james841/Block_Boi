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

type CachedData = {
  products: Product[];
  timestamp: number;
};

const CACHE_DURATION = 5 * 60 * 1000;
const CACHE_KEY = "featured_products_cache";

export default function PopularProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [likedProducts, setLikedProducts] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [cacheStatus, setCacheStatus] = useState<"loading" | "cached" | "fresh">("loading");
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchProducts();
    loadLikedProducts();
  }, []);

  const fetchProducts = async (forceRefresh = false) => {
    try {
      if (!forceRefresh) {
        const cachedData = getCachedProducts();
        if (cachedData) {
          setProducts(cachedData);
          setCacheStatus("cached");
          setIsLoading(false);
          return;
        }
      }

      setCacheStatus("loading");
      const response = await fetch("/api/Products/Featured");
      if (!response.ok) throw new Error("Failed to fetch");
      
      const data = await response.json();
      if (data.success && Array.isArray(data.products)) {
        const normalized = data.products.map((p: Product) => ({
          ...p,
          oldPrice: p.oldPrice === 0 ? null : p.oldPrice,
        }));
        saveProductsToCache(normalized);
        setProducts(normalized);
        setCacheStatus("fresh");
      }
      setIsLoading(false);
    } catch (error) {
      const stale = getStaleCache();
      if (stale) setProducts(stale);
      setIsLoading(false);
    }
  };

  const getCachedProducts = () => {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const { products, timestamp }: CachedData = JSON.parse(cached);
    return Date.now() - timestamp < CACHE_DURATION ? products : null;
  };

  const getStaleCache = () => {
    if (typeof window === "undefined") return null;
    const cached = localStorage.getItem(CACHE_KEY);
    return cached ? JSON.parse(cached).products : null;
  };

  const saveProductsToCache = (products: Product[]) => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CACHE_KEY, JSON.stringify({ products, timestamp: Date.now() }));
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
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-black">
                The <span className="text-black/20">Edit</span>
              </h2>
              {cacheStatus === "cached" && (
                <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-black text-white self-start mt-2">
                  Stored
                </span>
              )}
            </div>
            <p className="max-w-md text-xs font-bold uppercase tracking-[0.2em] text-black/40 leading-relaxed">
              Curated essentials defined by architectural silhouettes and premium construction.
            </p>
          </div>

          <button
            onClick={() => fetchProducts(true)}
            className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] hover:text-black/50 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Inventory
          </button>
        </div>

        {/* Filter Wrapper */}
        <div className="mb-12 border-b border-black/5 pb-8">
          <ProductFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-black/5 border border-black/5">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="group bg-white relative overflow-hidden transition-all duration-500 opacity-0 animate-fadeIn"
              style={{ animationDelay: `${index * 0.05}s`, animationFillMode: "forwards" }}
            >
              {/* Image Area - COLORS PRESERVED */}
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
                
                {/* Overlay Sale Badge */}
                {product.oldPrice && product.oldPrice > product.price && (
                  <div className="absolute top-0 left-0 bg-black text-white px-3 py-1.5 text-[9px] font-black uppercase tracking-widest">
                    Reduced
                  </div>
                )}

                {/* Like Button */}
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

              {/* Info Area */}
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

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="py-32 text-center border border-dashed border-black/10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-black/20">
              Selected category is currently empty
            </p>
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