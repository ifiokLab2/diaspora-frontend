import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/lib/api';

/**
 * Interface Definitions
 * 
 */


interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  discount_price: number;        // Add this if missing
  discount_percentage: number;   // Add this if missing
  main_image: string;     // THIS IS THE FIX
  // ... other existing fields
}


interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  subtotal: number;
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
  isLoading: boolean;
  
  // Actions
  fetchCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, delta: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  reset: () => void;
}

/**
 * Zustand Store Implementation
 */
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalPrice: 0,
      isLoading: false,
      
      reset: () => {
        set({ items: [], totalPrice: 0 });
      },

      // GET: Fetches the latest cart state from Django
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const response = await api.get('/cart/');
          // Maps to the response from our Django CartSerializer
          set({ 
            items: response.data.items, 
            totalPrice: response.data.total_price,
            isLoading: false 
          });
        } catch (error) {
          console.error("Cart Fetch Error:", error);
          set({ isLoading: false });
        }
      },

      // POST: Adds an item (Matches AddToCartView)
      addItem: async (productId: number, quantity: number = 1) => {
        try {
          await api.post('/cart/add/', { 
            product_id: productId, 
            quantity: quantity 
          });
          // Re-fetch to ensure frontend math matches backend calculations
          await get().fetchCart();
        } catch (error) {
          console.error("Add Item Error:", error);
        }
      },

      // POST: Increases or decreases quantity (Matches UpdateCartQuantityView)
      updateQuantity: async (productId: number, delta: number) => {
        try {
          await api.post('/cart/update/', { 
            product_id: productId, 
            quantity: delta 
          });
          await get().fetchCart();
        } catch (error) {
          console.error("Update Quantity Error:", error);
        }
      },

      // DELETE: Removes a specific item record (Matches RemoveFromCartView)
      removeItem: async (productId: number) => {
        try {
          await api.delete(`/cart/remove/${productId}/`);
          await get().fetchCart();
        } catch (error) {
          console.error("Remove Item Error:", error);
        }
      },

      // DELETE: Wipes all items in the user's cart (Matches ClearCartView)
      clearCart: async () => {
        try {
          await api.delete('/cart/clear/');
          // Reset local state for immediate visual feedback
          set({ items: [], totalPrice: 0 });
        } catch (error) {
          console.error("Clear Cart Error:", error);
        }
      },
    }),
    {
      name: 'shopping-cart-storage', // Key used in LocalStorage
      // Only persist the data, not the loading status
      partialize: (state) => ({ 
        items: state.items, 
        totalPrice: state.totalPrice 
      }),
    }
  )
);