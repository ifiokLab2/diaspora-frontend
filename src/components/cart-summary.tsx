"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useCartStore } from '@/store/useCartStore';
import { getImageUrl, formatCurrency } from '@/lib/utils';
import { toast } from "react-hot-toast";
import { useAuth } from '@/context/AuthContext';

import { Loader2 } from "lucide-react";

interface CartSummaryProps {
  onCheckoutAttempt?: () => Promise<boolean>;
}

const CartSummary = ({ onCheckoutAttempt }: CartSummaryProps) => {
  const { items, totalPrice, fetchCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    // 1. Auth Check
    if (!isAuthenticated) {
      toast.error("Please sign in to complete your purchase");
      router.push(`/login/customer?callbackUrl=${encodeURIComponent('/customer/checkout/summary/')}`);
      return;
    }

    // 2. Prevent double clicks
    setIsProcessing(true);
    
    try {
      // 3. Trigger Parent Validation & Save
      // This calls handleSaveData in CheckoutAddress.tsx
      if (onCheckoutAttempt) {
        const isSaved = await onCheckoutAttempt();
        
        // If validation fails or API fails, handleSaveData returns false
        if (!isSaved) {
          setIsProcessing(false);
          return; // Stop and stay on the page so user can fix fields
        }
      }

      // 4. If save was successful, proceed to summary
      router.push("/customer/checkout/summary/");
    } catch (error) {
      toast.error("An unexpected error occurred. Please try again.");
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <div className="bg-card rounded-sm shadow-sm p-5 w-full lg:w-[320px] h-fit border">
      <h3 className="text-sm font-bold text-foreground tracking-wide mb-3 uppercase">Cart Summary</h3>
      <hr className="border-border mb-4" />

      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
        {items.length > 0 ? (
          items.map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="relative w-14 h-14 shrink-0 border rounded overflow-hidden bg-muted">
                <Image
                  src={getImageUrl(item.product.main_image)}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground leading-tight truncate">
                  {item.product.name}
                </p>
                <p className="text-primary-yellow font-bold text-sm mt-1">
                  {formatCurrency(item.product.discount_price)}
                </p>
                <p className="text-[10px] text-muted-foreground">Qty: {item.quantity}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-muted-foreground py-4 text-center">Your cart is empty</p>
        )}
      </div>

      <div className="mt-4 text-center">
        <Link href="/cart/" className="text-primary-yellow text-[11px] font-bold hover:underline uppercase">
          Modify Cart
        </Link>
      </div>

      <hr className="border-border my-4" />

      <div className="flex justify-between items-center mb-4">
        <span className="text-sm font-semibold text-foreground">Subtotal</span>
        <span className="text-sm font-bold text-foreground">
          {formatCurrency(totalPrice)}
        </span>
      </div>

      <button 
        onClick={handleCheckout} 
        disabled={isProcessing || items.length === 0}
        className="cursor-pointer w-full bg-primary-yellow text-black py-3 rounded-md text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> 
            Processing...
          </>
        ) : (
          `CHECKOUT (${formatCurrency(totalPrice)})`
        )}
      </button>
      
      <p className="text-[9px] text-muted-foreground text-center mt-3 leading-relaxed">
        By clicking Checkout, your delivery details will be validated and saved automatically.
      </p>
    </div>
  );
};

export default CartSummary;