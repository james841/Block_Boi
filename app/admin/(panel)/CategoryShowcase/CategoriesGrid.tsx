"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Edit, Plus, X, Image as ImageIcon } from "lucide-react";
import PageHeader from "@/app/components/admin/ui/PageHeader";
import Field from "@/app/components/admin/ui/Field";
import ImageDropzone from "@/app/components/admin/ui/ImageDropzone";
import EmptyState from "@/app/components/admin/ui/EmptyState";


type CategoryShowcase = {
  id: number;
  title: string;
  imageUrl: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
};

export default function CategoriesGrid({ initialCategories }: { initialCategories: CategoryShowcase[] }) {
  const router = useRouter();
  const [categories, setCategories] = useState(initialCategories);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryShowcase | null>(null);
  const [formData, setFormData] = useState({ title: "", imageUrl: "", slug: "" });
  const [imagePreview, setImagePreview] = useState("");

  const refresh = async () => {
    const res = await fetch("/api/CategoriesShowcase");
    const data = await res.json();
    setCategories(data.categories || []);
    router.refresh();
  };

  const generateSlug = (title: string) =>
    title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title, slug: editingCategory ? formData.slug : generateSlug(title) });
  };

  const handleImageFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setFormData((f) => ({ ...f, imageUrl: b64 }));
      setImagePreview(b64);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.slug || !formData.imageUrl) return alert("Title, slug, and image are required!");

    try {
      const url = editingCategory ? `/api/CategoriesShowcase/${editingCategory.id}` : "/api/CategoriesShowcase";
      const method = editingCategory ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        await refresh();
        closeModal();
      } else {
        const error = await res.json();
        alert(error.error || "Failed to save category");
      }
    } catch {
      alert("An error occurred. Please try again.");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this category?")) return;
    try {
      const res = await fetch(`/api/CategoriesShowcase/${id}`, { method: "DELETE" });
      if (res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        router.refresh();
      } else {
        alert("Failed to delete");
      }
    } catch {
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
    setFormData({ title: category.title, imageUrl: category.imageUrl, slug: category.slug });
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
    <div>
      <PageHeader
        title="Category Showcase"
        subtitle="Manage featured categories on the homepage"
        action={
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> Add Category
          </button>
        }
      />

      {categories.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No categories added yet"
          description="Showcase your top collections like Fashion, Electronics, Beauty, etc."
          action={
            <button onClick={openCreateModal} className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700">
              Add Your First Category
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <div key={category.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="relative h-44">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={category.imageUrl} alt={category.title} className="h-full w-full object-cover" />
              </div>
              <div className="p-4">
                <h3 className="mb-0.5 line-clamp-1 text-sm font-semibold text-slate-800">{category.title}</h3>
                <p className="mb-3 text-xs text-slate-400">/{category.slug}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(category)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-100 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-rose-50 py-2 text-xs font-medium text-rose-600 hover:bg-rose-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            <div className="p-7">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </h2>
                <button onClick={closeModal} className="rounded-lg p-2 hover:bg-slate-100">
                  <X className="h-5 w-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <Field label="Title" required>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="input"
                    placeholder="e.g. Women's Fashion"
                  />
                </Field>
                <Field label="Slug" required>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                    className="input"
                    placeholder="womens-fashion"
                  />
                </Field>

                <ImageDropzone
                  label="Image"
                  required
                  preview={imagePreview}
                  onFile={handleImageFile}
                  onRemove={() => {
                    setFormData({ ...formData, imageUrl: "" });
                    setImagePreview("");
                  }}
                />

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
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
