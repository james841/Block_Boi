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
    <section className="min-h-screen bg-[#FAF6F3] text-black py-12 px-4 md:px-8">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Top Header Search & Filter Bar */}
        <div className="flex flex-col gap-6 mb-10 bg-white p-6 rounded-md border border-black/5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight text-[#c64171]">
                {category ? category : "The Shop"}
              </h1>
            </div>

            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Search collection..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-transparent border-b border-black/20 py-2 pr-8 text-sm focus:border-black focus:outline-none transition-colors"
              />
              <Search className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40" />
            </div>
          </div>

          {/* Top Horizontal Filter Row */}
          {!hideFilters && allCategories.length > 0 && (
            <div className="border-t border-black/5 pt-4">
              <ProductSelect
                categories={allCategories}
                selectedCategories={selectedCategories}
                onCategoryChange={setSelectedCategories}
              />
            </div>
          )}
        </div>

        {/* 4-Column Balanced Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
          {products.map((product) => (
            <div key={product.id} className="group flex flex-col bg-white p-2 rounded shadow-sm border border-black/[0.03]">
              
              {/* Image Container with clean aspect-ratio */}
              <Link href={`/Cloths/${product.id}`} className="block aspect-[3/4] overflow-hidden bg-[#f3f3f3] relative rounded-sm">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                  />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.02] transition-colors" />
                
                {/* Badge layout matching reference */}
                <div className="absolute bottom-3 left-3">
                   <span className="bg-[#c64171] text-white text-[9px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                     New
                   </span>
                </div>
              </Link>

              {/* Centered Product Text Details mapping exactly to baeBRONX styles */}
              <div className="mt-4 flex flex-col items-center text-center px-2 flex-grow justify-between gap-1">
                <div className="space-y-1">
                  <h3 className="text-xs font-bold uppercase tracking-wide text-[#c64171] line-clamp-2 min-h-[2rem] hover:underline">
                    <Link href={`/Cloths/${product.id}`}>{product.name}</Link>
                  </h3>
                  <p className="text-xs font-semibold text-black/80">
                    {formatPrice(product.price)}
                  </p>
                </div>

                <div className="pt-2 w-full border-t border-black/[0.04] mt-2">
                  <Link 
                    href={`/Cloths/${product.id}`}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-black/50 hover:text-black transition-colors"
                  >
                    View Piece <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Pagination Section */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center pt-8">
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