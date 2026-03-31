'use client'
import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/seller/dashboard/sidebar'
import { DashboardHeader } from '@/components/seller/dashboard/header'
import { useRouter } from 'next/navigation'
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts'
import { 
  Plus, Users, Package, CheckCircle, Search, MoreVertical, 
  Loader2, AlertCircle, MapPin, Eye, Pencil, Trash2, ChevronLeft, ChevronRight 
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { DeleteListingModal } from '@/components/seller/dashboard/listing-delete-modal'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import Image from "next/image";
import Footer  from '@/components/seller/dashboard/footer'
import { formatCurrency, getDistanceInMiles } from '@/lib/utils';



const getImageUrl = (url: string | null) => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}`;
};

export default function DashboardListingsPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Data States
  const [listings, setListings] = useState<any[]>([])
  const [analytics, setAnalytics] = useState<any>({ stats: {}, chart_data: [] })
  
  // Pagination & Loading States
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal States
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [targetListing, setTargetListing] = useState<{slug: string, title: string} | null>(null)

  const ITEMS_PER_PAGE = 10

  // Fetch Analytics (Only on mount)
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/listings/dashboard-analytics/')
        setAnalytics(res.data)
      } catch (err) {
        console.error("Failed to load analytics")
      }
    }
    fetchAnalytics()
  }, [])

  // Fetch Paginated Listings (Runs on page change)
  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true)
      try {
        const res = await api.get(`/listings/?page=${currentPage}&page_size=${ITEMS_PER_PAGE}`)
        setListings(res.data.results)
        setTotalPages(res.data.total_pages)
        setTotalItems(res.data.total_items)
      } catch (err) {
        toast.error("Failed to load inventory")
      } finally {
        setLoading(false)
      }
    }
    fetchListings()
  }, [currentPage])

  // Delete Handler
  const handleDelete = async () => {
    if (!targetListing) return
    setIsDeleting(true)
    try {
      await api.delete(`/listings/${targetListing.slug}/`)
      toast.success("Listing deleted")
      // Refresh current page
      window.location.reload() 
    } catch (err) {
      toast.error("Delete failed")
    } finally {
      setIsDeleting(false)
      setIsDeleteModalOpen(false)
    }
  }

   const filteredListings = listings.filter(listing => 
    listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.subcategory_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="bg-background min-h-screen flex flex-col overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      {/* Delete Confirmation Modal */}
      <DeleteListingModal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        listingTitle={targetListing?.title || ""}
        loading={isDeleting}
      />

      <main className="ml-0 md:ml-44 mt-20 flex-1 overflow-y-auto pb-10">
        <div className="px-4 sm:px-6 md:px-8 max-w-7xl mx-auto py-6 space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black tracking-tight">Listings Hub</h1>
              <p className="text-muted-foreground text-sm">Monitor your listings and performance metrics.</p>
            </div>
            <Button onClick={() => router.push('/dashboard/listings/create')} className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium gap-2 text-xs md:text-sm px-2 md:px-4">
              <Plus className="w-4 h-4 mr-2" /> Post New Listing
            </Button>
          </div>

          {/* 1. Stat Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard title="Total Views" val={analytics.stats.total_views} icon={<Users className="text-blue-500" />} />
            <StatCard title="Live Items" val={analytics.stats.active_count} icon={<CheckCircle className="text-emerald-500" />} />
            <StatCard title="Inventory" val={analytics.stats.total_listings} icon={<Package className="text-orange-500" />} />
          </div>

          {/* 2. Traffic Chart */}
          
          <Card className="bg-card border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="border-b border-border/5">
              <CardTitle className="text-base font-bold">Store Traffic (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] pt-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.chart_data}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: 'hsl(var(--muted-foreground))'}} />
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }} />
                  <Area type="monotone" dataKey="views" stroke="hsl(var(--accent))" fillOpacity={1} fill="url(#chartGradient)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 3. Inventory Table */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="font-bold w-32">Recent Listings</h3>
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search your items..." className="pl-9 bg-secondary/10 border-none" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
              </div>
            </div>

            {loading ? (
              <div className="p-20 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-accent mb-2" /><p className="text-sm text-muted-foreground">Syncing inventory...</p></div>
            ) : filteredListings.length > 0 ? (
              <>
                <Table>
                  <TableHeader className="bg-secondary/5 text-[10px] uppercase tracking-widest">
                    <TableRow>
                      <TableHead>Listing</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredListings.map((item) => (
                      <TableRow key={item.id} className="hover:bg-secondary/5 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Image src={getImageUrl(item.main_image)} alt="main_image"  width = {10} height = {10} className="w-10 h-10 rounded-lg object-cover bg-secondary" />
                            <div className="flex flex-col">
                              <span className="font-bold text-sm line-clamp-1">{item.title}</span>
                              <div className="flex items-center text-[10px] text-muted-foreground italic"><MapPin className="w-2 h-2 mr-1" /> {item.city}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-sm text-foreground/90">{formatCurrency(item.price)}</TableCell>
                        <TableCell>
                          <Badge className={item.is_active ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-none" : "bg-zinc-500/10 text-zinc-500 border-none"}>
                            {item.is_active ? "Live" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="w-4 h-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-44">
                              <DropdownMenuItem onClick={() => router.push(`/listings/${item.slug}`)}><Eye className="w-4 h-4 mr-2" /> Preview</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => router.push(`/seller/dashboard/listings/edit/${item.slug}`)}><Pencil className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-destructive focus:bg-destructive/10"
                                onClick={() => { setTargetListing({slug: item.slug, title: item.title}); setIsDeleteModalOpen(true); }}
                              >
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Listing
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination UI */}
                <div className="px-4 md:px-6 py-4 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="text-foreground font-bold">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="text-foreground font-bold">{Math.min(currentPage * ITEMS_PER_PAGE, totalItems)}</span> of {totalItems} items
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(p => Math.max(p - 1, 1))} disabled={currentPage === 1}><ChevronLeft className="w-4 h-4" /></Button>
                    <div className="bg-accent text-accent-foreground h-8 w-8 flex items-center justify-center rounded text-xs font-bold">{currentPage}</div>
                    <span className="text-[10px] text-muted-foreground uppercase font-bold px-1">of {totalPages}</span>
                    <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}><ChevronRight className="w-4 h-4" /></Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-20 flex flex-col items-center justify-center text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground/20 mb-4" />
                <h3 className="font-bold text-lg">No Items Found</h3>
                <p className="text-muted-foreground text-sm max-w-[250px] mb-6">You haven't posted any listings yet. Start selling today!</p>
                <Button onClick={() => router.push('/seller/dashboard/listings/create')}>Create Listing</Button>
              </div>
            )}
          </Card>
        </div>
         {/* Footer */}
       <Footer />
      </main>
    </div>
  )
}

function StatCard({ title, val, icon }: any) {
  return (
    <Card className="border-border/50 bg-card/40 backdrop-blur-sm">
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
          <p className="text-3xl font-black">{val || 0}</p>
        </div>
        <div className="h-12 w-12 bg-secondary/20 rounded-2xl flex items-center justify-center">{icon}</div>
      </CardContent>
    </Card>
  )
}