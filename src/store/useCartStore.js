import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      promoCode: '',
      cartOpen: false,
      lastAddedAt: 0,
      lastAddedName: '',
      lastAddedImage: '',
      lastAddedX: null,
      lastAddedY: null,

      addItem: (product, quantity = 1, meta = {}) => {
        const sourceX = Number.isFinite(meta.sourceX) ? meta.sourceX : null;
        const sourceY = Number.isFinite(meta.sourceY) ? meta.sourceY : null;
        const existing = get().items.find((item) => item.id === product.id);
        if (existing) {
          set((state) => ({
            items: state.items.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
            lastAddedAt: Date.now(),
            lastAddedName: product.name,
            lastAddedImage: product.image,
            lastAddedX: sourceX,
            lastAddedY: sourceY,
          }));
          return;
        }

        set((state) => ({
          items: [...state.items, { ...product, quantity }],
          lastAddedAt: Date.now(),
          lastAddedName: product.name,
          lastAddedImage: product.image,
          lastAddedX: sourceX,
          lastAddedY: sourceY,
        }));
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },

      updateQuantity: (id, quantity) => {
        const safeQty = Math.max(1, Number(quantity) || 1);
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity: safeQty } : item
          ),
        }));
      },

      clearCart: () => set({ items: [], promoCode: '' }),

      setPromoCode: (promoCode) => set({ promoCode }),

      setCartOpen: (cartOpen) => set({ cartOpen }),
      toggleCart: () => set((state) => ({ cartOpen: !state.cartOpen })),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        promoCode: state.promoCode,
      }),
    }
  )
);

export const selectCartCount = (state) =>
  state.items.reduce((acc, item) => acc + item.quantity, 0);

export const selectCartSubtotal = (state) =>
  state.items.reduce((acc, item) => acc + item.price * item.quantity, 0);