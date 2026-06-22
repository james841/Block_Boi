"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Search, Package, Star, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
import StatCard from "@/app/components/admin/ui/StatCard";
import EmptyState from "@/app/components/admin/ui/EmptyState";
import PageHeader from "@/app/components/admin/ui/PageHeader";

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

export default function ProductsTable({
  initialProducts,
  totalCount,
  currentPage,
  pageSize,
}: {
  initialProducts: Product[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
}) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const totalPages = Math.ceil(totalCount / pageSize);

  const categories = [
    "all",
    ...Array.from(new Set(products.map((p) => p.category).filter(Boolean))),
  ] as string[];

  const filtered = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: totalCount, // use the real total, not just this page
    featured: products.filter((p) => p.featuredOnHomepage).length,
    totalValue: products.reduce((sum, p) => sum + p.price, 0),
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Delete this product? This can't be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/Products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        router.refresh();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to delete");
      }
    } catch {
      alert("Network error");
    } finally {
      setDeletingId(null);
    }
  };

  const goToPage = (page: number) => {
    router.push(`/admin/products?page=${page}`);
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${totalCount} total products`}
        action={
          <Link
            href="/admin/products/add"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add Product
          </Link>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Products" value={stats.total} icon={Package} tone={"indigo" as unknown as Tone} />
        <StatCard label="Featured" value={stats.featured} icon={Star} tone={"amber" as unknown as Tone} />
        <StatCard
          label="Page Value"
          value={`₦${(stats.totalValue / 1000).toFixed(1)}k`}
          icon={DollarSign}
          tone={"emerald" as unknown as Tone}
        />
      </div>

      <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-4 text-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`rounded-lg px-3 py-2 text-xs font-medium capitalize transition-colors ${
                categoryFilter === cat
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat === "all" ? "All" : cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="Try adjusting your search or filters." />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow hover:shadow-md"
            >
              <div className="relative aspect-square bg-slate-50">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300">
                    <Package className="h-14 w-14" />
                  </div>
                )}
                {product.featuredOnHomepage && (
                  <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold text-white shadow-sm">
                    <Star className="h-3 w-3" /> Featured
                  </span>
                )}
              </div>

              <div className="p-4">
                <h3 className="mb-1.5 line-clamp-1 text-sm font-semibold text-slate-800">{product.name}</h3>
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">₦{product.price.toLocaleString()}</span>
                  {product.oldPrice && (
                    <span className="text-xs text-slate-400 line-through">
                      ₦{product.oldPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {product.category && (
                  <span className="mb-3 inline-block rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-500">
                    {product.category}
                  </span>
                )}
                <div className="flex gap-2">
                  <Link
                    href={`/admin/products/edit/${product.id}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </Link>
                  <button
                    onClick={() => deleteProduct(product.id)}
                    disabled={deletingId === product.id}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-50 py-2 text-xs font-medium text-rose-600 hover:bg-rose-100 disabled:opacity-50"
                  >
                    {deletingId === product.id ? (
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                    ) : (
                      <>
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4">
          <p className="text-sm text-slate-500">
            Page <span className="font-semibold text-slate-800">{currentPage}</span> of{" "}
            <span className="font-semibold text-slate-800">{totalPages}</span>
            <span className="ml-2 text-slate-400">({totalCount} products)</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Prev
            </button>

            {/* Page number buttons */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Show pages around current
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`h-8 w-8 rounded-lg text-xs font-medium transition-colors ${
                      pageNum === currentPage
                        ? "bg-indigo-600 text-white"
                        : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}