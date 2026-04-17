"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Search, X, ShoppingBag, ArrowRight, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProductSelect from "./ProductSelect";
import { useCurrency } from "@/app/contexts/CurrencyContext";
import Pagination from "@/app/components/Pignation";

type Product = {
  id: number;
  name: string;
  description: string | null;
  oldPrice: number | null;
  price: number;
  imageUrl: string | null;
  category: string | null;
  likes: number;
};

type ProductListProps = {
  category?: string;
  hideFilters?: boolean;
};

export default function ProductList({ category, hideFilters = false }: ProductListProps) {
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();

  const urlCategories = category ? [category] : searchParams.get("category")?.split(",").filter(Boolean) ?? [];
  const urlSearch = searchParams.get("search") ?? "";

  const [selectedCategories, setSelectedCategories] = useState<string[]>(urlCategories);
  const [searchTerm, setSearchTerm] = useState(urlSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(urlSearch);
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [likedProducts, setLikedProducts] = useState<Set<number>>(new Set());

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProducts = useCallback(async (page: number) => {
    if (page === 1 && !isSearching) setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "12" });
      if (selectedCategories.length > 0) params.set("category", selectedCategories.join(","));
      if (debouncedSearch) params.set("search", debouncedSearch);

      const res = await fetch(`/api/Products?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
      setTotalPages(data.pagination?.totalPages || 1);
      
      const uniqueCats = Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
      if (allCategories.length === 0) setAllCategories(uniqueCats);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  }, [selectedCategories, debouncedSearch]);

  useEffect(() => { fetchProducts(currentPage); }, [currentPage, fetchProducts]);

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-12 h-[2px] bg-black animate-stretch" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-white text-black py-20 px-6 md:px-10">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Header & Search */}
        <div className="flex flex-col gap-12 mb-20">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="h-[1px] w-8 bg-black" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em]">Essential Archive</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-[0.85]">
              {category ? category : "The Shop"}<span className="text-black/10">.</span>
            </h1>
          </div>

          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="SEARCH CATALOGUE_"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-b-2 border-black py-4 text-xl font-black uppercase tracking-widest placeholder:text-black/20 focus:outline-none"
            />
            <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-6 h-6" />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Sidebar */}
          {!hideFilters && (
            <div className="lg:w-64 flex-shrink-0">
              <div className="sticky top-32 space-y-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-black/40">Filters</h3>
                <ProductSelect
                  categories={allCategories}
                  selectedCategories={selectedCategories}
                  onCategoryChange={setSelectedCategories}
                />
              </div>
            </div>
          )}

          {/* Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-px bg-black/10 border border-black/10">
              {products.map((product) => (
                <div key={product.id} className="group bg-white relative p-6 transition-all duration-500">
                  <Link href={`/Cloths/${product.id}`} className="block aspect-[3/4] overflow-hidden bg-gray-100 relative">
                    {product.imageUrl && (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                      />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                    
                    {/* Badge */}
                    <div className="absolute top-4 left-4">
                       <span className="bg-black text-white text-[9px] font-black px-2 py-1 uppercase tracking-widest">
                         New Arrival
                       </span>
                    </div>
                  </Link>

                  <div className="mt-8 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-black uppercase tracking-tighter leading-tight max-w-[70%]">
                        {product.name}
                      </h3>
                      <span className="text-sm font-bold tracking-tighter">
                        {formatPrice(product.price)}
                      </span>
                    </div>

                    <p className="text-[11px] font-bold uppercase tracking-widest text-black/40 line-clamp-1">
                      {product.category || "General"} — Collection 2026
                    </p>

                    <Link 
                      href={`/Cloths/${product.id}`}
                      className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] group/btn"
                    >
                      View Piece <ArrowRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-2" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-20 flex justify-center border-t border-black/5 pt-10">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(p) => {
                    setCurrentPage(p);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes stretch {
          0%, 100% { width: 20px; }
          50% { width: 60px; }
        }
        .animate-stretch {
          animation: stretch 1.5s ease-in-out infinite;
        }
      `}</style>
    </section>
  );
}