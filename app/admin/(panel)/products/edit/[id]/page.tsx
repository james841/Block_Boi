"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Loader, X } from "lucide-react";
import Link from "next/link";
import PageHeader from "@/app/components/admin/ui/PageHeader";
import Field from "@/app/components/admin/ui/Field";
import ImageDropzone from "@/app/components/admin/ui/ImageDropzone";
import TagInput from "@/app/components/admin/ui/TagInput";


type Product = {
  id: number;
  name: string;
  description?: string | null;
  price: number;
  oldPrice?: number | null;
  imageUrl?: string | null;
  category?: string | null;
  featuredOnHomepage?: boolean | null;
  colors: string[];
  sizes: string[];
  images: string[];
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mainImagePreview, setMainImagePreview] = useState("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    oldPrice: "",
    imageUrl: "",
    category: "",
    featuredOnHomepage: false,
  });

  useEffect(() => {
    if (!id) return;
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/Products/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Failed to fetch product");
        const data = await res.json();
        if (!data.success) throw new Error(data.message);

        const p: Product = data.product;
        setForm({
          name: p.name ?? "",
          description: p.description ?? "",
          price: p.price?.toString() ?? "",
          oldPrice: p.oldPrice?.toString() ?? "",
          imageUrl: p.imageUrl ?? "",
          category: p.category ?? "",
          featuredOnHomepage: !!p.featuredOnHomepage,
        });
        setMainImagePreview(p.imageUrl ?? "");
        setGalleryPreviews(p.images ?? []);
        setColors(p.colors ?? []);
        setSizes(p.sizes ?? []);
      } catch (e: any) {
        setError(e.message || "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  const readAsBase64 = (file: File, cb: (b64: string) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => cb(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleMainImage = (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      alert("Image must be < 5MB and a valid image");
      return;
    }
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
    if (!form.name || !form.price) return alert("Name and Price are required");
    if (isNaN(+form.price)) return alert("Price must be a number");
    if (form.oldPrice && isNaN(+form.oldPrice)) return alert("Old Price must be a number");

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/Products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
          imageUrl: mainImagePreview || null,
          category: form.category || null,
          featuredOnHomepage: form.featuredOnHomepage,
          colors,
          sizes,
          images: galleryPreviews,
        }),
      });
      if (res.ok) {
        router.push("/admin/products");
        router.refresh();
      } else {
        const err = await res.json();
        alert(err.message || "Update failed");
      }
    } catch {
      alert("Network error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader className="h-7 w-7 animate-spin text-indigo-500" />
      </div>
    );
  }
  if (error) return <div className="py-24 text-center text-rose-600">{error}</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Edit Product" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-slate-800">Basic Information</h2>
          <Field label="Product Name" required>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="input"
            />
          </Field>
          <Field label="Description">
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="input resize-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Price (₦)" required>
              <input
                type="number"
                step="0.01"
                required
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="input"
              />
            </Field>
            <Field label="Old Price (₦)">
              <input
                type="number"
                step="0.01"
                value={form.oldPrice}
                onChange={(e) => setForm((f) => ({ ...f, oldPrice: e.target.value }))}
                className="input"
              />
            </Field>
          </div>
          <Field label="Category">
            <input
              type="text"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              className="input"
            />
          </Field>
          <div className="flex items-center gap-3 pt-1">
            <input
              type="checkbox"
              id="featured"
              checked={form.featuredOnHomepage}
              onChange={(e) => setForm((f) => ({ ...f, featuredOnHomepage: e.target.checked }))}
              className="h-5 w-5 rounded text-indigo-600 focus:ring-indigo-500"
            />
            <label htmlFor="featured" className="text-sm text-slate-600">Feature on Homepage</label>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <ImageDropzone
            label="Main Image"
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
          <h2 className="mb-4 text-sm font-semibold text-slate-800">Product Gallery</h2>
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
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
            {galleryPreviews.map((src, i) => (
              <div key={i} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-28 w-full rounded-lg border border-slate-200 object-cover" />
                <button
                  type="button"
                  onClick={() => setGalleryPreviews((p) => p.filter((_, idx) => idx !== i))}
                  className="absolute right-1.5 top-1.5 rounded-full bg-white/90 p-1 opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
                >
                  <X className="h-3.5 w-3.5 text-rose-600" />
                </button>
              </div>
            ))}
          </div>
        </div>

        <TagInput label="Colors" values={colors} onChange={(v) => updateArray(v, setColors)} onRemove={(c) => setColors((p) => p.filter((x) => x !== c))} placeholder="Red, Blue, Green" />
        <TagInput label="Sizes" values={sizes} onChange={(v) => updateArray(v, setSizes)} onRemove={(s) => setSizes((p) => p.filter((x) => x !== s))} placeholder="S, M, L, XL" />

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" /> Updating...
              </>
            ) : (
              "Update Product"
            )}
          </button>
          <Link
            href="/admin/products"
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
