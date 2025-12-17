"use client";

import { useState, useEffect } from "react";
import { Trash2, Edit, Plus, X, ArrowLeft, Image as ImageIcon, Upload } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type CategoryShowcase = {
  id: number;
  title: string;
  imageUrl: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export default function AdminCategoryShowcasePage() {
  const [categories, setCategories] = useState<CategoryShowcase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryShowcase | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    slug: "",
  });
  const [imagePreview, setImagePreview] = useState<string>("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/CategoriesShowcase");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingCategory ? formData.slug : generateSlug(title),
    });
  };

  // Image upload handler
  const handleImageChange = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setFormData({ ...formData, imageUrl: base64 });
        setImagePreview(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleImageChange(file);
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug || !formData.imageUrl) {
      alert("Title, slug, and image are required!");
      return;
    }

    try {
      const url = editingCategory
        ? `/api/CategoriesShowcase/${editingCategory.id}`
        : "/api/CategoriesShowcase";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        fetchCategories();
        closeModal();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save category");
      }
    } catch (error) {
      alert("An error occurred. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this category?")) return;

    try {
      const res = await fetch(`/api/CategoriesShowcase/${id}`, { method: "DELETE" });
      if (res.ok) fetchCategories();
      else alert("Failed to delete");
    } catch (error) {
      alert("Error deleting category");
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({ title: "", imageUrl: "", slug: "" });
    setImagePreview("");
    setShowModal(true);
  };

  const openEditModal = (category: CategoryShowcase) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
      imageUrl: category.imageUrl,
      slug: category.slug,
    });
    setImagePreview(category.imageUrl);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ title: "", imageUrl: "", slug: "" });
    setImagePreview("");
  };

  return (
    <div className="mt-16 bg-gradient-to-r from-slate-800 to-slate-900 shadow-2xl border-b border-slate-700 min-h-screen text-white">
      {/* Header */}
      <div className="border-b border-white/10 backdrop-blur-lg bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-5">
            <Link
              href="/admin/dashboard"
              className="p-2.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-300" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Category Showcase</h1>
              <p className="text-sm text-gray-400 mt-1">Manage featured categories on homepage</p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium flex items-center gap-2.5 shadow-md hover:shadow-lg transition-all"
          >
            <Plus size={20} />
            Add New Category
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-8">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 rounded-2xl shadow-sm overflow-hidden animate-pulse">
                <div className="h-64 bg-white/10" />
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-white/20 rounded-lg w-4/5" />
                  <div className="h-4 bg-white/10 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-white/10 mb-8">
              <ImageIcon className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-300 mb-3">No categories added yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-8">
              Showcase your top collections like Fashion, Electronics, Beauty, etc.
            </p>
            <button
              onClick={openCreateModal}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-medium flex items-center gap-3 mx-auto shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={22} />
              Add Your First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white/5 backdrop-blur-xl rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group"
              >
                <div className="relative h-64 bg-gray-200">
                  <Image
                    src={category.imageUrl}
                    alt={category.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                    <h3 className="text-xl font-bold drop-shadow-md">{category.title}</h3>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">
                    {category.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-5">/{category.slug}</p>

                  <div className="flex gap-3">
                    <button
                      onClick={() => openEditModal(category)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium"
                    >
                      <Edit size={18} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl flex items-center justify-center gap-2 transition-all font-medium border border-red-500/30"
                    >
                      <Trash2 size={18} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-white/10 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-white">
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X size={26} className="text-gray-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-5 py-3.5 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition"
                    placeholder="e.g. Women's Fashion"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Slug <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">/</span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: generateSlug(e.target.value) })
                      }
                      className="w-full pl-10 pr-5 py-3.5 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 transition"
                      placeholder="womens-fashion"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Auto-generated • lowercase letters, numbers, hyphens only
                  </p>
                </div>

                {/* IMAGE UPLOAD */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2">
                    Image <span className="text-red-500">*</span>
                  </label>
                  <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-white/50 transition-all bg-white/5"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                      className="hidden"
                      id="category-image-upload"
                    />
                    <label htmlFor="category-image-upload" className="cursor-pointer block">
                      {imagePreview ? (
                        <div className="relative h-64 rounded-xl overflow-hidden border border-white/20">
                          <Image src={imagePreview} alt="Preview" fill className="object-cover" unoptimized />
                          <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-medium">Change Image</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Upload className="w-12 h-12 mx-auto text-gray-400" />
                          <p className="text-gray-400">Drop image here or click to upload</p>
                          <p className="text-xs text-gray-500">JPG, PNG, WebP • Max 10MB</p>
                        </div>
                      )}
                    </label>
                    {imagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, imageUrl: "" });
                          setImagePreview("");
                        }}
                        className="mt-4 text-sm text-red-400 hover:text-red-300"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 px-6 py-3.5 border border-white/20 text-gray-400 rounded-xl hover:bg-white/10 font-medium transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition"
                  >
                    {editingCategory ? "Update Category" : "Create Category"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}