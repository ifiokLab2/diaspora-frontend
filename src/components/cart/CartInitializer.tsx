'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';

export default function CartInitializer() {
  const fetchCart = useCartStore((state) => state.fetchCart);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Only fetch the cart if the user has a token in localStorage
    if (isAuthenticated) {
      fetchCart();
    }
  }, [fetchCart, isAuthenticated]);

  return null; // This component doesn't render anything
}