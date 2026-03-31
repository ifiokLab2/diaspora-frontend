'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/seller/dashboard/sidebar'
import { DashboardHeader } from '@/components/seller/dashboard/header'
import { AddProductModal } from '@/components/seller/dashboard/add-product-modal'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, Info, X, Image as ImageIcon } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

export default function CreateShopProfilePage() {
  const router = useRouter()
  const { updateProfileStatus } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])
  // New state for the image file and preview
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  // Note: registration_number removed as it is now backend-generated
  const [formData, setFormData] = useState({
    shop_name: '',
    business_type: 'Individual',
    phone_number: '',
    business_address: '',
    bank_name: '',
    account_number: '',
    sort_code: '',
    country: '', 
    city: '',    
  })


  const [errors, setErrors] = useState<Record<string, string>>({})
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large. Max 2MB allowed.")
        return
      }
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }
  useEffect(() => {
    api.get('/locations/').then(res => setCountries(res.data.countries ?? [])).catch(() => {})
  }, [])

  
  useEffect(() => {
    const loadCities = async () => {
      if (!formData.country) {
        setCities([]);
        return;
      }
      try {
        const res = await api.get(`/locations/?country_id=${formData.country}`);
        setCities(res.data.cities ?? []);
      } catch (err) {
        setCities([]);
      }
    };
    loadCities();
  }, [formData.country]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!formData.shop_name.trim()) newErrors.shop_name = 'Shop name is required'
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone is required'
    if (!formData.bank_name.trim()) newErrors.bank_name = 'Bank name is required'
    if (!formData.account_number.trim()) newErrors.account_number = 'Account number is required'
    if (!formData.country) newErrors.country = 'Country is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    // Using FormData to handle file upload
    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => {
      data.append(key, value)
    })
    
    if (logoFile) {
      data.append('logo', logoFile)
    }

    try {
      await api.post('/sellers/profile/create/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      updateProfileStatus()
      toast.success('Merchant account activated!')
      router.push('/seller/dashboard')
      router.refresh()
    } catch (error: any) {
      const serverErrors = error.response?.data
      if (serverErrors) {
        setErrors(serverErrors)
        toast.error("Please check your entries.")
      } else {
        toast.error('Failed to create profile.')
      }
    } finally {
      setLoading(false)
    }
  }
  return (
    <div className="flex flex-col md:mt-7 min-h-screen items-center justify-center bg-muted/40 py-2 px-[6%]">
      
      
      <main className="mt-20 pb-8 overflow-y-auto">
        <div className="">
          <div className="mb-8">
            <h1 className="text-lg font-bold text-foreground mb-2 italic uppercase tracking-tight">Merchant Setup</h1>
            <p className="text-sm text-muted-foreground">Verify your business details to start selling on the marketplace.</p>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 max-w-3xl shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-8">
              
             
              {/* Shop Logo Section */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Shop Branding</label>
              
              <div 
                onClick={() => !logoPreview && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed border-border rounded-xl p-8 text-center transition-colors bg-secondary/30 ${!logoPreview ? 'hover:border-accent/50 cursor-pointer' : ''}`}
              >
                {logoPreview ? (
                  <div className="relative w-32 h-32 mx-auto">
                    <Image 
                      src={logoPreview} 
                      alt="Logo preview" 
                      fill 
                      className="object-cover rounded-lg border border-border" 
                    />
                    <button 
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeLogo(); }}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 shadow-sm hover:scale-110 transition-transform"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm font-medium">Click to upload Shop Logo</p>
                    <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (max. 2MB)</p>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleFileChange}
                />
              </div>
            </div>

              {/* Identity Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold">Shop Name</label>
                  <input
                    type="text"
                    name="shop_name"
                    placeholder="e.g. Diaspora Gems"
                    value={formData.shop_name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-secondary/50 border rounded-lg outline-none focus:ring-2 focus:ring-accent transition-all ${errors.shop_name ? 'border-red-500' : 'border-border'}`}
                  />
                  {errors.shop_name && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.shop_name}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold">Business Type</label>
                  <select
                    name="business_type"
                    value={formData.business_type}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="Individual">Individual</option>
                    <option value="Company">Registered Company</option>
                   
                  </select>
                </div>
              </div>

              {/* Automatic Registration Display */}
              <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 flex items-start gap-3">
                <Info className="text-accent w-5 h-5 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-accent uppercase tracking-tighter">Registration ID</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your unique Merchant Registration Number will be <strong>automatically generated</strong> by our system upon successful activation.
                  </p>
                </div>
              </div>

              {/* Finance Section */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent mb-4">Settlement Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Bank Name</label>
                    <input type="text" name="bank_name" placeholder="e.g. Barclays" onChange={handleInputChange} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">Account Number</label>
                    <input type="text" name="account_number" maxLength={11} placeholder="00000000" onChange={handleInputChange} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none" />
                  </div>
                </div>
              </div>

              {/* Address & Contact Section */}
              <div className="border-t border-border pt-6">
                <h3 className="text-sm font-bold uppercase tracking-widest text-accent mb-4">Contact & Location</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                   <div className="space-y-1">
                    <label className="text-xs font-semibold">Country</label>
                    <select name="country" onChange={handleInputChange} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none">
                      <option value="">Select Country</option>
                      {countries.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold">City</label>
                    <select name="city" onChange={handleInputChange} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none">
                      <option value="">Select City</option>
                      {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
                
                <div className="space-y-1 mb-4">
                  <label className="text-xs font-semibold">Mobile Number</label>
                  <input type="tel" name="phone_number" placeholder="+44 ..." onChange={handleInputChange} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none" />
                </div>
                
                <div className="space-y-1">
                   <label className="text-xs font-semibold">Business Street Address</label>
                   <textarea name="business_address" placeholder="Full address for verification..." rows={3} onChange={handleInputChange} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none resize-none" />
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black hover:bg-zinc-800 text-white font-black uppercase tracking-[0.2em] py-8 text-sm rounded-xl shadow-lg transition-transform active:scale-[0.98]"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin w-5 h-5" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    'Submit'
                  )}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-4 font-bold uppercase tracking-tighter">
                  By activating, you agree to the DiasporaBlacks Terms of Service and Payout Policies.
                </p>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}