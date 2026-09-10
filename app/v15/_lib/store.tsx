/** V15 — state provider for the delvaux/maison clone experience.
 * Owns cart (mock — replace with real order API / Prisma later),
 * fullscreen menu state, and toast stack. Nothing here imports from
 * the rest of the application.
 */

'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from './data';

export type CartItem = { product: Product; qty: number };
export type Toast = { id: number; title: string; desc?: string };

type V15ContextValue = {
  // cart (mock — replace with real order API / Prisma later)
  items: CartItem[];
  count: number;
  subtotal: number;
  addToCart: (p: Product) => void;
  removeFromCart: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  cartOpen: boolean;
  setCartOpen: (v: boolean) => void;
  // fullscreen menu
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  // toasts
  toasts: Toast[];
  toast: (title: string, desc?: string) => void;
  dismissToast: (id: number) => void;
};

const V15Context = createContext<V15ContextValue | null>(null);

export function V15Provider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  const addToCart = useCallback((p: Product) => {
    setItems((prev) => {
      const found = prev.find((i) => i.product.id === p.id);
      if (found) {
        return prev.map((i) =>
          i.product.id === p.id ? { ...i, qty: i.qty + 1 } : i,
        );
      }
      return [...prev, { product: p, qty: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== id));
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.product.id !== id)
        : prev.map((i) => (i.product.id === id ? { ...i, qty } : i)),
    );
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (title: string, desc?: string) => {
      const id = ++toastId.current;
      setToasts((prev) => [...prev.slice(-2), { id, title, desc }]);
      window.setTimeout(() => dismissToast(id), 3200);
    },
    [dismissToast],
  );

  const value = useMemo<V15ContextValue>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.qty * i.product.price, 0);
    return {
      items,
      count,
      subtotal,
      addToCart,
      removeFromCart,
      setQty,
      cartOpen,
      setCartOpen,
      menuOpen,
      setMenuOpen,
      toasts,
      toast,
      dismissToast,
    };
  }, [
    items,
    cartOpen,
    menuOpen,
    toasts,
    addToCart,
    removeFromCart,
    setQty,
    toast,
    dismissToast,
  ]);

  return (
    <V15Context.Provider value={value}>{children}</V15Context.Provider>
  );
}

export function useV15(): V15ContextValue {
  const ctx = useContext(V15Context);
  if (!ctx) throw new Error('useV15 must be used within V15Provider');
  return ctx;
}
