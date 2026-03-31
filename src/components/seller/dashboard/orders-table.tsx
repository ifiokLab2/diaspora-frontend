'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, Printer, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { getImageUrl, formatCurrency, getDistanceInMiles } from '@/lib/utils';
import Image from "next/image";
const statusMap: Record<string, string> = {
  pending: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  paid: 'bg-green-500/15 text-green-400 border-green-500/20',
  delivered: 'bg-green-500/15 text-green-400 border-green-500/20',
  shipped: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  cancelled: 'bg-red-500/15 text-red-400 border-red-500/20',
}


interface Order {
  row_id: number    
  id: string        
  product: string
  main_image: string   // ADD THIS LINE
  customer: string
  date: string
  amount: string
  status_key: string
  status_display: string
}

interface OrdersTableProps {
  orders: Order[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  return (
    <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
      <div className="p-4 md:p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-base md:text-lg font-semibold text-foreground">Recent Orders</h2>
        {/*<div className="flex gap-2 sm:gap-3 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer text-xs h-8 px-2 sm:px-3 border-border hover:bg-secondary/50 text-foreground gap-1"
          >
            <span> View All Orders</span>
           
          </Button>
          
        </div>*/}
      </div>

      {/* Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-secondary/30">
              {/*<th className="px-3 md:px-6 py-3 text-left">
                <input type="checkbox" className="w-4 h-4 cursor-pointer" />
              </th>*/}
              <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Order ID
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Product
              </th>
              <th className="hidden sm:table-cell px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Customer
              </th>
              <th className="hidden lg:table-cell px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Date
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Amount
              </th>
              <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Status
              </th>
             {/* <th className="hidden md:table-cell px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Actions
              </th>*/}
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.row_id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                 {/* <td className="px-6 py-4"><input type="checkbox" className="w-4 h-4 cursor-pointer accent-accent" /></td>*/}
                  <td className="px-6 py-4 font-medium text-sm">{order.id}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-accent/10 rounded flex items-center justify-center">
                         <Image width = {18} height = {18}
                          src={getImageUrl(order.main_image)} alt={order.product}
                           className=" object-cover bg-secondary"
                            
                           />
                      </div>
                      <span className="truncate max-w-[150px]">{order.product}</span>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell px-6 py-4 text-sm text-muted-foreground">{order.customer}</td>
                  <td className="hidden lg:table-cell px-6 py-4 text-sm text-muted-foreground">{order.date}</td>
                  <td className="px-6 py-4 font-medium text-sm">£{order.amount}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={`text-[10px] font-medium px-2.5 py-0.5 rounded-full border ${statusMap[order.status_key] || 'bg-gray-500/10 text-gray-400'}`}>
                      {order.status_display}
                    </Badge>
                  </td>
                 {/* <td className="hidden md:table-cell px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-4 h-4" /></button>
                      <button className="p-1.5 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-colors"><Printer className="w-4 h-4" /></button>
                    </div>
                  </td>*/}
                </tr>
              ))
            ) : (
              <tr><td colSpan={8} className="px-6 py-12 text-center text-muted-foreground text-sm">No recent orders found.</td></tr>
            )}
         
          </tbody>
        </table>
      </div>

      {/* Pagination */}
     
    </div>
  )
}
