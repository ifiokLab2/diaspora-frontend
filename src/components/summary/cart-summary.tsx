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


const CartSummary = () => {
 const { items, totalPrice, fetchCart, updateQuantity, removeItem, clearCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  const router = useRouter();


  // --- Checkout Logic ---
  const handleCheckout = () => {
    // Check for access token to verify if user is logged in
   
    if (!isAuthenticated) {
      toast.error("Please sign in to complete your purchase");
      // Use callbackUrl to match your CustomerLogin.tsx logic
      router.push(`/login/customer?callbackUrl=${encodeURIComponent('/customer/checkout/summary/')}`);
      return;
    }

    // If authenticated, move to checkout
    router.push("/customer/checkout/summary/");
  };

  // Ensure cart data is fresh on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div className="bg-card rounded-sm shadow-sm p-5 w-full lg:w-[320px] h-fit">
      <h3 className="text-sm font-bold text-foreground tracking-wide mb-3">CART SUMMARY</h3>
      <hr className="border-border mb-4" />

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <Image
                src={getImageUrl(item.product.main_image)}
                alt={item.product.name}
                className="w-16 h-16 object-cover rounded-sm flex-shrink-0"
                width = {16}
                height = {16}
               
              />
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted-foreground leading-tight">{item.product.name}</p>
              <p className="text-primary-yellow font-bold text-sm mt-1">
                {item.product.discount_price}
              </p>
              <p className="text-xs text-muted-foreground">Qty:{item.quantity}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <Link href="/cart/" className="text-primary-yellow text-sm font-medium hover:underline">
          Modify Cart
        </Link>
      </div>

      <hr className="border-border my-4" />

      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-foreground">Subtotal</span>
        <span className="text-sm font-bold text-foreground">
         £{totalPrice.toFixed(2)}
        </span>
      </div>

     
    </div>
  );
};

export default CartSummary;
