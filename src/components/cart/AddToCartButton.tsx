'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
//import { ShoppingPlus } from 'lucide-react';
import { ShoppingCart, Plus } from 'lucide-react';

interface Props {
  productId: number;
}

export default function AddToCartButton({ productId }: Props) {
  const [loading, setLoading] = useState(false);
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleAdd = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigating to product detail if clicked on card
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setLoading(true);
    await addItem(productId, 1);
    setLoading(false);
  };

  return (
    <button
      onClick={handleAdd}
      disabled={loading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 active:scale-95"
    >
      {loading ? (
        <span className="animate-pulse">Adding...</span>
      ) : (
        <>
         
          <div className="relative">
          <ShoppingCart size={18} />
          <Plus size={10} className="absolute -top-1 -right-1 bg-indigo-600 rounded-full" />
          Add to Cart
          </div>
        </>
      )}
    </button>
  );
}