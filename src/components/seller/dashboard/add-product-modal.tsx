'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { X, Upload, Loader2, AlertCircle, Camera, Plus, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { useRouter } from 'next/navigation';

interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  //onSubmit: () => void 
  onSubmit: (product: any) => void;
  editData?: any 
}

const getImageUrl = (url: string | null) => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${url}`;
};

export function AddProductModal({ isOpen, onClose, onSubmit, editData }: AddProductModalProps) {
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter();
  
  const [categories, setCategories] = useState([])
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discount_price: '',
    category: '',
    country: '',
    city: '',
    description: '',
  })
  
  // Main Image
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // NEW: Gallery Images
  const [galleryFiles, setGalleryFiles] = useState<File[]>([])
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([])

  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setFormData({
          name: editData.name || '',
          price: editData.price || '',
          discount_price: editData.discount_price || '',
          category: editData.category || '',
          country: editData.country || '',
          city: editData.city || '',
          description: editData.description || '',
        })
        setPreviewUrl(editData.main_image || null)
        // Load existing gallery images
        setGalleryPreviews(editData.images?.map((img: any) => img.image) || [])
        setGalleryFiles([]) // Reset new files list when opening edit
      } else {
        setFormData({ name: '', price: '', discount_price: '', category: '', country: '', city: '', description: '' })
        setPreviewUrl(null)
        setImageFile(null)
        setGalleryFiles([])
        setGalleryPreviews([])
      }
    }
  }, [isOpen, editData])

  


    const isDiscountInvalid = Boolean(
      formData.discount_price && 
      formData.price && 
      parseFloat(formData.discount_price) > parseFloat(formData.price)
    );

  useEffect(() => {
    if (isOpen) {
      api.get('/products-categories/').then(res => setCategories(res.data))
      api.get('/locations/').then(res => setCountries(res.data.countries))
    }
  }, [isOpen])

  useEffect(() => {
    if (formData.country) {
      api.get(`/locations/?country_id=${formData.country}`)
        .then(res => setCities(res.data.cities))
    }
  }, [formData.country])

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  // Handle Gallery Selection
  const handleGalleryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setGalleryFiles(prev => [...prev, ...files])
      const newPreviews = files.map(file => URL.createObjectURL(file))
      setGalleryPreviews(prev => [...prev, ...newPreviews])
    }
  }

  const removeGalleryImage = (index: number) => {
    // Note: In a production app, you might want to handle deleting 
    // existing images from the server via a separate API call.
    setGalleryFiles(prev => prev.filter((_, i) => i !== index))
    setGalleryPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const triggerFileInput = () => fileInputRef.current?.click()
  const triggerGalleryInput = () => galleryInputRef.current?.click()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    //if (isDiscountInvalid) return
    if (!!isDiscountInvalid) return

    setLoading(true)
    const data = new FormData()
    data.append('name', formData.name)
    data.append('price', formData.price)
    data.append('discount_price', formData.discount_price || formData.price)
    data.append('category', formData.category)
    data.append('country', formData.country)
    data.append('city', formData.city)
    data.append('description', formData.description)
    
    if (imageFile) data.append('main_image', imageFile)

    // Append Gallery Files
    galleryFiles.forEach((file) => {
        data.append('gallery_images', file)
    })

    try {
      let response;
      if (editData) {
       response= await api.patch(`/products-manage/`, data, { 
          params: { id: editData.id },
          headers: { 'Content-Type': 'multipart/form-data' } 
        })
        toast.success("Product updated successfully!")
        router.push('/seller/dashboard/products/');
      } else {
        response = await api.post('/products-manage/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success("Product listed successfully!")
        router.push('/seller/dashboard/products/');
      }
      //onSubmit()
      onSubmit(response.data)
    } catch (err: any) {
      toast.error(editData ? "Failed to update product." : "Failed to add product.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" onClick={onClose} />

      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto z-[101]">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="text-xl font-bold text-foreground italic uppercase">
            {editData ? 'Update Product' : 'Create Product'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Main Image Upload Area */}
          <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl bg-secondary/20 hover:border-accent transition-all overflow-hidden">
            <input 
              type="file" 
              ref={fileInputRef}
              className="hidden" 
              accept="image/*" 
              onChange={handleImageChange} 
              required={!editData && !previewUrl} 
            />

            {previewUrl ? (
              <div className="relative w-full aspect-video cursor-pointer" onClick={triggerFileInput}>
                <Image 
                  src={getImageUrl(previewUrl)} 
                  alt="Product preview" 
                  fill 
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  unoptimized 
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 text-white">
                  <Camera className="w-8 h-8" />
                  <span className="text-xs font-bold uppercase tracking-wider">Change Image</span>
                </div>
              </div>
            ) : (
              <label onClick={triggerFileInput} className="cursor-pointer flex flex-col items-center gap-2 py-10 w-full text-center">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-1">
                  <Camera className="w-6 h-6 text-accent" />
                </div>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-tight">Add Main Product Image</span>
              </label>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Product Title</label>
              <input 
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required 
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Category</label>
              <select 
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm outline-none"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat: any) => <option key={cat.id} value={cat.id}>{cat.title}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Price (USD)</label>
                  <input 
                    type="number" step="0.01"
                    className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm outline-none focus:ring-1 focus:ring-accent" 
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    required 
                  />
               </div>
               <div>
                  <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Discount Price</label>
                  <input 
                    type="number" step="0.01"
                    className={`w-full px-4 py-2.5 bg-secondary border rounded-lg text-sm outline-none ${isDiscountInvalid ? 'border-red-500' : 'border-border'}`}
                    value={formData.discount_price}
                    onChange={e => setFormData({...formData, discount_price: e.target.value})}
                  />
               </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Origin Country</label>
              <select 
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm outline-none"
                value={formData.country}
                onChange={e => setFormData({...formData, country: e.target.value})}
                required
              >
                <option value="">Select Country</option>
                {countries.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">City</label>
              <select 
                className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm outline-none disabled:opacity-50"
                value={formData.city}
                onChange={e => setFormData({...formData, city: e.target.value})}
                disabled={!formData.country}
                required
              >
                <option value="">Select City</option>
                {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>

          {isDiscountInvalid && (
            <div className="flex items-center gap-2 text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              <AlertCircle className="w-4 h-4" />
              <p className="text-xs font-medium">Discount price must be lower than original price.</p>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase text-muted-foreground mb-2 block">Product Details</label>
            <textarea 
              rows={3} 
              className="w-full px-4 py-2.5 bg-secondary border border-border rounded-lg text-sm outline-none resize-none" 
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          {/* NEW: Gallery Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black uppercase text-muted-foreground block tracking-wider">Product Gallery</label>
              <span className="text-[10px] text-muted-foreground">{galleryPreviews.length} images</span>
            </div>
            
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {galleryPreviews.map((url, index) => (
                <div key={index} className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden border border-border group">
                  <Image src={getImageUrl(url)} alt={`Gallery ${index}`} fill className="object-cover" unoptimized />
                  <button 
                    type="button"
                    onClick={() => removeGalleryImage(index)}
                    className="absolute inset-0 bg-red-600/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              <button 
                type="button"
                onClick={triggerGalleryInput}
                className="flex-shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-border bg-secondary/10 flex flex-col items-center justify-center hover:bg-secondary/30 hover:border-accent transition-all gap-1"
              >
                <Plus className="w-5 h-5 text-muted-foreground" />
                <span className="text-[8px] font-black uppercase text-muted-foreground">Add More</span>
              </button>
              
              <input 
                type="file" 
                multiple 
                ref={galleryInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleGalleryChange} 
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 border-border">Discard</Button>
            <Button 
              type="submit" 
              disabled={loading || isDiscountInvalid} 
              className="flex-1 bg-accent hover:bg-accent/90 text-white font-bold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editData ? 'UPDATE PRODUCT' : 'CREATE PRODUCT'}
            </Button>
          </div>
        </form>
      </div>
    </>
  )
}