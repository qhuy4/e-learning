import { createContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { CartItem } from "../types/cart.type";

const CART_STORAGE_KEY = "piemind_cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (courseId: number) => void;
  clearCart: () => void;
  isInCart: (courseId: number) => boolean;
  total: number;
  itemCount: number;
}

export const CartContext = createContext<CartContextValue | null>(null);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      if (prev.some((i) => i.courseId === item.courseId)) return prev;
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((courseId: number) => {
    setItems((prev) => prev.filter((i) => i.courseId !== courseId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const isInCart = useCallback(
    (courseId: number) => items.some((i) => i.courseId === courseId),
    [items],
  );

  const total = items.reduce((sum, i) => sum + Number(i.price), 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, clearCart, isInCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
};
