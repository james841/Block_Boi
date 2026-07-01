"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader, Plus, X, Loader2 } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/app/components/admin/ui/PageHeader";
import ImageDropzone from "@/app/components/admin/ui/ImageDropzone";
import Field from "@/app/components/admin/ui/Field";
import TagInput from "@/app/components/admin/ui/TagInput";

type CategoryOption = { id: number; title: string };

// Compress in browser then upload to Supabase Storage — returns a CDN URL
function compressImage(file: File, maxDimension = 1920, quality = 0.78): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) { height = Math.round((height * maxDimension) / width); width = maxDimension; }
          else { width = Math.round((width * maxDimension) / height); height = maxDimension; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Compression failed"))),
          "image/jpeg", quality
        );
      };
      img.onerror = () => reject(new Error("Could not read image"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsDataURL(file);
  });
}

async function uploadToSupabase(file: File): Promise<string> {
  const blob = await compressImage(file);
  const form = new FormData();
  form.append("file", blob, "product.jpg");
  const res = await fetch("/api/Products/upload", { method: "POST", body: form });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Upload failed");
  }
  const { url } = await res.json();
  return url;
}

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [mainImageUploading, setMainImageUploading] = useState(false);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [form, setForm] = useState({
    name: "", price: "", oldPrice: "",
    imageUrl: "", category: "", description: "",
    featuredOnHomepage: false,
  });

  useEffect(() => {
    fetch("/api/CategoriesShowcase")
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(() => {})
      .finally(() => setCategoriesLoading(false));
  }, []);

  // Upload main image to Supabase Storage immediately on selection
  const handleMainImage = async (file: File) => {
    if (!file.type.startsWith("image/")) return alert("Please select an image");
    setMainImageUploading(true);
    // Show local preview instantly while upload runs
    const localUrl = URL.createObjectURL(file);
    setMainImagePreview(localUrl);
    try {
      const url = await uploadToSupabase(file);
      setMainImagePreview(url); // Replace blob URL with real CDN URL
      setForm(f => ({ ...f, imageUrl: url }));
    } catch (e: any) {
      alert(e.message || "Image upload failed");
      setMainImagePreview("");
      setForm(f => ({ ...f, imageUrl: "" }));
    } finally {
      setMainImageUploading(false);
    }
  };

  // Upload gallery images to Supabase Storage
  const handleGalleryFile = async (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 15 * 1024 * 1024) return;
    setGalleryUploading(true);
    const localUrl = URL.createObjectURL(file);
    setGalleryPreviews(prev => [...prev, localUrl]);
    try {
      const url = await uploadToSupabase(file);
      // Replace the local blob URL with the real CDN URL
      setGalleryPreviews(prev => {
        const idx = prev.lastIndexOf(localUrl);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = url;
        return next;
      });
    } catch (e: any) {
      alert(e.message || "Gallery upload failed");
      setGalleryPreviews(prev => prev.filter(u => u !== localUrl));
    } finally {
      setGalleryUploading(false);
    }
  };

  const updateArray = (value: string, setter: (v: string[]) => void) =>
    setter(value.split(",").map(s => s.trim()).filter(Boolean));

  const toggleCategory = (title: string) =>
    setForm(f => ({ ...f, category: f.category === title ? "" : title }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return alert("Name and price required");
    if (isNaN(+form.price)) return alert("Invalid price");
    if (mainImageUploading || galleryUploading) return alert("Please wait for images to finish uploading");

    setIsLoading(true);
    try {
      const res = await fetch("/api/Products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
          colors, sizes,
          images: galleryPreviews,
        }),
      });
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to add product");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Add New Product" subtitle="Fill in the product details below" />

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Main Image */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <ImageDropzone
            label="Main Image"
            required
            preview={mainImagePreview}
            onFile={handleMainImage}
            onRemove={() => { setMainImagePreview(""); setForm(f => ({ ...f, imageUrl: "" })); }}
            heightClass="h-72"
          />
          {mainImageUploading && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading to Supabase...
            </p>
          )}
        </div>

        {/* Gallery */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">Product Gallery (Optional)</h2>
          <input
            type="file" accept="image/*" multiple
            onChange={e => { Array.from(e.target.files ?? []).forEach(handleGalleryFile); e.target.value = ""; }}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {galleryUploading && (
            <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-indigo-600">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading gallery image...
            </p>
          )}
          {galleryPreviews.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
              {galleryPreviews.map((src, i) => (
                <div key={i} className="group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-32 w-full rounded-lg border border-slate-200 object-cover" />
                  <button
                    type="button"
                    onClick={() => setGalleryPreviews(p => p.filter((_, idx) => idx !== i))}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5 text-rose-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-800">Basic Information</h2>
          <Field label="Product Name" required>
            <input type="text" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} className="input" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₦)" required>
              <input type="number" step="0.01" required value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} className="input" />
            </Field>
            <Field label="Old Price (₦)">
              <input type="number" step="0.01" value={form.oldPrice}
                onChange={e => setForm({ ...form, oldPrice: e.target.value })} className="input" />
            </Field>
          </div>
          <Field label="Description">
            <textarea rows={4} value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              className="input resize-none" />
          </Field>
        </div>

        {/* Category checkboxes */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-1 text-sm font-semibold text-slate-800">Category</h2>
          <p className="mb-4 text-xs text-slate-400">Pick one category for this product</p>
          {categoriesLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[...Array(6)].map((_, i) => <div key={i} className="h-10 animate-pulse rounded-xl bg-slate-100" />)}
            </div>
          ) : categories.length === 0 ? (
            <p className="text-sm text-slate-400">
              No categories yet —{" "}
              <Link href="/admin/CategoryShowcase" className="font-medium text-indigo-600 hover:underline">
                add one first
              </Link>
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map(cat => {
                const checked = form.category === cat.title;
                return (
                  <label key={cat.id} className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                    checked ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}>
                    <input type="checkbox" checked={checked} onChange={() => toggleCategory(cat.title)}
                      className="h-4 w-4 rounded text-indigo-600 focus:ring-indigo-500" />
                    <span className="line-clamp-1">{cat.title}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <TagInput label="Colors" values={colors} onChange={v => updateArray(v, setColors)} onRemove={c => setColors(p => p.filter(x => x !== c))} placeholder="Red, Blue, Green" />
        <TagInput label="Sizes" values={sizes} onChange={v => updateArray(v, setSizes)} onRemove={s => setSizes(p => p.filter(x => x !== s))} placeholder="S, M, L, XL" />

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Feature on Homepage</h2>
            <p className="mt-0.5 text-xs text-slate-500">Display prominently on the storefront</p>
          </div>
          <input type="checkbox" checked={form.featuredOnHomepage}
            onChange={e => setForm({ ...form, featuredOnHomepage: e.target.checked })}
            className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500" />
        </div>

        <div className="flex gap-3">
          <Link href="/admin/products"
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50">
            Cancel
          </Link>
          <button type="submit" disabled={isLoading || mainImageUploading || galleryUploading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50">
            {isLoading ? <><Loader className="h-4 w-4 animate-spin" /> Adding...</> : <><Plus className="h-4 w-4" /> Add Product</>}
          </button>
        </div>
      </form>
    </div>
  );
}