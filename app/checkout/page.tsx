'use client';

import { useState } from 'react';
import { useCart } from '../contexts/CartContext';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion'; 
import { useCurrency } from '../contexts/CurrencyContext';

export default function CartCheckoutPage() {
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const { data: session } = useSession();
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);

  const shipping = 50.00;
  const estimatedTaxes = 0.00;
  const total = cartTotal + shipping + estimatedTaxes;

  const handleCheckout = () => {
    if (!session) {
      setShowAuthModal(true);
      return;
    }
    router.push('/PaymentCheckout/payment');
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-6">
        <div className="text-center">
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-black/30 mb-4">Your Archive is Empty</h2>
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-8">No Items Found</h1>
          <Link
            href="/products"
            className="inline-block px-12 py-4 bg-black text-white text-[10px] font-black uppercase tracking-widest hover:bg-black/80 transition-all"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white pt-32 pb-20 px-5 lg:px-10"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-end mb-12 border-b border-black pb-6 gap-4">
          <h1 className="text-5xl lg:text-7xl font-black uppercase tracking-tighter leading-none">
            Shopping <br /> Bag
          </h1>
          <div className="text-[10px] font-black uppercase tracking-widest text-black/40">
            {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'} Selected
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* 1. CART ITEMS LIST */}
          <div className="lg:col-span-8">
            <div className="divide-y divide-black/10">
              {cartItems.map((item) => (
                <div
                  key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="py-8 grid grid-cols-12 gap-6 items-start"
                >
                  {/* Image */}
                  <div className="col-span-4 lg:col-span-3 aspect-[3/4] bg-gray-50 border border-black/5 overflow-hidden">
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="col-span-8 lg:col-span-9 flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-black uppercase tracking-tight leading-tight mb-2">
                          {item.name}
                        </h3>
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/40">
                          {item.selectedColor} — {item.selectedSize}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                        className="text-black hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex justify-between items-end mt-8">
                      {/* Quantity Logic */}
                      <div className="flex items-center border border-black/10">
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                          className="px-3 py-2 hover:bg-black hover:text-white transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-4 text-[11px] font-black">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                          className="px-3 py-2 hover:bg-black hover:text-white transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-lg font-black tracking-tighter">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. ORDER SUMMARY (STICKY) */}
          <div className="lg:col-span-4">
            <div className="border border-black p-8 sticky top-32">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] mb-10 border-b border-black pb-4">
                Order Summary
              </h2>

              <div className="space-y-4 mb-10">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="text-black/40">Subtotal</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="text-black/40">Shipping</span>
                  <span>{formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest border-t border-black/5 pt-4 mt-4">
                  <span>Total</span>
                  <span className="text-xl">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Promo Code Input - Styled Minimalist */}
              <div className="mb-8 flex border-b border-black">
                <input
                  type="text"
                  placeholder="PROMO CODE"
                  className="flex-1 py-2 bg-transparent text-[10px] font-black uppercase tracking-widest focus:outline-none"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                />
                <button className="text-[10px] font-black uppercase tracking-widest hover:opacity-50">
                  Apply
                </button>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:bg-black/90 transition-all group"
              >
                Proceed to Checkout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-4 opacity-30">
                <div className="h-[1px] flex-1 bg-black"></div>
                <span className="text-[8px] font-black uppercase tracking-widest">Secure Payment</span>
                <div className="h-[1px] flex-1 bg-black"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal - Cleaned up to match brand */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
          <div className="relative bg-white w-full max-w-md border border-black p-10 text-center">
            <h2 className="text-2xl font-black uppercase tracking-tighter mb-4">Authentication Required</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-8 leading-relaxed">
              Please sign in to your secure account to finalize this transaction.
            </p>
            <Link href="auth/Signin" className="block w-full py-4 border border-black text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all mb-4">
              Sign In with Google
            </Link>
            <button onClick={() => setShowAuthModal(false)} className="text-[9px] font-black uppercase tracking-widest text-black/40 hover:text-black">
              Return to Bag
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}