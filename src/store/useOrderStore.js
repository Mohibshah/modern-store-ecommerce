import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useOrderStore = create(
  persist(
    (set, get) => ({
      orders: [],
      currentOrder: null,
      
      // Current checkout state
      shippingAddress: null,
      shippingMethod: 'standard',
      paymentInfo: null,

      // Add a new order
      createOrder: (orderData) => {
        const orderId = `#ORD-${Date.now()}`;
        const order = {
          id: orderId,
          ...orderData,
          createdAt: new Date().toISOString(),
        };
        
        set((state) => ({
          orders: [...state.orders, order],
          currentOrder: order,
        }));
        
        return orderId;
      },

      // Update shipping address
      setShippingAddress: (address) =>
        set({ shippingAddress: address }),

      // Update shipping method
      setShippingMethod: (method) =>
        set({ shippingMethod: method }),

      // Update payment info
      setPaymentInfo: (paymentInfo) =>
        set({ paymentInfo }),

      // Reset checkout state
      resetCheckout: () =>
        set({
          shippingAddress: null,
          shippingMethod: 'standard',
          paymentInfo: null,
        }),

      // Fetch order by ID
      getOrderById: (orderId) => {
        const order = get().orders.find((o) => o.id === orderId);
        return order;
      },

      // Get user's orders
      getUserOrders: (email) => {
        return get().orders.filter((o) => o.customerEmail === email);
      },
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({
        orders: state.orders,
      }),
    }
  )
);
