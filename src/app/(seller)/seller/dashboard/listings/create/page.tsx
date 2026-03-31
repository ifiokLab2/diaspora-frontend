'use client'
import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/seller/dashboard/sidebar'
import { DashboardHeader } from '@/components/seller/dashboard/header'
import { AddProductModal } from '@/components/seller/dashboard/add-product-modal'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, MapPin, Loader2, Plus, Info, Check, ChevronsUpDown, Search, X, Image as ImageIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import api from '@/lib/api'
import Footer  from '@/components/seller/dashboard/footer'
import { toast } from 'react-hot-toast'

export default function CreateListingPage(){
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
   const [editingProduct, setEditingProduct] = useState<any>(null)
  const router = useRouter()

  // Data Fetching State
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [cityResults, setCityResults] = useState<any[]>([])
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false)

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  const [gallery, setGallery] = useState<File[]>([])
  const [metadata, setMetadata] = useState<Record<string, string>>({})
  const [location, setLocation] = useState({ cityId: '', cityName: '', countryId: '' })

  useEffect(() => {
    api.get('/listings/categories/').then(res => setCategories(res.data))
  }, [])

  // Handle Main Image Preview
  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMainImage(file)
      setMainImagePreview(URL.createObjectURL(file))
    }
  }

  // Handle Gallery Previews
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      // Check for limit
      if (gallery.length + files.length > 5) {
        toast.error("You can only upload up to 5 gallery images")
        return
      }
      setGallery(prev => [...prev, ...files])
    }
  }

  const removeGalleryImage = (index: number) => {
    setGallery(prev => prev.filter((_, i) => i !== index))
  }

  const handleCitySearch = async (query: string) => {
    if (query.length < 2) return
    try {
      // Endpoint should return data from django-cities-light
      const res = await api.get(`/listings/locations/cities/?q=${query}`)
      setCityResults(res.data)
    } catch (err) {
      console.error("City fetch error", err)
    }
  }

  

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!location.cityId) return toast.error("Please select a valid city from the dropdown")
    
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    // Add processed data
    formData.append('metadata', JSON.stringify(metadata))
    formData.append('city', location.cityId)
    formData.append('country', location.countryId)
    
    gallery.forEach((file) => {
      formData.append('gallery_images', file)
    })

    try {
      await api.post('/listings/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      toast.success('Listing created successfully!')
      router.push('/seller/dashboard/listings')
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Error creating listing')
    } finally {
      setLoading(false)
    }
  }

   const handleAddProductSuccess = () => {
    handleCloseModal()
    
  }
  const handleCloseModal = () => {
    setShowAddProductModal(false)
    setEditingProduct(null)
  }


  return (
    <div className="bg-background flex flex-col overflow-hidden">
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
        <div className="px-4 sm:px-6 md:px-8 max-w-4xl mx-auto py-10 px-4">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Create New Listing</CardTitle>
              <p className="text-muted-foreground text-sm">Post services or items to your specific category.</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Category Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Main Category</Label>
                    <Select onValueChange={(id) => setSelectedCategory(categories.find((c: any) => c.id === parseInt(id)))}>
                      <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((cat: any) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Sub-Category</Label>
                    <Select name="subcategory" disabled={!selectedCategory}>
                      <SelectTrigger><SelectValue placeholder="Select Sub-Category" /></SelectTrigger>
                      <SelectContent>
                        {selectedCategory?.subcategories.map((sub: any) => (
                          <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 2. Basic Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" placeholder="e.g. Professional SEO Services" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" placeholder="Describe what you are offering..." required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Pricing Model</Label>
                      <Select name="pricing_model" defaultValue="fixed">
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">Fixed Price</SelectItem>
                          <SelectItem value="hourly">Hourly/Rate</SelectItem>
                          <SelectItem value="negotiable">Negotiable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label>Price (GBP)</Label>
                      <Input name="price" type="number" step="0.01" placeholder="0.00" required />
                    </div>
                  </div>
                </div>

                {/* 3. Media Upload with Previews */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Main Image Upload */}
                    <div className="space-y-2">
                      <Label>Main Cover Image</Label>
                      <div className={`relative border-2 border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center transition-colors ${mainImagePreview ? 'bg-secondary/5' : 'hover:bg-secondary/20'}`}>
                        <Input type="file" name="main_image" accept="image/*" className="hidden" id="main_image" required={!mainImage} onChange={handleMainImageChange} />
                        
                        {mainImagePreview ? (
                          <div className="relative w-full aspect-video">
                            <img src={mainImagePreview} alt="Preview" className="w-full h-full object-cover rounded-md" />
                            <button type="button" onClick={() => {setMainImage(null); setMainImagePreview(null)}} className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full shadow-lg">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label htmlFor="main_image" className="cursor-pointer flex flex-col items-center py-4">
                            <Camera className="w-8 h-8 text-accent mb-2" />
                            <span className="text-xs">Click to upload cover photo</span>
                          </label>
                        )}
                      </div>
                    </div>

                    {/* Gallery Images Upload */}
                    <div className="space-y-2">
                      <Label>Gallery Photos ({gallery.length}/5)</Label>
                      <div className="border-2 border-dashed border-border rounded-lg p-4 min-h-[110px] flex flex-col items-center justify-center">
                        <Input type="file" multiple accept="image/*" className="hidden" id="gallery" onChange={handleGalleryChange} disabled={gallery.length >= 5} />
                        <label htmlFor="gallery" className={`cursor-pointer flex flex-col items-center text-center ${gallery.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''}`}>
                          <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                          <span className="text-xs">Add more photos</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Gallery Preview Grid */}
                  {gallery.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-4">
                      {gallery.map((file, index) => (
                        <div key={index} className="relative aspect-square border rounded-md overflow-hidden bg-secondary/10">
                          <img src={URL.createObjectURL(file)} alt="Gallery preview" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeGalleryImage(index)} className="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 4. Location Details */}
                <div className="space-y-4 pt-4 border-t border-border/50">
                  <Label className="flex items-center gap-2 font-semibold">
                    <MapPin className="w-4 h-4 text-red-500" /> Location Details
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Search City</Label>
                      <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                        <PopoverTrigger asChild>
                          <Button variant="outline" role="combobox" className="w-full justify-between bg-secondary/10">
                            {location.cityName || "Select city..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Type city name..." onValueChange={handleCitySearch} />
                            <CommandList>
                              <CommandGroup>
                                {cityResults.map((city) => (
                                  <CommandItem
                                    key={city.id}
                                    onSelect={() => {
                                      setLocation({ cityId: city.id, cityName: city.name, countryId: city.country_id })
                                      setCityPopoverOpen(false)
                                    }}
                                  >
                                    <Search className="mr-2 h-4 w-4" />
                                    {city.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Street Address</Label>
                      <Input name="address" placeholder="e.g. 12 Plot B, Close 4" />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full bg-accent hover:bg-accent/90 py-6 font-bold" disabled={loading}>
                  {loading ? <Loader2 className="animate-spin mr-2" /> : "Publish Listing"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
       
       

       {/* Footer */}
       <Footer />
      </main>
    </div>
  )
}