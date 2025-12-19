"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Search, X } from "lucide-react";
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

export default function ProductList({
  category,
  hideFilters = false,
}: ProductListProps) {
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL or props
  const urlCategories = category
    ? [category]
    : searchParams.get("category")?.split(",").filter(Boolean) ?? [];
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
  const [isPaginationLoading, setIsPaginationLoading] = useState(false);
  const [likedProducts, setLikedProducts] = useState<Set<number>>(new Set());

  // Sync categories from prop changes (e.g. category page)
  useEffect(() => {
    if (category) {
      setSelectedCategories([category]);
    }
  }, [category]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500); // Slightly longer debounce for better UX
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update URL without triggering full reload
  useEffect(() => {
    if (!category) {
      const params = new URLSearchParams();
      if (selectedCategories.length > 0) {
        params.set("category", selectedCategories.join(","));
      }
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      const query = params.toString();
      router.replace(query ? `?${query}` : "/Cloths", { scroll: false });
    }
  }, [selectedCategories, debouncedSearch, router, category]);

  // Load liked products
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("likedProducts");
      if (saved) {
        try {
          setLikedProducts(new Set(JSON.parse(saved)));
        } catch (e) {
          console.error("Error loading liked products:", e);
        }
      }
    }
  }, []);

  // Memoized fetch — now benefits from server cache when applicable
  const fetchProducts = useCallback(async (page: number, isPaginating: boolean = false) => {
    if (isPaginating) {
      setIsPaginationLoading(true);
    } else if (debouncedSearch && page === 1) {
      setIsSearching(true);
    } else if (page === 1) {
      setIsLoading(true);
    }

    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
      });

      // Only add filters if they exist — this allows cache hit when none are applied
      if (selectedCategories.length > 0) {
        params.set("category", selectedCategories.join(","));
      }
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      // Optional: Add ?refresh=true to URL to force bypass cache (for debugging)
      const url = `/api/Products?${params.toString()}`;
      console.log("Fetching products:", url);

      const res = await fetch(url, {
        next: { revalidate: 60 }, // Optional: ISR fallback
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      // Handle both cached and fresh responses
      if (data.success === false) {
        throw new Error(data.message || "Failed to load products");
      }

      const productList = data.products || [];
      setProducts(productList);
      setTotalPages(data.pagination?.totalPages || 1);

      // Extract categories from current products
      const uniqueCats = Array.from(
        new Set(productList.map((p: Product) => p.category).filter(Boolean))
      ) as string[];
      setAllCategories(uniqueCats);

      console.log(`Loaded ${productList.length} products ${data.cached ? "(from cache)" : ""}`);
    } catch (err) {
      console.error("Fetch error:", err);
      setProducts([]);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
      setIsSearching(false);
      setIsPaginationLoading(false);
    }
  }, [selectedCategories, debouncedSearch]);

  // Reset page on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategories, debouncedSearch]);

  // Fetch on page or dependencies change
  useEffect(() => {
    fetchProducts(currentPage, currentPage > 1);
  }, [currentPage, fetchProducts]);

  const toggleLike = async (productId: number, currentLikes: number) => {
    const isLiked = likedProducts.has(productId);
    const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;

    try {
      await fetch("/api/Products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, likes: newLikes }),
      });

      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, likes: newLikes } : p))
      );

      const newSet = new Set(likedProducts);
      if (isLiked) newSet.delete(productId);
      else newSet.add(productId);

      setLikedProducts(newSet);
      localStorage.setItem("likedProducts", JSON.stringify([...newSet]));
    } catch (e) {
      console.error("Error toggling like:", e);
    }
  };

  const clearSearch = () => setSearchTerm("");
  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      {/* Search Bar */}
      <div className="mb-10">
        <div className="max-w-3xl mx-auto relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-12 py-5 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-300 focus:border-orange-500 transition-all shadow-lg text-lg"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
            >
              <X className="w-6 h-6" />
            </button>
          )}
          {isSearching && (
            <div className="absolute right-14 top-1/2 -translate-y-1/2">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {!hideFilters && (
          <ProductSelect
            categories={allCategories}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
          />
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {category
                ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`
                : "All Products"}
              <span className="ml-4 text-xl font-normal text-gray-500">
                ({products.length} {products.length === 1 ? "item" : "items"})
              </span>
            </h1>
          </div>

          {/* Pagination Loading Overlay */}
          {isPaginationLoading && (
            <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white rounded-2xl p-8 shadow-2xl text-center">
                <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-lg font-semibold">Loading page {currentPage}...</p>
              </div>
            </div>
          )}

          {products.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl shadow-lg">
              <Search className="w-20 h-20 text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">No products found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {debouncedSearch
                  ? `No results for "${debouncedSearch}"`
                  : "Try adjusting your filters or search term"}
              </p>
              {(debouncedSearch || selectedCategories.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {products.map((product) => {
                  const discount = product.oldPrice && product.oldPrice > product.price
                    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                    : null;

                  return (
                    <div
                      key={product.id}
                      className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 border border-gray-100"
                    >
                      <Link href={`/Cloths/${product.id}`}>
                        <div className="relative aspect-square overflow-hidden bg-gray-50">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No Image
                            </div>
                          )}

                          {discount && (
                            <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-bold">
                              -{discount}%
                            </div>
                          )}

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleLike(product.id, product.likes);
                            }}
                            className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition"
                          >
                            <Heart
                              className={`w-6 h-6 ${
                                likedProducts.has(product.id)
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-700"
                              }`}
                            />
                          </button>
                        </div>
                      </Link>

                      <div className="p-6 space-y-4">
                        <Link href={`/Cloths/${product.id}`}>
                          <h3 className="font-bold text-lg text-gray-900 line-clamp-2 hover:text-orange-600 transition">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-3">
                          {product.oldPrice && (
                            <span className="text-gray-500 line-through">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                          <span className="text-2xl font-bold text-gray-900">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        <Link href={`/Cloths/${product.id}`} className="block">
                          <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all hover:shadow-xl">
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-12">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}