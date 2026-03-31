'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/seller/dashboard/sidebar'
import { DashboardHeader } from '@/components/seller/dashboard/header'
import { AddProductModal } from '@/components/seller/dashboard/add-product-modal'
import { DeleteConfirmationModal } from '@/components/seller/dashboard/delete-modal'
import { Button } from '@/components/ui/button'
import { Search, Edit2, Trash2, Eye, Loader2, Package } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { formatCurrency, getDistanceInMiles } from '@/lib/utils';
import Footer  from '@/components/seller/dashboard/footer'
import Link from 'next/link';


const getImageUrl = (url: string | null) => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}`;
};

interface Product {
  id: number;
  name: string;
  slug: string;
  category_name?: string;
  price: string | number;
  main_image: string | null;
  city_name?: string;
  country_name?: string;
  available: boolean;
  [key: string]: any; // Catch-all for other fields
}

export default function ProductsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  //const [products, setProducts] = useState([])
  const [products, setProducts] = useState<Product[]>([]) // No longer 'never[]'
  const [loading, setLoading] = useState(true)
  //const [searchQuery, setSearchQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<any>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  
  // NEW: State to track the product currently being edited
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
   const [searchQuery, setSearchQuery] = useState('')
   const PAGE_SIZE = 5 // Match this with your Django REST_FRAMEWORK settings

  const fetchProducts = async (page: number) => {
    setLoading(true)
    try {
      const res = await api.get(`/products-manage/?page=${page}&search=${searchQuery}`)
      console.log('res.data:',res.data)
      setProducts(res.data.results)

      setTotalCount(res.data.count)
      setTotalPages(Math.ceil(res.data.count / PAGE_SIZE))
    } catch (err) {
      console.log('err:',err)
      toast.error("Failed to load inventory")
    } finally {
      setLoading(false)
    }
  }

 

  const openDeleteModal = (product: any) => {
    setProductToDelete(product)
    setDeleteModalOpen(true)
  }

  // Actual API Call
  const handleConfirmDelete = async () => {
    if (!productToDelete) return
    
    setDeleteLoading(true)
    try {
      await api.delete(`/products-manage/`, { params: { id: productToDelete.id } })
      toast.success("Product removed from inventory")
      fetchProducts(currentPage) // Refresh list
      setDeleteModalOpen(false)
    } catch (err) {
      toast.error("Could not delete product")
    } finally {
      setDeleteLoading(false)
      setProductToDelete(null)
    }
  }

  // NEW: Handle Delete
  const handleDelete = async (productId: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      // Sending ID in params or body depending on your Django setup
      await api.delete(`/products-manage/`, { params: { id: productId } })
      toast.success("Product deleted successfully")
      fetchProducts(currentPage) // Refresh list
    } catch (err) {
      toast.error("Could not delete product")
    }
  }

  // NEW: Open modal in Edit Mode
  const handleEditClick = (product: any) => {
    setEditingProduct(product)
    setShowAddProductModal(true)
  }

  // NEW: Reset state when closing modal
  const handleCloseModal = () => {
    setShowAddProductModal(false)
    setEditingProduct(null)
  }

  const handleAddProductSuccess = () => {
    handleCloseModal()
    fetchProducts(currentPage)
  }
  // Fetch data from Django
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts(currentPage)
    }, 300) // Debounce search to prevent excessive API calls

    return () => clearTimeout(delayDebounce)
  }, [currentPage, searchQuery])

  // Reset to page 1 when searching
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  
  
  


  

  
 
  const filteredProducts = products.filter(product => 
    (product.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (product.category_name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
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
      <DeleteConfirmationModal 
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
        itemName={productToDelete?.name || ''}
      />

      <main className="ml-0 md:ml-44 mt-20 pb-8 flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 md:px-8">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Products</h1>
              <p className="text-sm text-muted-foreground">Manage your product inventory</p>
            </div>
           
          </div>

          <div className="mb-6 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-card border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
            <div className="overflow-x-auto w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                   {/* <th className="px-3 md:px-6 py-3 text-left w-10"><input type="checkbox" className="w-4 h-4" /></th>*/}
                    <th className="px-3 md:px-6 py-3 text-left">Product</th>
                    <th className="hidden lg:table-cell px-3 md:px-6 py-3 text-left">Category</th>
                    <th className="px-3 md:px-6 py-3 text-left">Price</th>
                    <th className="hidden md:table-cell px-3 md:px-6 py-3 text-left">Location</th>
                    <th className="px-3 md:px-6 py-3 text-left">Status</th>
                    <th className="px-3 md:px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
                      </td>
                    </tr>
                  ) : filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-muted-foreground">
                        No products found.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product: Product) => (
                      <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                        {/*<td className="px-3 md:px-6 py-4"><input type="checkbox" className="w-4 h-4" /></td>*/}
                        <td className="px-3 md:px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10 rounded bg-secondary border border-border overflow-hidden">
                              {product.main_image ? (
                                <Image 
                                  src={getImageUrl(product.main_image)} 
                                  alt={product.name} 
                                  fill 
                                  className="object-cover"
                                  loading="lazy"
                                 
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">
                                  <Package className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{product.name}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">ID: {product.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-3 md:px-6 py-4 text-sm">
                          {product.category_name}
                        </td>
                        <td className="px-3 md:px-6 py-4 text-sm font-semibold">
                          ${product.price}
                        </td>
                        <td className="hidden md:table-cell px-3 md:px-6 py-4 text-xs text-muted-foreground">
                          {product.city_name}, {product.country_name}
                        </td>
                        <td className="px-3 md:px-6 py-4">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase border ${
                            product.available 
                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                            : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                            {product.available ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 md:px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href = {`/product-detail/${product.slug}/`} className="p-1.5 hover:bg-secondary rounded transition-colors">
                                <Eye className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </Link>
                            
                            {/* NEW: Edit Button */}
                            <button 
                                onClick={() => handleEditClick(product)}
                                className="p-1.5 hover:bg-secondary rounded transition-colors"
                            >
                                <Edit2 className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                            </button>
                            
                            {/* NEW: Delete Button */}
                            <button 
                                onClick={() => openDeleteModal(product)} 
                                className="p-1.5 hover:bg-secondary rounded transition-colors group"
                              >
                                <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-500" />
                              </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

             {/* Pagination UI remains as per your original design */}
            <div className="px-4 md:px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground order-2 sm:order-1">
               Showing {products.length} of {totalCount} products
              </p>
             <div className="flex items-center gap-2 order-1 sm:order-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 w-8 p-0 border-border"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1 || loading}
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
                  disabled={currentPage === totalPages || loading}
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