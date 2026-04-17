'use client';

import { X, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, cartTotal, isCartOpen, closeCart } = useCart();
  const { formatPrice } = useCurrency();

  const goToCheckout = () => {
    closeCart();
    router.push('/checkout');
  };

  return (
    <>
      {/* Overlay - Minimal blur */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[60] transition-opacity duration-500"
          onClick={closeCart}
        />
      )}

      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] bg-white z-[70] transform transition-transform duration-500 ease-in-out border-l border-black/5 ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header - Architectural & Bold */}
          <div className="flex items-center justify-between p-8 border-b border-black/5">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter leading-none">
                Shopping Bag
              </h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-black/30 mt-1">
                {cartItems.length} {cartItems.length === 1 ? 'Object' : 'Objects'} in Archive
              </p>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover:rotate-90 transition-transform duration-300"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 text-black" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-black/20">
                  Bag is currently empty
                </p>
              </div>
            ) : (
              <div className="space-y-10">
                {cartItems.map((item, index) => (
                  <div 
                    key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${index}`} 
                    className="grid grid-cols-12 gap-5"
                  >
                    {/* Product Image - Aspect 3/4 */}
                    <div className="col-span-4 aspect-[3/4] bg-gray-50 border border-black/5 overflow-hidden">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-[10px] uppercase font-black opacity-20">
                          Empty
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="col-span-8 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="text-xs font-black uppercase tracking-tight leading-tight flex-1">
                            {item.name}
                          </h3>
                          <button
                            onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                            className="text-black/30 hover:text-black ml-4"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-black/40 mt-2">
                          {item.selectedSize} — {item.selectedColor}
                        </p>
                        <p className="text-sm font-black tracking-tighter mt-1">
                          {formatPrice(item.price)}
                        </p>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center border border-black/10 w-fit mt-4">
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer - Solid & Weighted */}
          {cartItems.length > 0 && (
            <div className="p-8 border-t border-black bg-white space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                  <span className="text-black/40">Total</span>
                  <span className="text-xl tracking-tighter">{formatPrice(cartTotal)}</span>
                </div>
                <p className="text-[9px] font-black uppercase tracking-widest text-black/30">
                  Tax and shipping calculated at checkout.
                </p>
              </div>

              <button
                onClick={goToCheckout}
                className="w-full py-5 bg-black text-white text-[11px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 hover:opacity-90 transition-all group"
              >
                Go to Checkout
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}