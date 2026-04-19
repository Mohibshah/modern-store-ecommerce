import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,

      login: ({ email }) =>
        set({
          isAuthenticated: true,
          user: {
            email,
            name: email.split('@')[0],
            addresses: ['221B Baker Street, London'],
            orders: ['#MDS-1021', '#MDS-9874'],
          },
        }),

      signup: ({ name, email }) =>
        set({
          isAuthenticated: true,
          user: {
            email,
            name,
            addresses: [],
            orders: [],
          },
        }),

      updateProfile: (payload) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              ...payload,
            },
          };
        }),

      addAddress: (address) =>
        set((state) => {
          if (!state.user || !address.trim()) return state;
          const trimmedAddress = address.trim();
          const alreadyExists = state.user.addresses.some(
            (item) => item.toLowerCase() === trimmedAddress.toLowerCase()
          );
          if (alreadyExists) return state;
          return {
            user: {
              ...state.user,
              addresses: [...state.user.addresses, trimmedAddress],
            },
          };
        }),

      removeAddress: (address) =>
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              addresses: state.user.addresses.filter((item) => item !== address),
            },
          };
        }),

      addOrderReference: (orderId) =>
        set((state) => {
          if (!state.user || !orderId) return state;
          if (state.user.orders.includes(orderId)) return state;
          return {
            user: {
              ...state.user,
              orders: [orderId, ...state.user.orders],
            },
          };
        }),

      logout: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);