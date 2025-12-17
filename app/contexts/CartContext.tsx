'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CartItem = {
  id: number;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
  selectedColor: string;
  selectedSize: string;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: number, color: string, size: string) => void;
  updateQuantity: (id: number, color: string, size: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false); // This is the key!

  // Load cart from localStorage ONCE on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        setCartItems(parsed);
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage', error);
      // Optionally clear corrupted data
      localStorage.removeItem('cart');
    } finally {
      setIsInitialized(true); // Mark as loaded
    }
  }, []);

  // Save to localStorage ONLY after initialization and when cart changes
  useEffect(() => {
    if (!isInitialized) return; // Don't save until we've loaded first!
    if (typeof window === 'undefined') return;

    if (cartItems.length === 0) {
      localStorage.removeItem('cart');
    } else {
      localStorage.setItem('cart', JSON.stringify(cartItems));
    }
  }, [cartItems, isInitialized]);

  const addToCart = (item: CartItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.id === item.id &&
          i.selectedColor === item.selectedColor &&
          i.selectedSize === item.selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += item.quantity;
        return updated;
      }
      return [...prev, item];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: number, color: string, size: string) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.id === id && item.selectedColor === color && item.selectedSize === size)
      )
    );
  };

  const updateQuantity = (id: number, color: string, size: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(id, color, size);
      return;
    }

    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.selectedColor === color && item.selectedSize === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('cart'); // Clean up
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const cartTotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        isCartOpen,
        openCart,
        closeCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}