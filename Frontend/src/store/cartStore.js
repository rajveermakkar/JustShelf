import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set) => ({
      items: [],
      addItem: (item) => set((state) => {
        const existingItem = state.items.find((i) => i.id === item.id);
        if (existingItem) {
          return {
            items: state.items.map((i) =>
              i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          };
        }
        return { items: [...state.items, { ...item, quantity: 1 }] };
      }),
      removeItem: (itemId) => set((state) => ({
        items: state.items.filter((i) => i.id !== itemId),
      })),
      updateQuantity: (itemId, quantity) => set((state) => ({
        items: state.items.map((i) =>
          i.id === itemId ? { ...i, quantity: quantity } : i
        ),
      })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'cart-storage',
    }
  )
);

// Listen for cart updates from other components
if (typeof window !== 'undefined') {
  window.addEventListener('cartUpdated', () => {
    useCartStore.getState().clearCart();
  });
}

export default useCartStore; 