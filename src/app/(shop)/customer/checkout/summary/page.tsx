"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import CheckoutSection from "@/components/checkout-section";
import CartSummary from "@/components/summary/cart-summary";
import { useCartStore } from "@/store/useCartStore";
import api from "@/lib/api";
import { toast } from "react-hot-toast";
import { Loader2, ShieldCheck, CreditCard } from "lucide-react";
import Link from "next/link";


interface UserProfile {
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  city_name?: string;
  country_name?: string;
  country?: string;
  phone: string;
}

const CheckoutSummary = () => {
  const router = useRouter();
  const { items, totalPrice } = useCartStore();
  
  const [profile, setProfile] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [deliveryMethod, setDeliveryMethod] = useState("door");

  useEffect(() => {
    // Guard: If cart is empty, redirect back to cart
    if (items.length === 0) {
      router.push("/cart");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await api.get("/auth/users/me/");
        const profile = res.data;

        // Logic: If address or city is missing, they need to fill the profile
        if (!profile?.address || !profile?.city || !profile?.phone) {
          //toast.info("Please complete your delivery profile first");
          toast.error("Please complete your delivery profile first");
          router.push("/customer/checkout/address?callbackUrl=/customer/checkout/summary/");
          return;
        }
        setProfile(res.data);
      } catch (err) {
        toast.error("Please log in to continue");
        router.push("/login/customer?callbackUrl=/customer/checkout/summary/");
      } finally {
        setIsFetching(false);
      }
    };

    fetchProfile();
  }, [items, router]);

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      // Prepare payload for the OrderCreateView APIView
      const orderData = {
        items: items.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
        total_amount: totalPrice, // Matches 'total_amount' in your Django Model
        delivery_method: deliveryMethod,
        shipping_address: `${profile?.address}, ${profile?.city_name}, ${profile?.country_name }`,
      };

      // 1. Post to Django APIView
      const res = await api.post("/orders/", orderData);
      
      // 2. Redirect to Stripe Checkout URL
      if (res.data.checkout_url) {
        toast.loading("Redirecting to secure payment...");
        window.location.href = res.data.checkout_url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (err: any) {
      console.error("Checkout error:", err);
      toast.error(err.response?.data?.error || "Failed to initialize payment. Please try again.");
      setLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-yellow" size={40} />
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-background mt-29">
      <div className="max-w-full py-2 px-[6%]">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Main Content */}
          <div className="flex-1 min-w-0 w-full">
            {/* 1. Address Details */}
            <CheckoutSection
              number={1}
              title="ADDRESS DETAILS"
              action={
                <Link href="/customer/address/create?redirect=/customer/checkout/summary/" className="text-primary-yellow hover:underline text-sm font-medium">
                  Change
                </Link>
              }
            >
              <div className="text-sm text-card-foreground">
                <p className="font-bold capitalize">{profile?.first_name} {profile?.last_name}</p>
                <p className="mt-1 opacity-80">{profile?.address}</p>
                <p className="opacity-80">{profile?.city_name}, {profile?.country_name || profile?.country}</p>
                <p className="mt-2 font-medium">{profile?.phone}</p>
              </div>
            </CheckoutSection>

            {/* 2. Delivery Method */}
            <CheckoutSection number={2} title="DELIVERY METHOD">
              <div className="text-sm text-card-foreground">
                <p className="font-bold mb-3">How do you want your order delivered?</p>
                <label className="flex items-center gap-2 mb-2 cursor-pointer">
                  <input
                    type="radio" 
                    name="delivery" 
                    checked={deliveryMethod === "door"}
                    onChange={() => setDeliveryMethod("door")}
                    className="accent-primary w-4 h-4" />
                  <span>Door Delivery</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio" 
                    name="delivery" 
                    checked={deliveryMethod === "pickup"}
                    onChange={() => setDeliveryMethod("pickup")}
                    className="accent-primary w-4 h-4" />
                  <span>Pickup Station(Cheaper Shipping Fees than Door Delivery</span>
                </label>
              </div>
            </CheckoutSection>

            {/* 3. Payment Method */}
            <CheckoutSection number={3} title="PAYMENT METHOD">
              <div className="text-sm text-card-foreground">
                <p className="font-bold mb-3">Pay with Cards, Bank Transfer or USSD</p>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="payment" className="accent-primary w-4 h-4" />
                  <span>Card</span>
                </label>
              </div>
            </CheckoutSection>
            

            {/* 4. Refund Policy */}
            <div className="mb-6">
              <div className="border-l-4 border-primary-yellow pl-4 pb-2 mb-0">
                <h2 className="text-sm font-bold text-card-foreground">4. REFUND POLICY:</h2>
              </div>
              <div className="border border-border bg-card p-5 text-sm text-card-foreground">
                <ul className="list-disc pl-5 space-y-2">
                  <li>
                    You can initiate a return within 7 days for ALL eligible items if you receive a
                    wrong, damaged, defective, or counterfeit item.
                  </li>
                  <li>
                    When returning an item, keep all seals, tags, accessories intact and ensure the
                    item is in its original packaging.
                  </li>
                  <li>
                    Remove any passwords from devices being returned, otherwise the return will be
                    invalid.
                  </li>
                  <li>
                    You can request a return if you have changed your mind about an item, but some
                    items (e.g. swimwear, underwear, cosmetics, food supplements) cannot be returned
                    for
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Cart Summary Sidebar */}
          <div className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-6 ">
            <CartSummary />
            <div className="bg-muted/10 border-t">
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="w-full bg-primary-yellow text-black font-black py-4 rounded-lg shadow-md hover:bg-yellow-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      RESERVING ORDER...
                    </>
                  ) : (
                    `PAY £${totalPrice.toFixed(2)}`
                  )}
                </button>
                <p className="text-[10px] text-center mt-3 text-muted-foreground">
                  You will be redirected to Stripe to complete your purchase safely.
                </p>
              </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSummary;
