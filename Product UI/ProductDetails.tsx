'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, Heart, ShoppingBag, Shield, Truck, Share2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/app/contexts/CartContext';
import SizeChartModal from '@/app/components/SizesChart';
import { useCurrency } from '@/app/contexts/CurrencyContext';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  oldPrice?: number;
  colors: string[];
  images: string[];
  details?: string;
  sizes: string[];
}

export default function ProductDetails() {
  const { formatPrice } = useCurrency();
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (params.id) {
      setIsLoading(true);
      setSelectedImage(0);
      fetchProduct();
    }
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/Products/${params.id}`);
      const data = await response.json();

      if (!response.ok || !data.success || !data.product) {
        setNotFound(true);
        return;
      }

      setProduct(data.product);
      if (data.product.colors?.length > 0) setSelectedColor(data.product.colors[0]);
      if (data.product.sizes?.length > 0) setSelectedSize(data.product.sizes[0]);

      // Fetch related products by category
      if (data.product.category) {
        fetchRelated(data.product.category, data.product.id);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
    }
  };

const fetchRelated = async (category: string, currentId: number) => {
  try {
    const url = `/api/Products?category=${encodeURIComponent(category)}&limit=8`;
    console.log('Fetching related:', url);
    const res = await fetch(url);
    const data = await res.json();
    console.log('Related response:', data);
    if (data.success && Array.isArray(data.products)) {
      setRelatedProducts(
        data.products.filter(
          (p: Product) =>
            p.id !== currentId &&
            p.imageUrl &&
            !p.imageUrl.startsWith('data:')
        )
      );
    }
  } catch (err) {
    console.error('Related fetch error:', err);
  }
};
  const handleAddToCart = () => {
    if (!product) return;
    if (product.colors?.length > 0 && !selectedColor) { setError('Select Color'); return; }
    if (product.sizes?.length > 0 && !selectedSize) { setError('Select Size'); return; }
    setError('');
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl || null,
      quantity,
      selectedColor: selectedColor || 'N/A',
      selectedSize: selectedSize || 'N/A',
    });
  };

  if (isLoading) return (
    <div className="min-h-screen bg-white flex items-center justify-center font-black uppercase tracking-widest text-[10px]">
      Loading Archive...
    </div>
  );

  if (notFound || !product) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
      <p className="font-black uppercase tracking-widest text-[10px] text-black/40">Object Not Found</p>
      <button onClick={() => router.push('/shop')} className="text-[10px] font-black uppercase tracking-widest underline">
        Return to Shop
      </button>
    </div>
  );

  const allImages = [product.imageUrl, ...(product.images ?? [])].filter(Boolean) as string[];

  return (
    <main className=" mt-16 min-h-screen bg-white pb-32">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 pt-24 lg:pt-32">

        {/* BACK + REF */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => router.back()} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">
            Ref. #00{product.id}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">

          {/* IMAGE GALLERY — thumbnails left, main image right */}
          <div className="lg:col-span-7">
            <div className="flex gap-3">

              {/* Vertical thumbnail strip — only shown when there are multiple images */}
              {allImages.length > 1 && (
                <div className="hidden sm:flex flex-col gap-2 w-16 flex-shrink-0">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square w-full border-2 transition-all flex-shrink-0 overflow-hidden ${
                        selectedImage === index
                          ? 'border-black opacity-100'
                          : 'border-transparent opacity-40 hover:opacity-70'
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main image */}
              <div className="relative flex-1 aspect-square bg-gray-50 overflow-hidden border border-black/5">
                {allImages.length > 0 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={allImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-black/20 text-[10px] uppercase tracking-widest font-black">
                    No Image
                  </div>
                )}

                {/* Prev/Next arrows — only on mobile since desktop uses sidebar */}
                {allImages.length > 1 && (
                  <div className="sm:hidden absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-10 pointer-events-none">
                    <button
                      onClick={() => setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)}
                      className="p-3 bg-white border border-black/10 rounded-full pointer-events-auto hover:bg-black hover:text-white transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev + 1) % allImages.length)}
                      className="p-3 bg-white border border-black/10 rounded-full pointer-events-auto hover:bg-black hover:text-white transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="absolute top-4 right-4 p-3 bg-white border border-black/5 rounded-full z-10"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-black' : ''}`} />
                </button>

                {/* Mobile thumbnail dots */}
                {allImages.length > 1 && (
                  <div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setSelectedImage(i)}
                        className={`w-1.5 h-1.5 rounded-full transition-all ${
                          selectedImage === i ? 'bg-black w-4' : 'bg-black/30'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PRODUCT DETAILS */}
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-4">
                <h1 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-none flex-1">
                  {product.name}
                </h1>
                <button className="text-black/40 hover:text-black mt-1">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-black tracking-tight">{formatPrice(product.price)}</span>
                {product.oldPrice && (
                  <span className="text-sm text-black/30 line-through font-bold">{formatPrice(product.oldPrice)}</span>
                )}
              </div>
              {product.category && (
                <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-1 border border-black/10 text-black/40">
                  {product.category}
                </span>
              )}
            </div>

            <div className="space-y-8 border-t border-black/5 pt-8">
              {product.colors?.length > 0 && (
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-black/40">
                    Color: {selectedColor}
                  </span>
                  <div className="flex gap-3">
                    {product.colors.map((color: string) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        style={{ backgroundColor: color.toLowerCase() }}
                        className={`w-8 h-8 rounded-full border ${selectedColor === color ? 'ring-2 ring-black ring-offset-2' : 'border-black/10'}`}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {product.sizes?.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Select Size</span>
                    <button
                      onClick={() => setShowSizeChart(true)}
                      className="text-[9px] font-black uppercase underline tracking-widest"
                    >
                      Size Guide
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {product.sizes.map((size: string) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`py-4 text-[11px] font-black uppercase tracking-widest border transition-all ${
                          selectedSize === size
                            ? 'bg-black text-white border-black'
                            : 'border-black/10 text-black/40 hover:border-black/30'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-[10px] font-black uppercase tracking-widest text-red-500">{error}</p>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 border-t border-black/5 pt-6">
              <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Qty</span>
              <div className="flex items-center border border-black/10">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-black/5 transition"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="px-4 text-sm font-black">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-black/5 transition"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="hidden lg:flex gap-3 pt-4 border-t border-black/5">
              <button
                onClick={handleAddToCart}
                className="flex-[1] aspect-square flex items-center justify-center border border-black/10 hover:bg-gray-50"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
              <button
                onClick={handleAddToCart}
                className="flex-[4] bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] py-5 hover:bg-black/80 transition"
              >
                Add to Cart — {formatPrice(product.price * quantity)}
              </button>
            </div>

            <div className="border-t border-black/10 divide-y divide-black/5">
              <details className="group py-5">
                <summary className="list-none flex justify-between items-center cursor-pointer text-[10px] font-black uppercase tracking-[0.2em]">
                  Item Description <Plus className="w-3 h-3 group-open:rotate-45 transition-transform" />
                </summary>
                <p className="mt-4 text-xs font-bold text-black/60 leading-relaxed uppercase tracking-widest">
                  {product.description || 'Architectural silhouette with signature construction. Designed for permanent daily wear.'}
                </p>
              </details>
              <details className="group py-5">
                <summary className="list-none flex justify-between items-center cursor-pointer text-[10px] font-black uppercase tracking-[0.2em]">
                  Shipping & Origin <Plus className="w-3 h-3 group-open:rotate-45 transition-transform" />
                </summary>
                <div className="mt-4 text-[10px] font-bold text-black/60 uppercase tracking-widest space-y-2">
                  <p className="flex items-center gap-2"><Truck className="w-3 h-3" /> Global Express Shipping</p>
                  <p className="flex items-center gap-2"><Shield className="w-3 h-3" /> Quality Inspected in Nigeria</p>
                </div>
              </details>
            </div>
          </div>
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div className="mt-24 border-t border-black/5 pt-16">
            <div className="flex items-baseline justify-between mb-10">
              <h2 className="text-3xl lg:text-4xl font-black uppercase tracking-tighter">
                More from <span className="text-black/20">{product.category}</span>
              </h2>
              <Link
                href={`/Cloths?category=${encodeURIComponent(product.category || '')}`}
                className="text-[10px] font-black uppercase tracking-widest text-black/40 hover:text-black transition"
              >
                View All →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-px bg-black/5 border border-black/5">
              {relatedProducts.slice(0, 8).map((related) => (
                <Link
                  key={related.id}
                  href={`/Cloths/${related.id}`}
                  className="group bg-white block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <Image
                      src={related.imageUrl!}
                      alt={related.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    {related.oldPrice && related.oldPrice > related.price && (
                      <div className="absolute top-0 left-0 bg-black text-white px-2 py-1 text-[9px] font-black uppercase tracking-widest">
                        Sale
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-black/30">{related.category}</p>
                    <h3 className="text-sm font-black uppercase tracking-tight line-clamp-1">{related.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black">{formatPrice(related.price)}</span>
                      {related.oldPrice && (
                        <span className="text-xs text-black/30 line-through font-bold">{formatPrice(related.oldPrice)}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* STICKY MOBILE ACTION BAR */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-black/10 p-5 z-50 lg:hidden">
        <div className="flex gap-4">
          <button
            onClick={handleAddToCart}
            className="flex-[1] aspect-square flex items-center justify-center border border-black"
          >
            <ShoppingBag className="w-5 h-5" />
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-[4] bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] py-5"
          >
            Add to Cart — {formatPrice(product.price * quantity)}
          </button>
        </div>
      </div>

      <SizeChartModal isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />
    </main>
  );
}