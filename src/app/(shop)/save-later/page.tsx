'use client';
import { User, ShoppingBag, Heart, LogOut, Trash2 ,ArrowLeft, Loader2 } from "lucide-react";
import artFrame from "@/assets/arts.jpg";
import AccountSidebar from "@/components/account-sidebar";
import Link from 'next/link';
import Image from "next/image";
import { useEffect, useState } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl, formatCurrency, getDistanceInMiles } from '@/lib/utils';

const sidebarItems = [
  { icon: User, label: "My Account" },
  { icon: ShoppingBag, label: "Orders" },
  { icon: Heart, label: "Saved Items", active: true },
];

interface SavedProduct {
  id: number;
  name: string;
  main_image: string;
  price: number;
}

const SaveLater = () => {
  const [products, setProducts] = useState<SavedProduct[]>([])
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();

  const handleRemove = async (productId: number) => {
    try {
      // We use the same toggle endpoint we built earlier
      await api.post(`/products/saved/toggle/${productId}/`);
      
      // Update the UI by filtering out the removed product
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      alert("Failed to remove item. Please try again.");
    }
  };

  useEffect(() => {
    const fetchSavedItems = async () => {
      try {
        const res = await api.get('/saved-items/');
        setProducts(res.data);
      } catch (err) {
        console.error("Error fetching saved items", err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchSavedItems();
    }
  }, [isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-2">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
        <p className="text-gray-500 font-medium">Loading your favorites...</p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background  py-2 px-[6%] mt-30">
      <div className="flex w-full gap-6 flex-col-reverse lg:flex-row">
        {/* Sidebar */}
         <AccountSidebar />

        {/* Main Content */}
        <main className="flex-1 rounded bg-card shadow-sm">
          <div className="border-b px-6 py-4">
            <h1 className="text-lg font-medium text-foreground">
              Saved {products.length === 1 ? 'item' : 'items'} ({products.length})
            </h1>
          </div>

          <div className="divide-y">
            {products.length === 0 && (
              /* Empty State */
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-16 text-center">
                <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="text-red-400" size={40} />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">No saved items yet</h2>
                <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                  Click the heart icon on any product to save it here for later.
                </p>
                <Link href="/" className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all">
                  Browse Products
                </Link>
              </div>
            )}
            {products.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-6 px-6 py-6"
              >
                <Image
    src={getImageUrl(item.main_image)}
    alt={item.name}
    width={112} // Matches w-28
    height={112} // Matches h-28
    unoptimized={true}
    className="h-28 w-28 rounded object-cover"
  />
                <div className="flex-1">
                  <h2 className="text-sm font-semibold text-foreground">
                    {item.name}
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatCurrency(item.price)}
                  </p>
                </div>
                <button  onClick={() => handleRemove(item.id)}className="cursor-pointer flex items-center gap-1 text-sm font-semibold text-primary-yellow transition-colors hover:text-primary-yellow/80">
                  <Trash2 size={16} />
                  REMOVE
                </button>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SaveLater;
