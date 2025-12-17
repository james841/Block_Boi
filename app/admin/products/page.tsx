"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Search,
  ArrowLeft,
  Package,
  TrendingUp,
  DollarSign,
  Star,
} from "lucide-react";
import Link from "next/link";

type Product = {
  id: number;
  name: string;
  price: number;
  oldPrice: number | null;
  imageUrl: string | null;
  category: string | null;
  featuredOnHomepage: boolean;
  createdAt: string;
};

export default function AdminProductManagement() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/Products");
      const data = await res.json();
      if (data.products) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this product? This action cannot be undone."
      )
    )
      return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/Products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete");
      }
    } catch (error) {
      alert("Network error");
    } finally {
      setDeletingId(null);
    }
  };

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: products.length,
    featured: products.filter((p) => p.featuredOnHomepage).length,
    totalValue: products.reduce((sum, p) => sum + p.price, 0),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r my-16 from-slate-800 to-slate-900 shadow-2xl border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/dashboard"
                className="p-3 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">
                  Product Management
                </h1>
                <p className="text-slate-400">
                  {products.length} total products
                </p>
              </div>
            </div>
            <Link
              href="/admin/products/add"
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-blue-500/50"
            >
              <Plus className="w-5 h-5" /> Add Product
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Package className="w-7 h-7" />
              </div>
              <TrendingUp className="w-5 h-5 opacity-70" />
            </div>
            <p className="text-blue-100 text-sm mb-1">Total Products</p>
            <p className="text-4xl font-bold">{stats.total}</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <Star className="w-7 h-7" />
              </div>
            </div>
            <p className="text-amber-100 text-sm mb-1">Featured Products</p>
            <p className="text-4xl font-bold">{stats.featured}</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                <DollarSign className="w-7 h-7" />
              </div>
            </div>
            <p className="text-emerald-100 text-sm mb-1">
              Total Inventory Value
            </p>
            <p className="text-4xl font-bold">
              ₦{(stats.totalValue / 1000).toFixed(1)}k
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-slate-800 rounded-2xl shadow-xl border border-slate-700 p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900 border-2 border-slate-700 text-white rounded-xl focus:border-blue-500 focus:outline-none placeholder-slate-500"
              />
            </div>
            <div className="flex gap-2">
              {categories
                .filter((cat): cat is string => typeof cat === "string")
                .map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      categoryFilter === cat
                        ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/30"
                        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {cat === "all" ? "All" : cat}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-700 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 group"
            >
              <div className="relative aspect-square bg-slate-900">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-600">
                    <Package className="w-20 h-20" />
                  </div>
                )}
                {product.featuredOnHomepage && (
                  <span className="absolute top-3 left-3 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-1">
                    <Star className="w-3 h-3" /> Featured
                  </span>
                )}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-white mb-2 line-clamp-2 text-lg">
                  {product.name}
                </h3>

                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl font-bold text-emerald-400">
                    ₦{product.price.toLocaleString()}
                  </span>
                  {product.oldPrice && (
                    <span className="text-sm text-slate-500 line-through">
                      ₦{product.oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {product.category && (
                  <span className="inline-block px-3 py-1 bg-slate-700 text-slate-300 text-xs font-medium rounded-lg mb-4">
                    {product.category}
                  </span>
                )}

                <div className="flex gap-2">
                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors font-medium"
                  >
                    <Edit className="w-4 h-4" /> Edit
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    disabled={deletingId === product.id}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-rose-600 text-white rounded-xl hover:bg-rose-500 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingId === product.id ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" /> Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <Package className="w-24 h-24 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-xl mb-2">No products found</p>
            <p className="text-slate-500">
              Try adjusting your search or filters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
