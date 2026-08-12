import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartLine = {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  imageKey: string;
  colorName: string;
  size: string;
  unitPrice: number;
  compareAt: number | null;
  quantity: number;
  maxStock: number;
};

type CartState = {
  lines: CartLine[];
  lastAdded: string | null;
  add: (line: CartLine) => void;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      lastAdded: null,
      add: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => l.variantId === line.variantId);
          const lines = existing
            ? state.lines.map((l) =>
                l.variantId === line.variantId
                  ? { ...l, quantity: Math.min(l.maxStock, l.quantity + line.quantity) }
                  : l,
              )
            : [...state.lines, line];
          return { lines, lastAdded: line.variantId };
        }),
      setQty: (variantId, qty) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              l.variantId === variantId
                ? { ...l, quantity: Math.max(0, Math.min(l.maxStock, qty)) }
                : l,
            )
            .filter((l) => l.quantity > 0),
        })),
      remove: (variantId) =>
        set((state) => ({ lines: state.lines.filter((l) => l.variantId !== variantId) })),
      clear: () => set({ lines: [], lastAdded: null }),
    }),
    { name: "esko-cart-v1" },
  ),
);

export function cartSubtotal(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
}

export function cartSavings(lines: CartLine[]): number {
  return lines.reduce(
    (sum, l) => sum + (l.compareAt ? (l.compareAt - l.unitPrice) * l.quantity : 0),
    0,
  );
}

export function cartCount(lines: CartLine[]): number {
  return lines.reduce((sum, l) => sum + l.quantity, 0);
}
