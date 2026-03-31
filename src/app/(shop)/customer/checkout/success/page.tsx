"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/useCartStore";
import { CheckCircle, ShoppingBag, ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

const SuccessContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {items, clearCart } = useCartStore();
  const sessionId = searchParams.get("session_id");

  

  useEffect(() => {
    // 1. Only clear if there are items (prevents redundant API calls on refresh)
    if (sessionId && items.length > 0) {
      clearCart();
    }
    
    // // 2. If someone tries to access this page without a session, send them home
    if (!sessionId) {
      toast.error("No active session found.");
      router.push("/");
    }
  }, [sessionId, items.length, clearCart, router]);

  // 3. Prevent flickering "Success" content if there's no session
  //if (!sessionId) return null;
   if (!sessionId) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-yellow"></div>
        <p className="text-sm text-gray-500 italic">Checking session...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 md:mt-23 mt-4">
      <div className="max-w-md w-full text-center space-y-8 p-8 rounded-2xl border bg-card shadow-sm">
        {/* Success Icon Animation */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-4 text-green-600 animate-bounce">
            <CheckCircle size={48} strokeWidth={2.5} />
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-xl md:text-3xl font-black text-foreground">Order Placed!</h1>
          <p className="text-muted-foreground text-sm">
            Thank you for your purchase. We've sent a confirmation email with your order details.
          </p>
          {sessionId && (
            <p className="text-[10px] font-mono text-muted-foreground mt-2 bg-muted py-1 rounded">
              Ref: {sessionId.slice(0, 20)}...
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button asChild className="bg-primary-yellow text-black hover:bg-yellow-500 font-bold py-6">
            <Link href="/customer/account/orders">
              <ShoppingBag size={18} className="mr-2" /> View My Orders
            </Link>
          </Button>
          
          <Button variant="outline" asChild className="py-6 font-bold">
            <Link href="/">
              <Home size={18} className="mr-2" /> Back to Home
            </Link>
          </Button>
        </div>

        <div className="pt-4 border-t border-dashed">
          <p className="text-xs text-muted-foreground italic">
            Need help? <Link href="/contact" className="underline hover:text-primary-yellow">Contact Support</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

// Wrap in Suspense because useSearchParams() requires it in Next.js App Router
const SuccessPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <CheckCircle className="animate-pulse text-muted" size={48} />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
};

export default SuccessPage;