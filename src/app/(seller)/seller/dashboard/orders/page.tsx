'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/seller/dashboard/sidebar'
import { DashboardHeader } from '@/components/seller/dashboard/header'
import { AddProductModal } from '@/components/seller/dashboard/add-product-modal'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, Eye, Printer, Download, Filter, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import api from '@/lib/api' // Replace with your axios instance path
import Footer  from '@/components/seller/dashboard/footer'
// Interface matching your Django Serializer output
interface OrderItem {
  id: number
  order_id: number
  product_name: string
  customer_name: string
  customer_email: string
  price: string
  quantity: number
  line_total: string
  status: 'pending' | 'paid' | 'shipped' | 'cancelled'
  delivery_method: 'door' | 'pickup'
  created_at: string
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-orange-500/15 text-orange-400 border-orange-500/20'
    case 'paid':
      return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
    case 'delivered':
      return 'bg-green-500/15 text-green-400 border-green-500/20'
    case 'shipped':
      return 'bg-green-500/15 text-green-400 border-green-500/20'
    case 'cancelled':
      return 'bg-red-500/15 text-red-400 border-red-500/20'
    default:
      return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
  }
}

export default function OrdersPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [editingProduct, setEditingProduct] = useState<any>(null)
  
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)

  const PAGE_SIZE = 5 // Match this with your Django REST_FRAMEWORK settings

  const fetchOrders = async (page: number) => {
    try {
      setIsLoading(true)
      // DRF uses ?page=2 or ?offset=10. Assuming PageNumberPagination here:
      const response = await api.get(`/seller/orders/?page=${page}&search=${searchQuery}`)
      
      // If using DRF Pagination, the structure is usually:
      // { count: 100, results: [...] }
      setOrderItems(response.data.results)
      setTotalCount(response.data.count)
      setTotalPages(Math.ceil(response.data.count / PAGE_SIZE))
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch data from Django
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchOrders(currentPage)
    }, 300) // Debounce search to prevent excessive API calls

    return () => clearTimeout(delayDebounce)
  }, [currentPage, searchQuery])

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  
  const handleCloseModal = () => {
    setShowAddProductModal(false)
    setEditingProduct(null)
  }
  const handleAddProductSuccess = () => {
    handleCloseModal()
    //fetchProducts()
  }
   const handleAddProduct = async (product: any) => {
    try {
      await api.post('/products/', product)
      toast.success('Product added successfully')
      setShowAddProductModal(false)
      //fetchDashboardData(period)
    } catch (error) {
      toast.error('Failed to add product')
    }
  }


  const filteredOrders = orderItems.filter(item =>
    item.order_id.toString().includes(searchQuery) ||
    item.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.product_name.toLowerCase().includes(searchQuery.toLowerCase())
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
     

      <main className="ml-0 md:ml-44 mt-20 pb-8 flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 md:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Orders</h2>
            <p className="text-sm text-muted-foreground">Manage and track your product sales</p>
          </div>

          {/* Search and Filters */}
          <div className="bg-card border border-border/50 rounded-lg p-4 md:p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative w-full ">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search order ID, customer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                {/*<Button variant="outline" size="sm" className="text-xs h-9 px-3 border-border hover:bg-secondary/50 text-foreground gap-1 flex-1 sm:flex-none">
                  <Filter className="w-4 h-4" />
                  <span className="hidden sm:inline">Filter</span>
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-9 px-3 border-border hover:bg-secondary/50 text-foreground gap-1 flex-1 sm:flex-none">
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </Button>*/}
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border/50 flex items-center justify-between">
              <h3 className="text-base md:text-lg font-semibold text-foreground">All Orders</h3>
              <p className="text-xs text-muted-foreground">{filteredOrders.length} line items</p>
            </div>

            <div className="overflow-x-auto w-full">
              {isLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/30">
                      
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Order ID</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Product / Customer</th>
                      <th className="hidden sm:table-cell px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Method</th>
                      <th className="hidden lg:table-cell px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Amount</th>
                      <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
                     {/* <th className="hidden md:table-cell px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">Actions</th>*/}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((item) => (
                      <tr key={item.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                        
                        <td className="px-3 md:px-6 py-4">
                          <span className="text-xs md:text-sm font-medium text-foreground">#ORD-{item.order_id}</span>
                        </td>
                        <td className="px-3 md:px-6 py-4">
                          <div>
                            <p className="text-xs md:text-sm font-medium text-foreground truncate max-w-[150px]">{item.product_name}</p>
                            <p className="text-[10px] text-muted-foreground">{item.customer_name} • {item.quantity} pc(s)</p>
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-3 md:px-6 py-4">
                          <span className="text-xs text-muted-foreground capitalize">{item.delivery_method}</span>
                        </td>
                        <td className="hidden lg:table-cell px-3 md:px-6 py-4">
                          <span className="text-xs text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-4">
                          <span className="text-xs md:text-sm font-medium text-foreground">£{item.line_total}</span>
                        </td>
                        <td className="px-3 md:px-6 py-4">
                          <Badge variant="outline" className={`text-[10px] px-2 py-0.5 rounded-full capitalize ${getStatusColor(item.status)}`}>
                            {item.status}
                          </Badge>
                        </td>
                      {/*  <td className="hidden md:table-cell px-3 md:px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 hover:bg-secondary rounded transition-colors">
                              <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </button>
                            <button className="p-1.5 hover:bg-secondary rounded transition-colors">
                              <Printer className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </button>
                          </div>
                        </td>*/}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            
            {/* Pagination UI remains as per your original design */}
            <div className="px-4 md:px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground order-2 sm:order-1">
               Showing {orderItems.length} of {totalCount} orders
              </p>
             <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0 border-border"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || isLoading}
                >
                  {'<'}
                </Button>

                {/* Optional: Simple page indicator */}
                <div className="flex items-center gap-1">
                  <Button 
                    size="sm" 
                    className="h-8 w-8 p-0 bg-accent text-accent-foreground"
                  >
                    {currentPage}
                  </Button>
                  {totalPages > 1 && (
                    <span className="text-xs text-muted-foreground px-2">
                      of {totalPages}
                    </span>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0 border-border"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages || isLoading}
                >
                  {'>'}
                </Button>
              </div>
            </div>
          </div>
        </div>
         {/* Footer */}
       <Footer />
      </main>
    </div>
  )
}