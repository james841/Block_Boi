"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader, Plus, X } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/app/components/admin/ui/PageHeader";
import ImageDropzone from "@/app/components/admin/ui/ImageDropzone";
import Field from "@/app/components/admin/ui/Field";
import TagInput from "@/app/components/admin/ui/TagInput";
import SuccessToast from "@/app/components/admin/ui/SuccessToast";


export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "",
    price: "",
    oldPrice: "",
    imageUrl: "",
    category: "",
    description: "",
    featuredOnHomepage: false,
  });

  const readAsBase64 = (file: File, cb: (b64: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => cb(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleMainImage = (file: File) => {
    if (!file.type.startsWith("image/")) return alert("Please select an image");
    if (file.size > 5 * 1024 * 1024) return alert("Image must be < 5MB");
    readAsBase64(file, (b64) => {
      setMainImagePreview(b64);
      setForm((f) => ({ ...f, imageUrl: b64 }));
    });
  };

  const handleGalleryFile = (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) return;
    readAsBase64(file, (b64) => setGalleryPreviews((prev) => [...prev, b64]));
  };

  const updateArray = (value: string, setter: (v: string[]) => void) =>
    setter(value.split(",").map((s) => s.trim()).filter(Boolean));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return alert("Name and price required");
    if (isNaN(+form.price)) return alert("Invalid price");

    setIsLoading(true);
    try {
      const res = await fetch("/api/Products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
          colors,
          sizes,
          images: galleryPreviews,
        }),
      });
      if (res.ok) {
        setShowSuccessToast(true);
        setTimeout(() => {
          router.push("/admin/products");
        }, 2000);
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
      <SuccessToast
        message="✨ Product added successfully!"
        isVisible={showSuccessToast}
        onClose={() => setShowSuccessToast(false)}
        autoCloseDuration={5000}
      />
      <PageHeader title="Add New Product" subtitle="Fill in the product details below" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <ImageDropzone
            label="Main Image"
            required
            preview={mainImagePreview}
            onFile={handleMainImage}
            onRemove={() => {
              setMainImagePreview("");
              setForm((f) => ({ ...f, imageUrl: "" }));
            }}
            heightClass="h-72"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-sm font-semibold text-slate-800">Product Gallery (Optional)</h2>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              Array.from(e.target.files ?? []).forEach(handleGalleryFile);
              e.target.value = "";
            }}
            className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {galleryPreviews.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3">
              {galleryPreviews.map((src, i) => (
                <div key={i} className="group relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-32 w-full rounded-lg border border-slate-200 object-cover" />
                  <button
                    type="button"
                    onClick={() => setGalleryPreviews((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute right-2 top-2 rounded-full bg-white/90 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                  >
                    <X className="h-3.5 w-3.5 text-rose-600" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-800">Basic Information</h2>
          <Field label="Product Name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₦)" required>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="input"
              />
            </Field>
            <Field label="Old Price (₦)">
              <input
                type="number"
                step="0.01"
                value={form.oldPrice}
                onChange={(e) => setForm({ ...form, oldPrice: e.target.value })}
                className="input"
              />
            </Field>
          </div>
          <Field label="Category">
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="input"
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="input resize-none"
            />
          </Field>
        </div>

        <TagInput label="Colors" values={colors} onChange={(v) => updateArray(v, setColors)} onRemove={(c) => setColors((p) => p.filter((x) => x !== c))} placeholder="Red, Blue, Green" />
        <TagInput label="Sizes" values={sizes} onChange={(v) => updateArray(v, setSizes)} onRemove={(s) => setSizes((p) => p.filter((x) => x !== s))} placeholder="S, M, L, XL" />

        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">Feature on Homepage</h2>
            <p className="mt-0.5 text-xs text-slate-500">Display prominently on the storefront</p>
          </div>
          <input
            type="checkbox"
            checked={form.featuredOnHomepage}
            onChange={(e) => setForm({ ...form, featuredOnHomepage: e.target.checked })}
            className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-3">
          <Link
            href="/admin/products"
            className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-center text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isLoading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 animate-spin" /> Adding...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Add Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

