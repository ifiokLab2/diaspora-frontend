'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/seller/dashboard/sidebar'
import { DashboardHeader } from '@/components/seller/dashboard/header'
import { AddProductModal } from '@/components/seller/dashboard/add-product-modal'
import { Button } from '@/components/ui/button'
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, ShoppingCart, DollarSign, Loader2 } from 'lucide-react'
import api from '@/lib/api' // Your axios instance
import Footer  from '@/components/seller/dashboard/footer'
const COLORS = ['#CBFF00', '#60A5FA', '#A78BFA', '#F87171', '#34D399']
import { toast } from 'react-hot-toast'


// --- 1. DEFINE YOUR TYPES ---
interface Metric {
  label: string
  value: string | number
  change: string
  positive: boolean
}

interface AnalyticsData {
  metrics: Metric[]
  salesTrend: any[]
  categoryBreakdown: any[]
  topProducts: Array<{
    name: string
    sales: number
    revenue: number
  }>
}
export default function AnalyticsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
   const [editingProduct, setEditingProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/seller/analytics/')
        setData(response.data)
      } catch (error) {
        console.error('Failed to fetch analytics', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

 const handleAddProductSuccess = () => {
    handleCloseModal()
    
  }
  const handleCloseModal = () => {
    setShowAddProductModal(false)
    setEditingProduct(null)
  }

  if (isLoading || !data) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  )

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onAddProduct={() => setShowAddProductModal(true)}
      />
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={handleCloseModal}
        onSubmit={handleAddProductSuccess} 
        editData={editingProduct} // Pass the product data here
      />
      

      {/* Main Content */}
      <main className="ml-0 md:ml-44 mt-20 pb-8 flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-bold text-foreground mb-8">Analytics</h1>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {data.metrics.map((metric, index) => {
              const Icon = index === 0 ? DollarSign : index === 1 ? ShoppingCart : index === 2 ? Users : TrendingUp
              return (
                <div key={index} className="bg-card border border-border/50 rounded-lg p-4 md:p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">{metric.label}</p>
                      <h3 className="text-xl md:text-2xl font-bold text-foreground">{metric.value}</h3>
                    </div>
                    <div className="p-2 bg-secondary/50 rounded-lg text-accent">
                      <Icon className="w-4 h-4 md:w-5 md:h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs font-medium ${metric.positive ? 'text-accent' : 'text-red-500'}`}>
                      {metric.change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Sales Trend Chart */}
            <div className="bg-card border border-border/50 rounded-lg p-4 md:p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Sales Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid rgba(255,255,255,0.2)' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="sales" stroke="#CBFF00" strokeWidth={2} dot={{ fill: '#CBFF00', r: 4 }} />
                  <Line type="monotone" dataKey="revenue" stroke="#60A5FA" strokeWidth={2} dot={{ fill: '#60A5FA', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Category Breakdown Chart */}
            <div className="bg-card border border-border/50 rounded-lg p-4 md:p-6">
              <h2 className="text-lg font-semibold text-foreground mb-6">Category Breakdown</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    
                   
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border/50">
              <h2 className="text-lg font-semibold text-foreground">Top Products</h2>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Product Name
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Sales
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.map((product, index) => (
                    <tr key={index} className="border-b border-border hover:bg-secondary/20 transition-colors">
                      <td className="px-4 md:px-6 py-4">
                        <span className="text-xs md:text-sm text-foreground">{product.name}</span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className="text-xs md:text-sm font-medium text-foreground">{product.sales}</span>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <span className="text-xs md:text-sm font-medium text-foreground">£{product.revenue}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
       <Footer />
      </main>
    </div>
  )
}
