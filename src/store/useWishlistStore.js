import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (product) => {
        const exists = get().items.some((item) => item.id === product.id);
        if (exists) {
          set((state) => ({
            items: state.items.filter((item) => item.id !== product.id),
          }));
          return;
        }

        set((state) => ({ items: [...state.items, product] }));
      },

      removeItem: (id) => {
        set((state) => ({ items: state.items.filter((item) => item.id !== id) }));
      },

      isWishlisted: (id) => get().items.some((item) => item.id === id),
    }),
    { name: 'wishlist-storage' }
  )
);