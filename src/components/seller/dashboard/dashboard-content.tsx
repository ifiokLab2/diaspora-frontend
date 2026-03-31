
'use client'

import { useState, useEffect, useCallback } from 'react'
import { Sidebar } from '@/components/seller/dashboard/sidebar'
import { DashboardHeader } from '@/components/seller/dashboard/header'
import { MetricCard } from '@/components/seller/dashboard/metric-card'
import { SalesAnalytics } from '@/components/seller/dashboard/sales-analytics'
import { QuickActions } from '@/components/seller/dashboard/quick-actions'
import { OrdersTable } from '@/components/seller/dashboard/orders-table'
import { AddProductModal } from '@/components/seller/dashboard/add-product-modal'
import { DollarSign, ShoppingBag, Package, Truck, Loader2 } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import { getImageUrl, formatCurrency, getDistanceInMiles } from '@/lib/utils';
import Footer  from '@/components/seller/dashboard/footer'



export default function DashboardContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('weekly')
  
  const [stats, setStats] = useState({
    total_balance: "0",
    payout_balance: "0", // Added for QuickActions
    payment_method: null, // Added for QuickActions
    today_sales: "0",
    new_orders: "0",
    pending_shipment: "0",
    revenue_trend: "0%",
    trend_positive: true,
    chart_data: [],
    recent_orders: []
  })

  const fetchDashboardData = useCallback(async (selectedPeriod: string) => {
    try {
      const response = await api.get(`/seller/dashboard/?period=${selectedPeriod}`)
      //console.log('response.data:',response.data)
      setStats(response.data)
    } catch (error) {
      toast.error("Failed to load dashboard statistics")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboardData(period)
  }, [period, fetchDashboardData])

  const handleAddProduct = async (product: any) => {
    try {
      await api.post('/products/', product)
      toast.success('Product added successfully')
      setShowAddProductModal(false)
      fetchDashboardData(period)
    } catch (error) {
      toast.error('Failed to add product')
    }
  }

  // Logic for the Withdraw Button in QuickActions
  
  const handleWithdrawRequest = async (amount: number, methodId: number) => {
    setWithdrawLoading(true);
    try {
      // Send both amount and payment_method_id to the backend
      await api.post('/seller/withdraw/', { 
        amount: amount,
        payment_method_id: methodId 
      });

      toast.success(`Request for £${amount} submitted!`);
      
      // REFRESH DATA: This is what updates your Metric Cards and Balance
      await fetchDashboardData(period); 
      
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to submit request';
      toast.error(errorMsg);
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
  }
  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onAddProduct={() => setShowAddProductModal(true)}
      />
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSubmit={handleAddProduct}
      />

      {/* Main Content */}
      <main className="ml-0 md:ml-44 mt-20 pb-8 flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 md:px-8">
          
          {/* Metric Cards - Linked to Live Data */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              icon={DollarSign}
              label="Total Balance"
              value={`£${stats.total_balance}`}
              subtitle="vs last month"
              trend={stats.revenue_trend}
              trendPositive={stats.trend_positive}
              iconColor="text-accent"
            />
            <MetricCard
              icon={ShoppingBag}
              label="Today's Sale"
              value={`£${stats.today_sales} `}
              subtitle="Daily target: 5k"
              iconColor="text-blue-400"
            />
            <MetricCard
              icon={Package}
              label="New Orders"
              value={stats.new_orders}
              subtitle="Awaiting confirmation"
              iconColor="text-purple-400"
            />
            <MetricCard
              icon={Truck}
              label="Pending Shipment"
              value={stats.pending_shipment}
              subtitle="Ready for courier"
              iconColor="text-orange-400"
            />
          </div>

          {/* Sales Analytics and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              {/* Pass live chart data to the component */}
             <SalesAnalytics 
                data={stats.chart_data} 
                activePeriod={period}
                onPeriodChange={setPeriod}
              />
            </div>
            <div className="lg:col-span-1">
              

              <QuickActions 
                balance={stats.payout_balance}
                paymentMethod={stats.payment_method}
                onRequestWithdraw={(amount: number) => 
                  handleWithdrawRequest(amount, (stats.payment_method as any)?.id)
                }
                loading={withdrawLoading}
              />

            </div>
          </div>

          {/* Recent Orders - Pass the fetched orders to the table */}
          <div>
            <OrdersTable orders={stats.recent_orders} />
          </div>
        </div>

        {/* Footer */}
       <Footer />
      </main>
    </div>
  )
}