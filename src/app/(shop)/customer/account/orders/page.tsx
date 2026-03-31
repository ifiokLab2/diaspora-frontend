"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import AccountSidebar from "@/components/account-sidebar";
import { Package, ChevronRight, Clock, CheckCircle2, XCircle, Truck, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "react-hot-toast";
import { getImageUrl,formatDate, formatCurrency, getDistanceInMiles } from '@/lib/utils';

interface OrderItem {
  product_name: string;
  product_image: string; // From Django ImageField
  quantity: number;
  price: string;
}

interface Order {
  id: number;
  total_amount: string;
  status: 'pending' | 'paid' | 'shipped' | 'cancelled';
  delivery_method: string;
  created_at: string;
  items: OrderItem[];
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders/");
        setOrders(res.data);
      } catch (err) {
        toast.error("Failed to load your orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getStatusUI = (status: Order['status']) => {
    const styles = {
      pending: { color: "text-amber-600 bg-amber-50", icon: <Clock size={14} />, label: "Pending" },
      paid: { color: "text-blue-600 bg-blue-50", icon: <CheckCircle2 size={14} />, label: "Paid" },
      shipped: { color: "text-purple-600 bg-purple-50", icon: <Truck size={14} />, label: "Shipped" },
      cancelled: { color: "text-red-600 bg-red-50", icon: <XCircle size={14} />, label: "Cancelled" },
    };
    return styles[status] || styles.pending;
  };

  return (
    <div className="min-h-screen bg-background mt-24 py-2 px-[6%]">
      <div className="w-full px-4 py-8 flex lg:flex-row flex-col gap-8">
        <AccountSidebar />

        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-2xl font-black text-foreground">My Orders</h1>
            <p className="text-sm text-muted-foreground">Track and manage your recent purchases.</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-20">
              <Loader2 className="animate-spin text-primary-yellow mb-4" size={32} />
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-20 bg-muted/20 rounded-2xl border border-dashed">
              <Package className="mx-auto text-muted-foreground mb-4" size={48} />
              <p className="mb-6 text-muted-foreground">No orders yet.</p>
              <Link href="/" className="bg-primary-yellow text-black px-6 py-2 rounded-lg font-bold">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => {
                const statusUI = getStatusUI(order.status);
                const firstItem = order.items[0];

                return (
                  <div key={order.id} className="bg-card border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-5 flex flex-wrap items-center justify-between gap-4">
                      <div className="flex  gap-4">
                        {/* Order Thumbnail */}
                        <div className="relative h-16 w-16 flex-shrink-0 bg-muted rounded-lg overflow-hidden border">
                          {firstItem?.product_image ? (
                            <Image 
                              src={firstItem.product_image} 
                              alt="Product" 
                              className="h-full w-full object-cover" 
                              width ={16}
                              height = {16}
                              unoptimized={true}
                            />
                          ) : (
                            <Package className="h-full w-full p-4 text-muted-foreground" />
                          )}

                        </div>

                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-muted-foreground leading-none">
                            Order ID: #{order.id}
                          </p>
                          <h3 className="font-bold text-sm truncate max-w-[180px]">
                         
                           {firstItem?.product_name || "Order Item"}
                           
                          </h3>
                          <p className="text-xs font-bold text-muted-foreground">
                           {order.items.length > 1 && ` +${order.items.length - 1} more`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate (order.created_at)}
                          </p>
                          
                        </div>
                      </div>


                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${statusUI.color}`}>
                        {statusUI.icon} {statusUI.label}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-black text-foreground">
                            {formatCurrency(order.total_amount)}
                          </p>
                          <p className="text-[10px] uppercase font-bold opacity-60">{order.delivery_method} Delivery</p>
                        </div>
                        <Link href={`/customer/account/orders/${order.id}`} className="p-2 border rounded-full">
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;