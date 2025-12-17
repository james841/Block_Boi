'use client'
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function CartIconButton() {
  const { cartCount, openCart } = useCart();

  return (
    
    <button

      onClick={openCart}
      className="relative p-2 hover:bg-gray-100 rounded-full transition-colors "
      aria-label="Open shopping cart"
    >
      <ShoppingBag className="w-6 h-6 text-gray-900" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
          {cartCount > 9 ? '9+' : cartCount}
        </span>
      )}
    </button>
    
  );
}