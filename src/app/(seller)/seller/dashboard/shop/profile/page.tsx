'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Sidebar } from '@/components/seller/dashboard/sidebar'
import { DashboardHeader } from '@/components/seller/dashboard/header'
import { Button } from '@/components/ui/button'
import { AddProductModal } from '@/components/seller/dashboard/add-product-modal'
import Footer  from '@/components/seller/dashboard/footer'
import { 
  Phone, 
  MapPin, 
  Edit2, 
  Save, 
  X, 
  Loader2, 
  Camera, 
  Landmark, 
  CreditCard, 
  Hash,
  Globe
} from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

const getImageUrl = (url: string | null) => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
};

export default function ShopProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
    const [showAddProductModal, setShowAddProductModal] = useState(false)

  
  // Dropdown Data
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])

  const [formData, setFormData] = useState({
    shop_name: '',
    business_type: '',
    phone_number: '',
    business_address: '',
    bank_name: '',
    account_number: '',
    sort_code: '',
    country: '', // ID for API
    city: '',    // ID for API
    country_name: '', // Display string
    city_name: '',    // Display string
    registration_number: '', 
    logo: null as string | null
  })

  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fetchProfile = async () => {
      try {
        const res = await api.get('/sellers/profile/me/')
        setFormData(res.data)
        if (res.data.logo) setLogoPreview(res.data.logo)
      } catch (err) {
        toast.error("Failed to load profile")
      } finally {
        setLoading(false)
      }
    }

  // 1. Initial Profile Fetch
  useEffect(() => {
    
    fetchProfile()
  }, [])

  // 2. Fetch Countries when entering Edit Mode
  useEffect(() => {
    if (isEditing && countries.length === 0) {
      api.get('/locations/') // Update this path to match your country list endpoint
        .then(res => setCountries(res.data.countries))
        .catch(() => toast.error("Error loading countries"))
    }
  }, [isEditing, countries.length])

  // 3. Fetch Cities when Country changes
  useEffect(() => {
    if (isEditing && formData.country) {
      api.get(`/locations/?country_id=${formData.country}`) // Update this path to match your city list endpoint
        .then(res => setCities(res.data.cities))
        .catch(() => toast.error("Error loading cities"))
    }
  }, [formData.country, isEditing])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSave = async () => {
    setLoading(true)
    const data = new FormData()
    
    // Append all editable fields
    Object.entries(formData).forEach(([key, value]) => {
      const excludedKeys = ['logo', 'registration_number', 'country_name', 'city_name']
      if (!excludedKeys.includes(key) && value !== null) {
        data.append(key, value as string)
      }
    })

    if (logoFile) data.append('logo', logoFile)

    try {
      const res = await api.patch('/sellers/profile/update/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      //setFormData(res.data)
      fetchProfile();
      setIsEditing(false)
      toast.success("Profile updated successfully")
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Update failed")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !formData.shop_name) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    )
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

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSubmit={handleAddProduct}
      />

      <main className="ml-0 md:ml-44 mt-20 pb-8 flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 md:px-8">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-secondary border border-border group">
                  {logoPreview ? (
                    <Image
                      src={getImageUrl(logoPreview)}
                      alt="logo"
                      fill 
                      className="object-cover"
                      unoptimized={true}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-2xl font-bold uppercase">
                      {formData.shop_name?.charAt(0)}
                    </div>
                  )}
                  {isEditing && (
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="text-white w-6 h-6" />
                      <input type="file" className="hidden" onChange={handleLogoChange} accept="image/*" />
                    </label>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{formData.shop_name}</h1>
                  <p className="text-sm text-muted-foreground font-mono">ID: {formData.registration_number}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                  disabled={loading}
                  className={`${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-accent hover:bg-accent/90'} text-white font-medium gap-2`}
                >
                  {isEditing ? <><Save className="w-4 h-4" /> Save Changes</> : <><Edit2 className="w-4 h-4" /> Edit Profile</>}
                </Button>
                {isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="bg-card border border-border/50 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Store Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Shop Name</label>
                  {isEditing ? (
                    <input name="shop_name" value={formData.shop_name} onChange={handleInputChange} className="w-full p-2 rounded bg-secondary border outline-none focus:ring-1 focus:ring-accent" />
                  ) : (
                    <p>{formData.shop_name}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Business Type</label>
                  {isEditing ? (
                    <select name="business_type" value={formData.business_type} onChange={handleInputChange} className="w-full p-2 rounded bg-secondary border outline-none">
                      <option value="Individual">Individual</option>
                      <option value="Registered Business">Registered Business</option>
                    </select>
                  ) : (
                    <p>{formData.business_type}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Payout Information */}
            <div className="bg-card border border-border/50 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4">Payout Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Bank Name</label>
                  {isEditing ? (
                    <input name="bank_name" value={formData.bank_name} onChange={handleInputChange} className="w-full p-2 rounded bg-secondary border outline-none focus:ring-1 focus:ring-accent" />
                  ) : (
                    <p>{formData.bank_name}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Account Number</label>
                  {isEditing ? (
                    <input name="account_number" value={formData.account_number} onChange={handleInputChange} className="w-full p-2 rounded bg-secondary border outline-none font-mono focus:ring-1 focus:ring-accent" />
                  ) : (
                    <p className="font-mono">****{formData.account_number?.slice(-4)}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Sort Code</label>
                  {isEditing ? (
                    <input name="sort_code" value={formData.sort_code} onChange={handleInputChange} className="w-full p-2 rounded bg-secondary border outline-none font-mono focus:ring-1 focus:ring-accent" />
                  ) : (
                    <p className="font-mono uppercase">{formData.sort_code}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-card border border-border/50 rounded-lg p-6 md:col-span-2">
              <h2 className="text-lg font-semibold mb-4 text-accent">Contact & Location</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block flex items-center gap-2"><Phone className="w-3 h-3"/> Phone</label>
                    {isEditing ? <input name="phone_number" value={formData.phone_number} onChange={handleInputChange} className="w-full p-2 rounded bg-secondary border outline-none focus:ring-1 focus:ring-accent" /> : <p>{formData.phone_number}</p>}
                 </div>
                 <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block flex items-center gap-2"><MapPin className="w-3 h-3"/> Address</label>
                    {isEditing ? <input name="business_address" value={formData.business_address} onChange={handleInputChange} className="w-full p-2 rounded bg-secondary border outline-none focus:ring-1 focus:ring-accent" /> : <p>{formData.business_address}</p>}
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block flex items-center gap-2"><Globe className="w-3 h-3"/> Country</label>
                        {isEditing ? (
                          <select name="country" value={formData.country} onChange={handleInputChange} className="w-full p-2 rounded bg-secondary border outline-none">
                            <option value="">Select...</option>
                            {countries.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        ) : (
                          <p>{formData.country_name}</p>
                        )}
                    </div>
                    <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">City</label>
                        {isEditing ? (
                          <select name="city" value={formData.city} onChange={handleInputChange} disabled={!formData.country} className="w-full p-2 rounded bg-secondary border outline-none disabled:opacity-50">
                            <option value="">Select...</option>
                            {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        ) : (
                          <p>{formData.city_name}</p>
                        )}
                    </div>
                 </div>
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