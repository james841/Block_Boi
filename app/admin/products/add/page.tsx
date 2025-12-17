'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X, Loader, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AddProduct() {
  const router = useRouter();
  const mainImageRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [mainImagePreview, setMainImagePreview] = useState('');
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);

  const [colors, setColors] = useState<string[]>([]);
  const [sizes, setSizes] = useState<string[]>([]);

  const [form, setForm] = useState({
    name: '',
    price: '',
    oldPrice: '',
    imageUrl: '', // ← will be base64 from upload
    category: '',
    description: '',
    featuredOnHomepage: false,
  });

  /* ── MAIN IMAGE UPLOAD ── */
  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return alert('Please select an image');
    if (file.size > 5 * 1024 * 1024) return alert('Image must be < 5MB');

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

  /* ── GALLERY UPLOAD (MULTIPLE) ── */
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

  /* ── Colors & Sizes ── */
  const updateArray = (value: string, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    setter(value.split(',').map(s => s.trim()).filter(Boolean));
  };

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return alert('Name and price required');
    if (isNaN(+form.price)) return alert('Invalid price');

    setIsLoading(true);
    try {
      const res = await fetch('/api/Products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: parseFloat(form.price),
          oldPrice: form.oldPrice ? parseFloat(form.oldPrice) : null,
          featuredOnHomepage: form.featuredOnHomepage,
          colors,
          sizes,
          images: galleryPreviews,
        }),
      });

      if (res.ok) router.push('/admin/products');
      else {
        const err = await res.json();
        alert(err.error || 'Failed to add product');
      }
    } catch {
      alert('Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-16 min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin/products" className="p-3 hover:bg-slate-700 rounded-xl transition-colors text-slate-300 hover:text-white">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Add New Product</h1>
            <p className="text-slate-400">Fill in the details</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── MAIN IMAGE ── */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6">
            <label className="block text-lg font-bold text-white mb-4">Main Image *</label>
            {mainImagePreview ? (
              <div className="relative group inline-block">
                <img src={mainImagePreview} alt="Main" className="w-full h-80 object-cover rounded-xl border-2 border-slate-700" />
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

          {/* ── GALLERY ── */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Product Gallery (Optional)</h2>
            <input
              ref={galleryRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryUpload}
              className="block w-full text-sm text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
            <p className="text-xs text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple</p>

            {galleryPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                {galleryPreviews.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt="" className="w-full h-40 object-cover rounded-lg border-2 border-slate-700" />
                    <button type="button" onClick={() => removeGalleryImage(i)}
                      className="absolute top-2 right-2 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── BASIC INFO ── */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6 space-y-5">
            <h2 className="text-lg font-bold text-white">Basic Information</h2>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Product Name *</label>
              <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 text-white rounded-xl focus:border-blue-500 focus:outline-none placeholder-slate-500"/>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Price *</label>
                <input type="number" step="0.01" required value={form.price} onChange={e => setForm({ ...form, price: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 text-white rounded-xl focus:border-blue-500 focus:outline-none placeholder-slate-500"/>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">Old Price</label>
                <input type="number" step="0.01" value={form.oldPrice} onChange={e => setForm({ ...form, oldPrice: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 text-white rounded-xl focus:border-blue-500 focus:outline-none placeholder-slate-500"/>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Category</label>
              <input type="text" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 text-white rounded-xl focus:border-blue-500 focus:outline-none placeholder-slate-500"/>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
                className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 text-white rounded-xl focus:border-blue-500 focus:outline-none placeholder-slate-500 resize-none"/>
            </div>
          </div>

          {/* ── COLORS ── */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Colors</h2>
            <input type="text" value={colors.join(', ')} onChange={e => updateArray(e.target.value, setColors)}
              placeholder="Red, Blue, Green"
              className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 text-white rounded-xl focus:border-blue-500 focus:outline-none placeholder-slate-500"/>
            <div className="flex flex-wrap gap-2 mt-2">
              {colors.map(c => (
                <span key={c} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                  {c}
                  <button type="button" onClick={() => setColors(prev => prev.filter(x => x !== c))} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* ── SIZES ── */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Sizes</h2>
            <input type="text" value={sizes.join(', ')} onChange={e => updateArray(e.target.value, setSizes)}
              placeholder="S, M, L, XL"
              className="w-full px-4 py-3 bg-slate-900 border-2 border-slate-700 text-white rounded-xl focus:border-blue-500 focus:outline-none placeholder-slate-500"/>
            <div className="flex flex-wrap gap-2 mt-2">
              {sizes.map(s => (
                <span key={s} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
                  {s}
                  <button type="button" onClick={() => setSizes(prev => prev.filter(x => x !== s))} className="ml-1">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* ── FEATURED & SUBMIT ── */}
          <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white">Feature on Homepage</h2>
                <p className="text-slate-400 text-sm mt-1">Display prominently</p>
              </div>
              <input type="checkbox" checked={form.featuredOnHomepage}
                onChange={e => setForm({ ...form, featuredOnHomepage: e.target.checked })}
                className="w-6 h-6 text-blue-600 bg-slate-700 rounded focus:ring-blue-500"/>
            </div>
          </div>

          <div className="flex gap-4">
            <Link href="/admin/products"
              className="flex-1 py-4 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors text-center font-bold text-lg">
              Cancel
            </Link>
            <button type="submit" disabled={isLoading}
              className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-blue-500/50">
              {isLoading ? (
                <> <Loader className="w-6 h-6 animate-spin" /> Adding... </>
              ) : (
                <> <Plus className="w-6 h-6" /> Add Product </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}