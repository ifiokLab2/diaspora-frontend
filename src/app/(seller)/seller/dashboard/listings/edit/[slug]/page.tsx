'use client'
import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/seller/dashboard/sidebar'
import { DashboardHeader } from '@/components/seller/dashboard/header'
import { AddProductModal } from '@/components/seller/dashboard/add-product-modal'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, MapPin, Loader2, Plus, Search, X, ChevronsUpDown, ArrowLeft, Save, Trash2, Image as ImageIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from '@/components/ui/badge'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import Image from "next/image";
import Footer  from '@/components/seller/dashboard/footer'
const getImageUrl = (url: string | null) => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}`;
};

export default function EditListingPage() {
  const { slug } = useParams()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)

  // Data Fetching State
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [categories, setCategories] = useState([])
  const [cityResults, setCityResults] = useState<any[]>([])
  const [cityPopoverOpen, setCityPopoverOpen] = useState(false)

  // Form State
  const [initialData, setInitialData] = useState<any>(null)
  const [selectedCategory, setSelectedCategory] = useState<any>(null)
  const [mainImage, setMainImage] = useState<File | null>(null)
  const [mainImagePreview, setMainImagePreview] = useState<string | null>(null)
  
  // Gallery Logic
  const [gallery, setGallery] = useState<File[]>([]) // New files
  const [existingGallery, setExistingGallery] = useState<any[]>([]) // DB files
  const [deletingImageId, setDeletingImageId] = useState<number | null>(null)
  const [location, setLocation] = useState({ cityId: '', cityName: '', countryId: '' })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, listingRes] = await Promise.all([
          api.get('/listings/categories/'),
          api.get(`/listings/${slug}/`)
        ])
       
        const data = listingRes.data
       

        const listingData = listingRes.data
        const allCategories = catRes.data
      
        // 1. Find the category object that matches the listing's category ID
        const foundCat = allCategories.find((c: any) => c.id === listingData.category)
        
        // 2. Set categories list first
        setCategories(allCategories)
        
        // 3. IMPORTANT: Set the selected category object so subcategories are available
        setSelectedCategory(foundCat)
        
        // 4. Finally set initialData which triggers the UI to show up
        setInitialData(listingData)
       
        setMainImagePreview(data.main_image)
        setExistingGallery(data.additional_images || [])
        setLocation({ cityId: data.city, cityName: data.city_name || 'Selected City', countryId: '' })
        //const foundCat = catRes.data.find((c: any) => c.id === data.subcategory.category)
        //if (foundCat) setSelectedCategory(foundCat)

      } catch (err) {
        toast.error("Could not load listing")
        //router.push('/dashboard/listings')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setMainImage(file)
      setMainImagePreview(URL.createObjectURL(file))
    }
  }

  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      if (gallery.length + existingGallery.length + files.length > 5) {
        toast.error("Maximum 5 photos allowed")
        return
      }
      setGallery(prev => [...prev, ...files])
    }
  }

  const removeExistingImage = async (imageId: number) => {
    setDeletingImageId(imageId)
    try {
      await api.delete(`/listings/images/${imageId}/`)
      setExistingGallery(prev => prev.filter(img => img.id !== imageId))
      toast.success("Image removed")
    } catch (err) {
      toast.error("Failed to delete image")
    } finally {
      setDeletingImageId(null)
    }
  }

  const handleCitySearch = async (query: string) => {
    if (query.length < 2) return
    try {
      const res = await api.get(`/listings/locations/cities/?q=${query}`)
      setCityResults(res.data)
    } catch (err) { console.error(err) }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setUpdating(true)
    const formData = new FormData(e.currentTarget)
    if (mainImage) formData.append('main_image', mainImage)
    formData.append('city', location.cityId)
    gallery.forEach((file) => formData.append('additional_images', file))

    try {
       await api.patch(`/listings/${slug}/`, formData, { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        })
      //await api.patch(`/listings/${slug}/`, formData)
      toast.success('Updated successfully!')
      router.push('/seller/dashboard/listings')
    } catch (error: any) {
      toast.error('Update failed')
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>

  return (
    <div className="bg-background flex flex-col overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} onAddProduct={() => setShowAddProductModal(true)} />
      
      <main className="ml-0 md:ml-44 mt-20 pb-8 flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 md:px-8 max-w-4xl mx-auto py-10">
          
          <Button variant="ghost" onClick={() => router.back()} className="mb-6"><ArrowLeft className="w-4 h-4 mr-2" /> Back</Button>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader><CardTitle className="text-2xl font-bold">Edit Listing</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-8">
                
                {/* Categories */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Main Category */}
                  <div className="space-y-2">
                    <Label>Category</Label>
                    {initialData ? (
                      <Select 
                        key={`cat-${initialData.category}`} // Force re-render when data arrives
                        defaultValue={initialData.category.toString()} 
                        onValueChange={(id) => {
                          const cat = categories.find((c: any) => c.id === parseInt(id))
                          setSelectedCategory(cat)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-10 w-full animate-pulse bg-secondary rounded-md" /> // Loading skeleton
                    )}
                  </div>

                  {/* Sub-Category */}
                  <div className="space-y-2">
                    <Label>Sub-Category</Label>
                    {initialData && selectedCategory ? (
                      <Select 
                        key={`sub-${initialData.subcategory}-${selectedCategory.id}`} 
                        name="subcategory" 
                        defaultValue={initialData.subcategory.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Sub-category" />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedCategory.subcategories?.map((sub: any) => (
                            <SelectItem key={sub.id} value={sub.id.toString()}>
                              {sub.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <div className="h-10 w-full animate-pulse bg-secondary rounded-md" />
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-4">
                  <Label>Title</Label>
                  <Input name="title" defaultValue={initialData?.title} required />
                  <Label>Description</Label>
                  <Textarea name="description" defaultValue={initialData?.description} rows={4} required />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Price (£)</Label><Input name="price" type="number" defaultValue={initialData?.price} required /></div>
                    <div className="space-y-2"><Label>Pricing Model</Label>
                      <Select name="pricing_model" defaultValue={initialData?.pricing_model}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="fixed">Fixed</SelectItem><SelectItem value="negotiable">Negotiable</SelectItem></SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Advanced Gallery Management */}
                <div className="space-y-4">
                  <Label className="flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Media Assets</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    
                    {/* Main Image Edit */}
                    <div className="relative aspect-square border-2 border-dashed border-border rounded-xl overflow-hidden group">
                      <Image
                       src={getImageUrl(mainImagePreview)} 
                       className="w-full h-full object-cover"
                       alt = "main-image"
                        unoptimized={true}
                        fill 
                       />
                      <label htmlFor="main_img" className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Camera className="text-white w-6 h-6" />
                        <span className="text-[8px] text-white font-bold uppercase mt-1">Change Cover</span>
                      </label>
                      <Input type="file" id="main_img" className="hidden" onChange={handleMainImageChange} />
                    </div>

                    {/* Existing Gallery Photos */}
                    {existingGallery.map((img) => (
                      <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                        <Image
                         src={getImageUrl(img.image)} 
                         className="w-full h-full object-cover" 
                          unoptimized={true}
                          alt = "additional images"
                          fill
                        />
                        aaa{img.image}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button size="icon" variant="destructive" type="button" onClick={() => removeExistingImage(img.id)} disabled={deletingImageId === img.id} className="h-8 w-8 rounded-full">
                            {deletingImageId === img.id ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                        <Badge className="absolute top-1 left-1 text-[8px] bg-emerald-500">Saved</Badge>
                      </div>
                    ))}

                    {/* New Upload Previews */}
                    {gallery.map((file, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border-2 border-accent group">
                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setGallery(prev => prev.filter((_, i) => i !== idx))} className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full"><X className="w-3 h-3" /></button>
                        <Badge className="absolute bottom-1 left-1 text-[8px] bg-accent">New</Badge>
                      </div>
                    ))}

                    {/* Add More Trigger */}
                    {gallery.length + existingGallery.length < 5 && (
                      <label className="border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center aspect-square cursor-pointer hover:bg-secondary/20">
                        <Plus className="w-6 h-6 text-muted-foreground" />
                        <input type="file" multiple className="hidden" onChange={handleGalleryChange} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Popover open={cityPopoverOpen} onOpenChange={setCityPopoverOpen}>
                      <PopoverTrigger asChild><Button variant="outline" className="w-full justify-between">{location.cityName}</Button></PopoverTrigger>
                      <PopoverContent className="p-0"><Command><CommandInput onValueChange={handleCitySearch} /><CommandList><CommandGroup>{cityResults.map(c => (<CommandItem key={c.id} onSelect={() => { setLocation({ cityId: c.id, cityName: c.name, countryId: '' }); setCityPopoverOpen(false); }}>{c.name}</CommandItem>))}</CommandGroup></CommandList></Command></PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2"><Label>Street Address</Label><Input name="address" defaultValue={initialData?.address} /></div>
                </div>

                <Button type="submit" className="w-full bg-accent  hover:bg-accent/90 text-foreground py-6 text-lg font-bold" disabled={updating}>
                  {updating ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-5 w-5" />}
                  Save Listing Updates
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