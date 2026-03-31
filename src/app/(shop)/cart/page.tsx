"use client";
import { useState,useEffect } from "react";
import art1 from "@/assets/arts.jpg";
import { Trash2, Minus, Plus,ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useCartStore } from '@/store/useCartStore';
import { getImageUrl, formatCurrency, getDistanceInMiles } from '@/lib/utils';
import { toast } from "react-hot-toast";
import { useAuth } from '@/context/AuthContext';
import api from "@/lib/api";


const Cart = () => {
  const { items, totalPrice, fetchCart, updateQuantity, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  const router = useRouter();


  // --- Checkout Logic ---
  
  const handleCheckout = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to complete your purchase");
      // Use callbackUrl to match your CustomerLogin.tsx logic
      router.push(`/login/customer?callbackUrl=${encodeURIComponent('/customer/checkout/summary/')}`);
      return;
    }

    try {
      // 2. Verify if profile is complete
      const res = await api.get("/auth/users/me/");
      const profile = res.data;

      // Logic: If address or city is missing, they need to fill the profile
      if (!profile?.address || !profile?.city || !profile?.phone) {
        //toast.info("Please complete your delivery profile first");
        router.push("/customer/checkout/address?callbackUrl=/customer/checkout/summary/");
        return;
      }

      // 3. Profile is good, proceed to checkout
      router.push("/customer/checkout/summary/");
    } catch (err) {
      console.error("Profile check failed", err);
      toast.error("Could not verify profile. Please try again.");
    } finally {
      //setLoading(false);
    }
  };

  // Ensure cart data is fresh on mount
  /*useEffect(() => {
    fetchCart();
  }, [fetchCart]);*/

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="text-gray-500">Looks like you haven't added anything yet.</p>
        <Link 
          href="/" 
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-medium"
        >
          <ArrowLeft size={18} /> Continue Shopping
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen md:mt-30 mt-15 bg-background flex items-start justify-center py-2 px-[6%]">
      <div className="w-full  flex flex-col lg:flex-row gap-6">
        {/* Cart Items */}
        <div className="flex-1 bg-card rounded shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h1 className="text-lg font-semibold text-card-foreground">
              Cart ({items.length}){}
            </h1>
          </div>

          <div className="divide-y">
            {items.map((item) => (
              <div key={item.id} className="px-6 py-5 flex gap-5">
                {/* Image */}
               <div className = "flex flex-col justify-between">
                  <Image
                  src={getImageUrl(item.product.main_image)}
                  alt={item.product.name}
                  className="w-20 h-20 object-cover rounded border"
                  width = {20}
                  height = {20}
                  unoptimized={true}
                />
                <button
                  onClick={() => removeItem(item.product.id)}
                      className="cursor-pointer sm:hidden flex items-center gap-1 text-primary-yellow text-xs font-medium mt-3 hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                  </button>
               </div>

                {/* Details */}
                <div className="flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex-1">
                    <a
                      href="#"
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {item.product.name}
                    </a>
                    <p className="text-xs text-success-foreground font-medium mt-1">
                      In Stock
                    </p>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className=" hidden sm:flex items-center gap-1 text-primary-yellow text-xs font-medium mt-3 hover:underline"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>

                  {/* Price & Quantity */}
                  <div className="flex flex-col items-end gap-3">

                    <div className="text-right">
                      <p className="text-base font-bold text-card-foreground">
                        £{(item.product.discount_price * item.quantity).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground line-through">
                          £{item.product.price}
                        </span>
                        <span className="text-[10px] font-semibold bg-discount text-discount-foreground px-1.5 py-0.5 rounded">
                          -{item.product.discount_percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="cursor-pointer w-8 h-8 flex items-center justify-center bg-primary-yellow text-primary-foreground rounded-l font-bold text-lg"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 h-8 flex items-center justify-center border-y text-sm font-medium bg-card text-card-foreground">
                        {item.quantity}
                      </span>
                      <button
                       onClick={() => updateQuantity(item.product.id, 1)}
                        className="cursor-pointer w-8 h-8 flex items-center justify-center bg-primary-yellow text-primary-foreground rounded-r font-bold text-lg"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button 
            onClick={clearCart}
            className="my-4 ml-6 cursor-pointer bg-red-500 rounded border px-5 py-2 text-sm text-white hover:bg-red-600 flex items-center gap-2 transition-colors"
          >
            Clear Entire Cart
          </button>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="w-full lg:w-72 shrink-0">
          <div className="bg-card rounded shadow-sm border">
            <div className="px-5 py-4 border-b">
              <h2 className="text-sm font-bold text-card-foreground tracking-wide uppercase">
                Cart Summary
              </h2>
            </div>
            <div className="px-5 py-4">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-card-foreground">Subtotal</span>
                <span className="font-bold text-card-foreground">
                  £{totalPrice.toFixed(2)}
                </span>
              </div>
              <button  onClick={handleCheckout} className="cursor-pointer mt-5 w-full bg-primary-yellow text-primary-foreground font-bold text-sm py-3 rounded hover:opacity-90 transition-opacity">
                CHECKOUT ({formatCurrency(totalPrice)})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
