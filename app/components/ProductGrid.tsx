"use client";

import { useState, useEffect } from "react";
import { Heart, ShoppingCart } from "lucide-react";
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
  const { formatPrice } = useCurrency();

  useEffect(() => {
    fetchProducts();
    loadLikedProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/Products/Featured");
      if (!response.ok) throw new Error("Failed to fetch products");
      const data = await response.json();
      if (data.success && Array.isArray(data.products)) {
        const normalizedProducts = data.products.map((p: Product) => ({
          ...p,
          oldPrice: p.oldPrice === 0 ? null : p.oldPrice,
        }));
        setProducts(normalizedProducts);
      }
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching products:", error);
      setIsLoading(false);
    }
  };

  const loadLikedProducts = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("likedProducts");
      if (saved) setLikedProducts(new Set(JSON.parse(saved)));
    }
  };

  const toggleLike = (productId: number) => {
    setLikedProducts((prev) => {
      const newLiked = new Set(prev);
      if (newLiked.has(productId)) {
        newLiked.delete(productId);
      } else {
        newLiked.add(productId);
      }
      localStorage.setItem("likedProducts", JSON.stringify([...newLiked]));
      return newLiked;
    });
  };

  const filteredProducts = products.filter((product) => {
    if (activeFilter === "all") return true;
    return product.category?.toLowerCase() === activeFilter.toLowerCase();
  });

  if (isLoading) {
    return (
      <section className="bg-gray-50 min-h-screen py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center h-96">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-black rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-50 py-12 md:py-20 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Popular Products
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
            Discover our most loved items, handpicked for style and quality.
          </p>
        </div>

        {/* Filter */}
        <div className="mb-10 md:mb-14 px-4">
          <ProductFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 px-4">
          {filteredProducts.map((product, index) => (
            <Link href={`/Cloths/${product.id}`} key={product.id}>
              <div
                className="group relative bg-white rounded-3xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 opacity-0 animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 font-medium text-lg">No Image</span>
                    </div>
                  )}

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleLike(product.id);
                    }}
                    className={`absolute top-4 right-4 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl z-10 ${
                      likedProducts.has(product.id)
                        ? "bg-red-500 text-white scale-110"
                        : "bg-white/95 text-gray-800 hover:bg-white"
                    } backdrop-blur-sm`}
                  >
                    <Heart
                      className={`w-6 h-6 sm:w-7 sm:h-7 transition-all ${
                        likedProducts.has(product.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>

                  {/* Sale Badge */}
                  {product.oldPrice && product.oldPrice > product.price && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-md">
                      SALE
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 space-y-4">
                  <h3 className="font-bold text-gray-900 text-lg sm:text-xl line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {product.name}
                  </h3>

                  {/* Price + Add to Cart */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span className="text-base sm:text-lg text-gray-500 line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>

                    {/* Add to Cart - Responsive */}
                    <div className="flex sm:hidden w-full">
                      {/* Mobile: Full-width button with text */}
                      <button className="w-full px-6 py-4 bg-black hover:bg-gray-800 text-white rounded-full font-semibold flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg">
                        <ShoppingCart className="w-5 h-5" />
                        <span>Add to Cart</span>
                      </button>
                    </div>

                    <div className="hidden sm:flex">
                      {/* Desktop: Icon-only circle button */}
                      <button className="p-4 bg-gray-100 rounded-full group-hover:bg-black transition-all duration-300 hover:scale-110">
                        <ShoppingCart className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-24 px-4">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-8" />
            <p className="text-xl sm:text-2xl text-gray-600">No products found in this category</p>
            <p className="text-gray-500 mt-2">Try selecting a different filter</p>
          </div>
        )}
      </div>

      {/* Animation */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.7s ease-out forwards;
        }
      `}</style>
    </section>
  );
}