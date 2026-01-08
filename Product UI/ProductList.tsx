"use client";

import { useState, useEffect, useCallback } from "react";
import { Heart, Search, X, ShoppingBag, Star, TrendingUp } from "lucide-react";
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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
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

  // Fetch products
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

      if (selectedCategories.length > 0) {
        params.set("category", selectedCategories.join(","));
      }
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      const url = `/api/Products?${params.toString()}`;
      const res = await fetch(url, {
        next: { revalidate: 60 },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      if (data.success === false) {
        throw new Error(data.message || "Failed to load products");
      }

      const productList = data.products || [];
      setProducts(productList);
      setTotalPages(data.pagination?.totalPages || 1);

      const uniqueCats = Array.from(
        new Set(productList.map((p: Product) => p.category).filter(Boolean))
      ) as string[];
      setAllCategories(uniqueCats);
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-white text-xl font-semibold">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section with Search */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-orange-500/20 backdrop-blur-sm rounded-full text-orange-300 font-semibold mb-6 border border-orange-500/30">
            <TrendingUp className="w-5 h-5" />
            <span>Premium Quality Products</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 tracking-tight">
            {category
              ? `${category.charAt(0).toUpperCase() + category.slice(1)} Collection`
              : "Discover Amazing Products"}
          </h1>
          <p className="text-blue-200 text-lg md:text-xl mb-8 max-w-2xl mx-auto">
            Shop from our curated collection of premium items
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-3xl mx-auto relative">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-400 w-6 h-6 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="Search for products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-16 py-6 bg-white/10 backdrop-blur-md border-2 border-white/20 rounded-2xl focus:ring-4 focus:ring-orange-500/50 focus:border-orange-500 transition-all text-white placeholder-blue-300 text-lg shadow-2xl"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-300 hover:text-red-400 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              )}
              {isSearching && (
                <div className="absolute right-16 top-1/2 -translate-y-1/2">
                  <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          {!hideFilters && (
            <div className="lg:w-80 flex-shrink-0">
              <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-6 border border-white/20 shadow-2xl sticky top-6">
                <ProductSelect
                  categories={allCategories}
                  selectedCategories={selectedCategories}
                  onCategoryChange={setSelectedCategories}
                />
              </div>
            </div>
          )}

          {/* Main Content */}
          <div className="flex-1">
            {/* Stats Bar */}
            <div className="flex items-center justify-between mb-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center gap-4">
                <ShoppingBag className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-blue-200 text-sm">Total Products</p>
                  <p className="text-white text-2xl font-bold">{products.length}</p>
                </div>
              </div>
              
              {(debouncedSearch || selectedCategories.length > 0) && (
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/50 rounded-xl transition-all font-semibold"
                >
                  Clear All Filters
                </button>
              )}
            </div>

            {/* Pagination Loading Overlay */}
            {isPaginationLoading && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-3xl p-10 shadow-2xl text-center border-2 border-orange-500/50">
                  <div className="w-24 h-24 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
                  <p className="text-2xl font-bold text-white">Loading page {currentPage}...</p>
                  <p className="text-blue-300 mt-2">Please wait</p>
                </div>
              </div>
            )}

            {/* Products Grid or Empty State */}
            {products.length === 0 ? (
              <div className="text-center py-32 bg-white/10 backdrop-blur-md rounded-3xl shadow-2xl border border-white/20">
                <Search className="w-24 h-24 text-blue-400 mx-auto mb-6 opacity-50" />
                <h3 className="text-3xl font-bold text-white mb-4">No products found</h3>
                <p className="text-blue-200 mb-8 max-w-md mx-auto text-lg">
                  {debouncedSearch
                    ? `No results for "${debouncedSearch}"`
                    : "Try adjusting your filters or search term"}
                </p>
                {(debouncedSearch || selectedCategories.length > 0) && (
                  <button
                    onClick={clearAllFilters}
                    className="px-10 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-2xl transition-all shadow-xl hover:shadow-2xl hover:scale-105"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Products Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => {
                    const discount = product.oldPrice && product.oldPrice > product.price
                      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
                      : null;

                    return (
                      <div
                        key={product.id}
                        className="group bg-white/10 backdrop-blur-md rounded-3xl overflow-hidden hover:bg-white/20 transition-all duration-500 border border-white/20 hover:border-orange-500/50 hover:shadow-2xl hover:shadow-orange-500/20 hover:-translate-y-2"
                      >
                        <Link href={`/Cloths/${product.id}`}>
                          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-blue-800/50 to-blue-900/50">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <ShoppingBag className="w-20 h-20 text-blue-400/30" />
                              </div>
                            )}

                            {discount && (
                              <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-xl flex items-center gap-1">
                                <Star className="w-4 h-4 fill-white" />
                                -{discount}%
                              </div>
                            )}

                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                toggleLike(product.id, product.likes);
                              }}
                              className="absolute top-4 right-4 w-14 h-14 bg-white/90 backdrop-blur rounded-full shadow-xl flex items-center justify-center hover:scale-110 hover:bg-white transition-all"
                            >
                              <Heart
                                className={`w-6 h-6 ${
                                  likedProducts.has(product.id)
                                    ? "fill-red-500 text-red-500"
                                    : "text-gray-700"
                                }`}
                              />
                            </button>

                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <p className="text-white text-sm line-clamp-2">
                                {product.description || "Premium quality product"}
                              </p>
                            </div>
                          </div>
                        </Link>

                        <div className="p-6 space-y-4">
                          <Link href={`/Cloths/${product.id}`}>
                            <h3 className="font-bold text-lg text-white line-clamp-2 hover:text-orange-400 transition-colors">
                              {product.name}
                            </h3>
                          </Link>

                          <div className="flex items-center gap-3">
                            {product.oldPrice && (
                              <span className="text-blue-300 line-through text-sm">
                                {formatPrice(product.oldPrice)}
                              </span>
                            )}
                            <span className="text-2xl font-bold text-white">
                              {formatPrice(product.price)}
                            </span>
                          </div>

                          <Link href={`/Cloths/${product.id}`} className="block">
                            <button className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all hover:shadow-xl hover:shadow-orange-500/50 hover:scale-105 flex items-center justify-center gap-2">
                              <ShoppingBag className="w-5 h-5" />
                              View Details
                            </button>
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
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
      </div>
    </section>
  );
}