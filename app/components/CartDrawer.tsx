'use client';

import { X, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

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
      {/* Overlay */}
      {isCartOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={closeCart}
        />
      )}

      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isCartOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Your Bag <span className="text-orange-500">({cartItems.length})</span>
            </h2>
            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item, index) => (
                  <div key={`${item.id}-${item.selectedColor}-${item.selectedSize}-${index}`} className="flex gap-4 pb-6 border-b dark:border-gray-700">
                    {/* Product Image */}
                    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {formatPrice(item.price)}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
                        <span>Size: {item.selectedSize}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <span>Color:</span>
                          <div
                            className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                            style={{ backgroundColor: item.selectedColor?.toLowerCase() }}
                          />
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity - 1)}
                            className="w-7 h-7 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="w-3 h-3 dark:text-gray-300" />
                          </button>
                          <span className="w-8 text-center text-sm font-medium dark:text-gray-200">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.selectedColor, item.selectedSize, item.quantity + 1)}
                            className="w-7 h-7 border border-gray-300 dark:border-gray-600 rounded flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Increase quantity"
                          >
                            <Plus className="w-3 h-3 dark:text-gray-300" />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id, item.selectedColor, item.selectedSize)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t dark:border-gray-700 p-6 space-y-4 bg-gray-50 dark:bg-gray-900">
              {/* Promo Code */}
              <div className="pb-4 border-b dark:border-gray-700">
                <button className="text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 transition-colors">
                  Add promo code
                </button>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatPrice(cartTotal)}</span>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400">
                Tax included. Shipping calculated at checkout.
              </p>

              {/* View Cart Button */}
              <button
                onClick={goToCheckout}
                className="w-full py-4 bg-gradient-to-r from-orange-400 to-orange-500 text-white font-semibold rounded-lg hover:from-orange-500 hover:to-orange-600 transition-all duration-300 shadow-lg"
              >
                View cart
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}