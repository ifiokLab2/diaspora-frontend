"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import AccountSidebar from "@/components/account-sidebar";
import { 
  ArrowLeft, Package, MapPin, CreditCard, 
  Truck, Calendar, Hash, Loader2 
} from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { getImageUrl,formatDate, formatCurrency, getDistanceInMiles } from '@/lib/utils';
import Image from "next/image";

const OrderDetailPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetail = async () => {
      try {
        const res = await api.get(`/orders/${id}/`);
        setOrder(res.data);
      } catch (err) {
        toast.error("Could not find this order.");
        router.push("/customer/account/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrderDetail();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="animate-spin text-primary-yellow" size={32} />
      </div>
    );
  }
  if (!order) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
      <Package size={48} className="text-muted-foreground" />
      <p className="text-lg font-bold">Order not found</p>
      <Link href="/customer/account/orders" className="text-primary-yellow underline">
        Back to my orders
      </Link>
    </div>
    );
  }

  const statusColors: any = {
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-green-100 text-green-700",
    shipped: "bg-blue-100 text-blue-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-background mt-24 py-2 px-[6%]">
      <div className="w-full py-8 flex lg:flex-row flex-col gap-8">
        <AccountSidebar />

        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Link href="/customer/account/orders" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary-yellow mb-2">
                <ArrowLeft size={16} /> Back to Orders
              </Link>
              <h1 className="text-2xl font-black flex items-center gap-3">
                Order #{order.id}
              </h1>
            </div>
            <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${statusColors[order.status]}`}>
              {order.status}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Item List */}
            <div className="md:col-span-2 space-y-4">
              <div className="bg-card border rounded-xl overflow-hidden">
                <div className="p-4 border-b bg-muted/20 font-bold text-sm flex items-center gap-2">
                  <Package size={16} /> Order Items
                </div>
                <div className="divide-y">
                  {order.items?.map((item: any) => (
                    <div key={item.productId} className="p-4 flex gap-4 items-center">
                      <div className="relative h-16 w-16 bg-muted rounded overflow-hidden flex-shrink-0">
                        <Image 
                          src={getImageUrl(item.product_image)} 
                          alt={item.product_name} 
                          
                          className="w-16 h-16 object-cover rounded-sm flex-shrink-0"
                          fill
                          sizes="64px"
                          
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{item.product_name} {item.productId}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black">{ formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 2. Order Metadata & Shipping */}
            <div className="space-y-6">
              {/* Shipping Card */}
              <div className="bg-card border rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <MapPin size={14} /> Shipping Details
                </h3>
                <div className="text-sm space-y-1">
                  <p className="font-bold">{order.shipping_address}</p>
                  <p className="text-muted-foreground capitalize">Method: {order.delivery_method} Delivery</p>
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-card border rounded-xl p-5 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <CreditCard size={14} /> Payment Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>{formatCurrency(order.total_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-green-600 font-bold">FREE</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-black text-lg">
                    <span>Total</span>
                    <span className="text-primary-yellow">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-muted/30 rounded-xl p-5 text-[11px] space-y-2">
                 <div className="flex items-center gap-2">
                    <Calendar size={12} /> Placed: {formatDate(order.created_at)}
                 </div>
                 <div className="flex items-center gap-2">
                    <Hash size={12} /> Payment ID: {order.stripe_payment_intent?.slice(0, 15)}...
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;