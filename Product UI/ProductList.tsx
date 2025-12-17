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

  // Sync categories from prop changes
  useEffect(() => {
    if (category) {
      setSelectedCategories([category]);
    }
  }, [category]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update URL when filters or search change (but don't trigger fetch)
  useEffect(() => {
    if (!category) {
      const params = new URLSearchParams();
      if (selectedCategories.length) {
        params.set("category", selectedCategories.join(","));
      }
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      const queryString = params.toString();
      router.replace(queryString ? `?${queryString}` : window.location.pathname, { 
        scroll: false 
      });
    }
  }, [selectedCategories, debouncedSearch, router, category]);

  // Load liked products from localStorage
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

  // Memoized fetch function
  const fetchProducts = useCallback(async (page: number, isPaginating: boolean = false) => {
    // Set appropriate loading state
    if (isPaginating) {
      setIsPaginationLoading(true);
    } else if (debouncedSearch && page === 1) {
      setIsSearching(true);
    } else if (page === 1) {
      setIsLoading(true);
    }

    try {
      const base = `/api/Products?page=${page}&limit=12`;
      const catParam = selectedCategories.length
        ? `&category=${selectedCategories.map(encodeURIComponent).join(",")}`
        : "";
      const searchParam = debouncedSearch
        ? `&search=${encodeURIComponent(debouncedSearch)}`
        : "";

      const url = `${base}${catParam}${searchParam}`;
      console.log('Fetching:', url);
      
      const res = await fetch(url);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();

      setProducts(data.products ?? []);
      setTotalPages(data.pagination?.totalPages ?? 1);

      // Extract unique categories
      const cats = [
        ...new Set(
          data.products?.map((p: Product) => p.category).filter(Boolean)
        ),
      ] as string[];
      setAllCategories(cats);
      
      console.log('Fetched:', data.products?.length, 'products');
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

  // Reset to page 1 when filters or search change
  useEffect(() => {
    console.log('Filters changed, resetting to page 1');
    setCurrentPage(1);
  }, [selectedCategories, debouncedSearch]);

  // Fetch products when page changes
  useEffect(() => {
    console.log('Fetching page:', currentPage);
    const isPaginating = currentPage > 1;
    fetchProducts(currentPage, isPaginating);
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
      if (isLiked) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      setLikedProducts(newSet);
      localStorage.setItem("likedProducts", JSON.stringify([...newSet]));
    } catch (e) {
      console.error("Error toggling like:", e);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const clearAllFilters = () => {
    setSearchTerm("");
    setSelectedCategories([]);
  };

  // Handle page change from pagination
  const handlePageChange = (newPage: number) => {
    console.log('Page change requested:', newPage);
    setCurrentPage(newPage);
  };

  // Initial loading state
  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Loading products...
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Top Search Bar */}
      <div className="mb-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all shadow-lg"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            {isSearching && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          {debouncedSearch && (
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center">
              Searching for:{" "}
              <span className="font-semibold text-orange-500">
                "{debouncedSearch}"
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {!hideFilters && (
          <ProductSelect
            categories={allCategories}
            selectedCategories={selectedCategories}
            onCategoryChange={setSelectedCategories}
          />
        )}

        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
              {category
                ? `${category.charAt(0).toUpperCase() + category.slice(1)}`
                : "All Products"}
              {products.length > 0 && (
                <span className="ml-3 text-lg font-normal text-gray-500 dark:text-gray-400">
                  ({products.length} {products.length === 1 ? "item" : "items"})
                </span>
              )}
            </h1>
          </div>

          {/* Pagination Loading Overlay */}
          {isPaginationLoading && (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center space-y-4">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-orange-200 dark:border-orange-900 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-semibold text-lg">
                  Loading products...
                </p>
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Page {currentPage} of {totalPages}
                </p>
              </div>
            </div>
          )}

          {products.length === 0 && !isLoading ? (
            <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-3xl shadow-lg border-2 border-gray-100 dark:border-gray-700">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                No products found
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {debouncedSearch
                  ? `No results for "${debouncedSearch}"`
                  : selectedCategories.length > 0
                  ? "No products in selected categories"
                  : "No products available"}
              </p>
              {(debouncedSearch || selectedCategories.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-opacity duration-300 ${isPaginationLoading ? 'opacity-50' : 'opacity-100'}`}>
                {products.map((product) => {
                  const discount =
                    product.oldPrice && product.oldPrice > product.price
                      ? Math.round(
                          ((product.oldPrice - product.price) /
                            product.oldPrice) *
                            100
                        )
                      : null;

                  return (
                    <div
                      key={product.id}
                      className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-600"
                    >
                      <Link href={`/Cloths/${product.id}`}>
                        <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">
                                No Image
                              </span>
                            </div>
                          )}

                          {discount && (
                            <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                              -{discount}%
                            </div>
                          )}

                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              toggleLike(product.id, product.likes);
                            }}
                            className="absolute top-3 right-3 w-11 h-11 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-all z-10"
                          >
                            <Heart
                              className={`w-5 h-5 transition-all ${
                                likedProducts.has(product.id)
                                  ? "fill-red-500 text-red-500"
                                  : "text-gray-600 dark:text-gray-300"
                              }`}
                            />
                          </button>
                        </div>
                      </Link>

                      <div className="p-5 space-y-3">
                        <Link href={`/Cloths/${product.id}`}>
                          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2 hover:text-orange-500 dark:hover:text-orange-400 transition-colors min-h-[3rem]">
                            {product.name}
                          </h3>
                        </Link>

                        <div className="flex items-center gap-3">
                          {product.oldPrice && (
                            <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              {formatPrice(product.oldPrice)}
                            </span>
                          )}
                          <span className="text-xl font-bold text-gray-900 dark:text-white">
                            {formatPrice(product.price)}
                          </span>
                        </div>

                        <Link href={`/Cloths/${product.id}`} className="block">
                          <button className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold rounded-xl transform hover:scale-[1.02] transition-all duration-200 shadow-md hover:shadow-lg">
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              {totalPages > 1 && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}