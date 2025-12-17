'use client'

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, Star, Heart, Share2, Ruler, ShoppingBag, Zap, Shield, Truck } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCart } from '@/app/contexts/CartContext';
import SizeChartModal from '@/app/components/SizesChart';
import { useCurrency } from '@/app/contexts/CurrencyContext';

type Product = {
  id: number;
  name: string;
  description: string | null;
  oldPrice: number | null;
  price: number;
  imageUrl: string | null;
  images: string[];
  colors: string[];
  sizes: string[];
  shipping: string | null;
  returns: string | null;
  details: string | null;
  likes: number;
};

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

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/Products/${params.id}`);
      const data = await response.json();
      setProduct(data.product);
      if (data.product.colors?.length > 0) setSelectedColor(data.product.colors[0]);
      if (data.product.sizes?.length > 0) setSelectedSize(data.product.sizes[0]);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.colors?.length > 0 && !selectedColor) {
      setError('Please select a color');
      return;
    }
    if (product.sizes?.length > 0 && !selectedSize) {
      setError('Please select a size');
      return;
    }
    if (quantity < 1) {
      setError('Please select a quantity');
      return;
    }

    setError('');
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity,
      selectedColor: selectedColor || 'N/A',
      selectedSize: selectedSize || 'N/A',
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-blue-600 border-b-transparent rounded-full animate-spin animation-delay-150"></div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mt-16 min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900">
        <p className="text-gray-300 text-lg font-medium">Product not found</p>
      </div>
    );
  }

  const allImages = [product.imageUrl, ...product.images].filter(Boolean) as string[];
  const discount = product.oldPrice 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0;

  return (
    <>
      <div className="mt-10 min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Compact Breadcrumb */}
          <nav className="mb-4 flex items-center gap-2 text-sm text-blue-300">
            <button onClick={() => router.push('/')} className="hover:text-white">Home</button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-blue-200">Products</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white font-medium truncate max-w-xs">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Image Gallery - Compact */}
            <div className="space-y-4">
              <div className="relative aspect-square bg-gradient-to-br from-blue-800/30 to-blue-900/30 rounded-2xl overflow-hidden border border-blue-700/50 shadow-xl group">
                {discount > 0 && (
                  <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {discount}% OFF
                  </div>
                )}
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition"
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
                </button>

                <img
                  src={allImages[selectedImage] || '/placeholder.jpg'}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <ChevronLeft className="w-5 h-5 text-blue-900" />
                    </button>
                    <button
                      onClick={() => setSelectedImage((prev) => (prev + 1) % allImages.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg"
                    >
                      <ChevronRight className="w-5 h-5 text-blue-900" />
                    </button>
                  </>
                )}
              </div>

              {allImages.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {allImages.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? ' shadow-md scale-105'
                          : 'border-blue-700/30'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info - Super Compact */}
            <div className="space-y-5">

              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-white mb-2 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-blue-300">({product.likes} reviews)</span>
                  <button className="ml-auto flex items-center gap-1 text-blue-300 hover:text-white">
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4 bg-gradient-to-r from-blue-800/40 to-blue-900/40 p-4 rounded-xl border border-blue-700/50">
                <span className="text-3xl font-black text-white">
                  {formatPrice(product.price)}
                </span>
                {product.oldPrice && (
                  <div className="text-right">
                    <span className="block text-base text-blue-300 line-through">
                      {formatPrice(product.oldPrice)}
                    </span>
                    <span className="text-green-400 text-xs font-bold">
                      Save {formatPrice(product.oldPrice - product.price)}
                    </span>
                  </div>
                )}
              </div>

              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-200 text-sm">
                  {error}
                </div>
              )}

              {/* Color - Compact */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white">Color</h3>
                  <div className="flex gap-3 flex-wrap">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => { setSelectedColor(color); setError(''); }}
                        style={{ backgroundColor: color.toLowerCase() }}
                        className={`w-12 h-12 rounded-full border-3 transition-all ${
                          selectedColor === color
                            ? 'border-blue-400 shadow-lg scale-110'
                            : 'border-blue-700/50'
                        }`}
                        title={color}
                      >
                        {selectedColor === color && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            </div>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size - Compact */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white">Size</h3>
                    <button
                      onClick={() => setShowSizeChart(true)}
                      className="text-blue-300 text-xs flex items-center gap-1 hover:text-white"
                    >
                      <Ruler className="w-3 h-3" />
                      Size Guide
                    </button>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => { setSelectedSize(size); setError(''); }}
                        className={`px-5 py-2 border-2 rounded-lg text-sm font-bold transition-all ${
                          selectedSize === size
                            ? 'border-blue-400 bg-blue-500 text-white'
                            : 'border-blue-700/50 text-blue-200 hover:border-blue-400'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-4">
                <span className="text-base font-bold text-white">Quantity</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border border-blue-700/50 rounded-lg flex items-center justify-center text-white hover:bg-blue-800/50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-lg font-bold text-white">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border border-blue-700/50 rounded-lg flex items-center justify-center text-white hover:bg-blue-800/50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* ACTION BUTTONS - Always visible early */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-4 bg-white/10 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-900 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Add to Cart
                </button>
                <button
                  onClick={handleBuyNow}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-5 h-5" />
                  Buy Now
                </button>
              </div>

              {/* Features - Tiny */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="bg-blue-800/30 p-3 rounded-lg border border-blue-700/50">
                  <Truck className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <p className="text-blue-200">Safe Delivery</p>
                </div>
                <div className="bg-blue-800/30 p-3 rounded-lg border border-blue-700/50">
                  <Shield className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <p className="text-blue-200">Secure Payment</p>
                </div>
                <div className="bg-blue-800/30 p-3 rounded-lg border border-blue-700/50">
                  <Star className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                  <p className="text-blue-200">Top Quality</p>
                </div>
              </div>

              {/* Collapsible Details - Minimal space */}
              <div className="space-y-2 text-sm">
                {product.description && (
                  <details className="group">
                    <summary className="cursor-pointer font-medium text-blue-200 hover:text-white flex items-center justify-between py-2">
                      Description
                      <ChevronRight className="w-4 h-4 group-open:rotate-90 transition" />
                    </summary>
                    <p className="text-blue-300 leading-relaxed pb-2">{product.description}</p>
                  </details>
                )}

                {(product.shipping || product.returns) && (
                  <details className="group">
                    <summary className="cursor-pointer font-medium text-blue-200 hover:text-white flex items-center justify-between py-2">
                      Shipping & Returns
                      <ChevronRight className="w-4 h-4 group-open:rotate-90 transition" />
                    </summary>
                    <div className="text-blue-300 space-y-1 pb-2">
                      {product.shipping && <p>{product.shipping}</p>}
                      {product.returns && <p>{product.returns}</p>}
                    </div>
                  </details>
                )}

                {product.details && (
                  <details className="group">
                    <summary className="cursor-pointer font-medium text-blue-200 hover:text-white flex items-center justify-between py-2">
                      Product Details
                      <ChevronRight className="w-4 h-4 group-open:rotate-90 transition" />
                    </summary>
                    <p className="text-blue-300 pb-2">{product.details}</p>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SizeChartModal isOpen={showSizeChart} onClose={() => setShowSizeChart(false)} />
    </>
  );
}