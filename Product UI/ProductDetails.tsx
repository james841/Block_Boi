'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, Heart, Ruler, ShoppingBag, Zap, Shield, Truck, Share2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/app/contexts/CartContext';
import SizeChartModal from '@/app/components/SizesChart';
import { useCurrency } from '@/app/contexts/CurrencyContext';

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
    if (params.id) fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/Products/${params.id}`);
      const data = await response.json();

      // Guard: API returned an error or product doesn't exist
      if (!response.ok || !data.success || !data.product) {
        setNotFound(true);
        return;
      }

      setProduct(data.product);

      // Safe access — only set defaults if arrays have values
      if (data.product.colors?.length > 0) setSelectedColor(data.product.colors[0]);
      if (data.product.sizes?.length > 0) setSelectedSize(data.product.sizes[0]);
    } catch (error) {
      console.error('Error fetching product:', error);
      setNotFound(true);
    } finally {
      setIsLoading(false);
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

  // Clean not-found state instead of crashing
  if (notFound || !product) return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
      <p className="font-black uppercase tracking-widest text-[10px] text-black/40">
        Object Not Found
      </p>
      <button
        onClick={() => router.push('/shop')}
        className="text-[10px] font-black uppercase tracking-widest underline"
      >
        Return to Shop
      </button>
    </div>
  );

  const allImages = [product.imageUrl, ...(product.images ?? [])].filter(Boolean) as string[];

  return (
    <main className="min-h-screen bg-white pb-32">
      <div className="max-w-[1400px] mx-auto px-5 lg:px-10 pt-24 lg:pt-32">
        
        {/* MOBILE NAVIGATION HEADER */}
        <div className="flex items-center justify-between mb-8">
           <button onClick={() => router.back()} className="text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
             <ChevronLeft className="w-4 h-4" /> Back
           </button>
           <div className="text-[10px] font-black uppercase tracking-[0.3em] text-black/30">
             Ref. #00{product.id}
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          
          {/* IMAGE GALLERY */}
          <div className="lg:col-span-7 space-y-4">
            <div className="relative aspect-square bg-gray-50 overflow-hidden border border-black/5">
              {allImages.length > 0 ? (
                <img
                  src={allImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-black/20 text-[10px] uppercase tracking-widest font-black">
                  No Image
                </div>
              )}
              
              {allImages.length > 1 && (
                <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between z-10 pointer-events-none">
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
                className="absolute top-6 right-6 p-3 bg-white border border-black/5 rounded-full z-10"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-black' : ''}`} />
              </button>
            </div>
            
            {allImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2 pb-2 overflow-x-auto scrollbar-hide">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square border transition-all ${selectedImage === index ? 'border-black' : 'border-transparent opacity-50'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
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
              <div className="text-2xl font-black tracking-tight">
                {formatPrice(product.price)}
              </div>
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
                    <span className="text-[10px] font-black uppercase tracking-widest text-black/40">
                      Select Size
                    </span>
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

            <div className="hidden lg:flex gap-3 pt-4 border-t border-black/5">
              <button 
                onClick={handleAddToCart}
                className="flex-[1] aspect-square flex items-center justify-center border border-black/10 hover:bg-gray-50"
              >
                <ShoppingBag className="w-5 h-5" />
              </button>
              <button 
                onClick={handleAddToCart}
                className="flex-[4] bg-black text-white text-[10px] font-black uppercase tracking-[0.3em] py-5 hover:bg-black/80"
              >
                Add to Cart — {formatPrice(product.price)}
              </button>
            </div>

            <div className="border-t border-black/10 divide-y divide-black/5">
              <details className="group py-5">
                <summary className="list-none flex justify-between items-center cursor-pointer text-[10px] font-black uppercase tracking-[0.2em]">
                  Item Description <Plus className="w-3 h-3 group-open:rotate-45 transition-transform" />
                </summary>
                <p className="mt-4 text-xs font-bold text-black/60 leading-relaxed uppercase tracking-widest">
                  {product.description || "Architectural silhouette with signature construction. Designed for permanent daily wear."}
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
              Add to Cart — {formatPrice(product.price)}
            </button>
         </div>
      </div>

      <SizeChartModal isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />
    </main>
  );
}