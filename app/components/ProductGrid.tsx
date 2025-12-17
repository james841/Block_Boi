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
    <section className="bg-gray-50 min-h-screen py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Popular Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our most loved items, handpicked for style and quality.
          </p>
        </div>

        {/* Filter */}
        <div className="mb-12">
          <ProductFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map((product, index) => (
            <Link href={`/Cloths/${product.id}`} key={product.id}>
              <div
                className="group relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 opacity-0 animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s`, animationFillMode: "forwards" }}
              >
                {/* Image Container */}
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">No Image</span>
                    </div>
                  )}

                  {/* Like Button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleLike(product.id);
                    }}
                    className={`absolute top-4 right-4 w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                      likedProducts.has(product.id)
                        ? "bg-red-500 text-white scale-110"
                        : "bg-white/90 text-gray-700 hover:bg-white"
                    } backdrop-blur-sm`}
                  >
                    <Heart
                      className={`w-6 h-6 transition-all ${
                        likedProducts.has(product.id) ? "fill-current" : ""
                      }`}
                    />
                  </button>

                  {/* Sale Badge (if discounted) */}
                  {product.oldPrice && product.oldPrice > product.price && (
                    <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      SALE
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 group-hover:text-gray-700 transition-colors">
                    {product.name}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>

                    <div className="p-3 bg-gray-100 rounded-full group-hover:bg-black transition-colors">
                      <ShoppingCart className="w-5 h-5 text-gray-700 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-24">
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-8" />
            <p className="text-xl text-gray-600">No products found in this category</p>
            <p className="text-gray-500 mt-2">Try selecting a different filter</p>
          </div>
        )}
      </div>

      {/* Tailwind Animation */}
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