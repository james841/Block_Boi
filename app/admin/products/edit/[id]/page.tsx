// app/admin/products/edit/[id]/page.tsx   (or pages/admin/products/edit/[id].tsx)
'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Upload, X, Loader } from 'lucide-react';
import Link from 'next/link';

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

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mainImagePreview, setMainImagePreview] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    oldPrice: '',
    imageUrl: '',
    category: '',
    featuredOnHomepage: false,
  });

  // Load product
  useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        await fetchProduct();
      } catch (e: any) {
        setError(e.message || 'Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const fetchProduct = async () => {
    const res = await fetch(`/api/Products/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch product');

    const data = await res.json();
    if (!data.success) throw new Error(data.message);

    const p: Product = data.product;

    setForm({
      name: p.name ?? '',
      description: p.description ?? '',
      price: p.price?.toString() ?? '',
      oldPrice: p.oldPrice?.toString() ?? '',
      imageUrl: p.imageUrl ?? '',
      category: p.category ?? '',
      featuredOnHomepage: !!p.featuredOnHomepage,
    });

    setMainImagePreview(p.imageUrl ?? '');
    setGalleryPreviews(p.images ?? []);
    setSelectedColors(p.colors ?? []);
    setSelectedSizes(p.sizes ?? []);
  };

  // Main image
  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      alert('Image must be < 5MB and a valid image');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result as string;
      setMainImagePreview(b64);
      setForm(f => ({ ...f, imageUrl: b64 }));
    };
    reader.readAsDataURL(file);
  };

  const removeMainImage = () => {
    setMainImagePreview('');
    setForm(f => ({ ...f, imageUrl: '' }));
    if (mainImageRef.current) mainImageRef.current.value = '';
  };

  // Gallery
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return;
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result as string;
        setGalleryPreviews(prev => [...prev, b64]);
      };
      reader.readAsDataURL(file);
    });
    if (galleryRef.current) galleryRef.current.value = '';
  };

  const removeGalleryImage = (index: number) => {
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const updateArray = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(value.split(',').map(s => s.trim()).filter(Boolean));
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.price) return alert('Name and Price are required');
    if (isNaN(+form.price)) return alert('Price must be a number');
    if (form.oldPrice && isNaN(+form.oldPrice)) return alert('Old Price must be a number');

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/Products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
          imageUrl: mainImagePreview || null,
          category: form.category || null,
          featuredOnHomepage: form.featuredOnHomepage,
          colors: selectedColors,
          sizes: selectedSizes,
          images: galleryPreviews,
        }),
      });

      if (res.ok) {
        alert('Product updated!');
        router.push('/admin/products');
      } else {
        const err = await res.json();
        alert(err.message || 'Update failed');
      }
    } catch (err) {
      alert('Network error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="flex justify-center py-20"><Loader className="w-8 h-8 animate-spin text-white" /></div>;
  if (error) return <div className="text-red-400 text-center py-20">{error}</div>;

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/products" className="p-3 hover:bg-slate-700 rounded-xl text-slate-300 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-3xl font-bold text-white">Edit Product</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Product Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 resize-none"
              placeholder="Describe your product..."
            />
          </div>

          {/* Price & Old Price */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Price (₦) *</label>
              <input
                type="number"
                step="0.01"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Old Price (₦)</label>
              <input
                type="number"
                step="0.01"
                value={form.oldPrice}
                onChange={e => setForm(f => ({ ...f, oldPrice: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="Leave blank if no discount"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Category</label>
            <input
              type="text"
              value={form.category}
              onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Featured */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="featured"
              checked={form.featuredOnHomepage}
              onChange={e => setForm(f => ({ ...f, featuredOnHomepage: e.target.checked }))}
              className="w-5 h-5 text-blue-600 bg-slate-800 border-slate-700 rounded focus:ring-blue-500"
            />
            <label htmlFor="featured" className="text-slate-300">Feature on Homepage</label>
          </div>

          {/* Main Image */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Main Image</label>
            {mainImagePreview ? (
              <div className="relative group inline-block w-full">
                <img src={mainImagePreview} alt="Main" className="w-full h-80 object-cover rounded-lg border-2 border-slate-700" />
                <button type="button" onClick={removeMainImage}
                  className="absolute top-3 right-3 p-2 bg-rose-600 text-white rounded-lg hover:bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div onClick={() => mainImageRef.current?.click()}
                className="border-2 border-dashed border-slate-600 rounded-xl p-16 text-center cursor-pointer hover:border-blue-500 hover:bg-slate-700/50 transition-all">
                <Upload className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-300 font-medium text-lg mb-2">Click to upload main image</p>
                <p className="text-slate-500">PNG, JPG, GIF up to 5MB</p>
                <input ref={mainImageRef} type="file" accept="image/*" onChange={handleMainImage} className="hidden" />
              </div>
            )}
          </div>

          {/* Gallery */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Product Gallery</label>
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:bg-blue-600 file:text-white"
            />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {galleryPreviews.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt="" className="w-full h-32 object-cover rounded-lg border border-slate-700" />
                  <button type="button" onClick={() => removeGalleryImage(i)}
                    className="absolute top-1 right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Colors */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Colors</label>
            <input
              type="text"
              value={selectedColors.join(', ')}
              onChange={e => updateArray(e.target.value, setSelectedColors)}
              placeholder="Red, Blue, Green"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedColors.map(c => (
                <span key={c} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full flex items-center gap-1">
                  {c}
                  <button type="button" onClick={() => setSelectedColors(prev => prev.filter(x => x !== c))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Sizes</label>
            <input
              type="text"
              value={selectedSizes.join(', ')}
              onChange={e => updateArray(e.target.value, setSelectedSizes)}
              placeholder="S, M, L, XL"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
            />
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedSizes.map(s => (
                <span key={s} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-full flex items-center gap-1">
                  {s}
                  <button type="button" onClick={() => setSelectedSizes(prev => prev.filter(x => x !== s))}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" /> Updating...
                </>
              ) : (
                'Update Product'
              )}
            </button>
            <Link href="/admin/products" className="px-6 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}