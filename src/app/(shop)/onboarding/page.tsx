'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Upload, Loader2, Info, X } from 'lucide-react'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

// Static regex moved outside component
const alphanumericRegex = /^[a-zA-Z0-9\s]+$/;

export default function CreateShopProfilePage() {
  const router = useRouter()
  const { updateProfileStatus } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [countries, setCountries] = useState([])
  const [cities, setCities] = useState([])
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    shop_name: '',
    business_type: 'Individual',
    phone_number: '',
    business_address: '',
    bank_name: '',
    account_number: '',
    country: '', 
    city: '',    
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // --- Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File is too large. Max 2MB allowed.")
        return
      }
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
      if (errors.logo) setErrors(prev => ({ ...prev, logo: '' }))
    }
  }

  const removeLogo = useCallback(() => {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    
    // --- STAGE 1: Strict Numeric Check for Account Number ---
    if (name === 'account_number') {
      // Remove any character that is NOT a digit (0-9)
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
  }

  // --- Effects ---
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

  // --- Validation Logic ---
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}
    
    if (!logoFile) newErrors.logo = 'Shop logo is required'

    const shopName = formData.shop_name.trim()
    if (!shopName) {
      newErrors.shop_name = 'Shop name is required'
    } else if (shopName.length <= 4) {
      newErrors.shop_name = 'Shop name must be more than 4 characters'
    } else if (!alphanumericRegex.test(shopName)) {
      newErrors.shop_name = 'Special characters (e.g. @#%) are not allowed'
    } else if (/^\d+$/.test(shopName)) {
      newErrors.shop_name = 'Shop name must contain letters'
    }

    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required'
    if (!formData.bank_name.trim()) newErrors.bank_name = 'Bank name is required'
    if (!formData.account_number.trim()) newErrors.account_number = 'Account number is required'
    if (!formData.country) newErrors.country = 'Country is required'
    if (!formData.city) newErrors.city = 'City is required'
    if (!formData.business_address.trim()) newErrors.business_address = 'Business address is required'
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) {
      toast.error("Please fill in all required fields.")
      return
    }

    setLoading(true)
    const data = new FormData()
    Object.entries(formData).forEach(([key, value]) => data.append(key, value))
    if (logoFile) data.append('logo', logoFile)

    try {
      await api.post('/sellers/profile/create/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      updateProfileStatus()
      toast.success('Merchant account activated!')
      router.push('/seller/dashboard')
    } catch (error: any) {
      setErrors(error.response?.data || {})
      toast.error('Failed to create profile.')
    } finally {
      setLoading(false)
    }
  }

  // --- Memoized UI Components for Speed ---
  const LogoSection = useMemo(() => (
    <div>
      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
        Shop Branding <span className="text-red-500">*</span>
      </label>
      <div 
        onClick={() => !logoPreview && fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors bg-secondary/30 ${
          errors.logo ? 'border-red-500 bg-red-50/10' : 'border-border'
        } ${!logoPreview ? 'hover:border-accent/50 cursor-pointer' : ''}`}
      >
        {logoPreview ? (
          <div className="relative w-32 h-32 mx-auto">
            <Image src={logoPreview} alt="Logo" fill className="object-cover rounded-lg border border-border" />
            <button 
              type="button" 
              onClick={(e) => { e.stopPropagation(); removeLogo(); }} 
              className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className={`w-8 h-8 mx-auto mb-2 ${errors.logo ? 'text-red-500' : 'text-muted-foreground'}`} />
            <p className={`text-sm font-medium ${errors.logo ? 'text-red-500' : ''}`}>Upload Shop Logo</p>
            <p className="text-xs text-muted-foreground mt-1">PNG, JPG or WEBP (max. 2MB)</p>
          </>
        )}
        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
      </div>
      {errors.logo && <p className="text-[10px] text-red-500 font-bold uppercase mt-2">{errors.logo}</p>}
    </div>
  ), [logoPreview, errors.logo, removeLogo]);

  return (
    <div className="flex flex-col md:mt-7 min-h-screen items-center justify-center bg-muted/40 py-2 px-[6%]">
      <main className="mt-20 pb-8 overflow-y-auto w-full max-w-3xl">
        <div className="mb-8">
          <h1 className="text-lg font-bold text-foreground mb-2 italic uppercase tracking-tight text-left">Merchant Setup</h1>
          <p className="text-sm text-muted-foreground text-left">Verify your business details to start selling.</p>
        </div>

        <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {LogoSection}

            {/* Shop Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold">Shop Name</label>
                <input
                  type="text"
                  name="shop_name"
                  placeholder="e.g. Diaspora Gems"
                  value={formData.shop_name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 bg-secondary/50 border rounded-lg outline-none focus:ring-2 focus:ring-accent transition-all ${errors.shop_name ? 'border-red-500' : 'border-border'}`}
                />
                {errors.shop_name && <p className="text-[10px] text-red-500 font-bold uppercase text-left">{errors.shop_name}</p>}
              </div>

              <div className="space-y-1 text-left">
                <label className="text-xs font-semibold">Business Type</label>
                <select name="business_type" value={formData.business_type} onChange={handleInputChange} className="w-full px-4 py-2 bg-secondary/50 border border-border rounded-lg outline-none">
                  <option value="Individual">Individual</option>
                  <option value="Company">Registered Company</option>
                </select>
              </div>
            </div>

            {/* Settlement Information */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-accent mb-4 text-left">Settlement Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold">Bank Name</label>
                  <input type="text" name="bank_name" value={formData.bank_name} onChange={handleInputChange} className={`w-full px-4 py-2 bg-secondary/50 border rounded-lg outline-none ${errors.bank_name ? 'border-red-500' : 'border-border'}`} />
                  {errors.bank_name && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.bank_name}</p>}
                </div>
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold">Account Number</label>
                  <input 
                    type="text" 
                    name="account_number" 
                    placeholder="Digits only"
                    value={formData.account_number} 
                    onChange={handleInputChange} 
                    className={`w-full px-4 py-2 bg-secondary/50 border rounded-lg outline-none ${errors.account_number ? 'border-red-500' : 'border-border'}`} 
                  />
                  {errors.account_number && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.account_number}</p>}
                </div>
              </div>
            </div>

            {/* Contact & Location */}
            <div className="border-t border-border pt-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-accent mb-4 text-left">Contact & Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold">Country</label>
                  <select name="country" value={formData.country} onChange={handleInputChange} className={`w-full px-4 py-2 bg-secondary/50 border rounded-lg ${errors.country ? 'border-red-500' : 'border-border'}`}>
                    <option value="">Select Country</option>
                    {countries.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.country && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.country}</p>}
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-xs font-semibold">City</label>
                  <select name="city" value={formData.city} onChange={handleInputChange} className={`w-full px-4 py-2 bg-secondary/50 border rounded-lg ${errors.city ? 'border-red-500' : 'border-border'}`}>
                    <option value="">Select City</option>
                    {cities.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {errors.city && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.city}</p>}
                </div>
              </div>
              <div className="space-y-1 mb-4 text-left">
                <label className="text-xs font-semibold">Mobile Number</label>
                <input type="tel" name="phone_number" value={formData.phone_number} onChange={handleInputChange} className={`w-full px-4 py-2 bg-secondary/50 border rounded-lg outline-none ${errors.phone_number ? 'border-red-500' : 'border-border'}`} />
                {errors.phone_number && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.phone_number}</p>}
              </div>
              <div className="space-y-1 text-left">
                 <label className="text-xs font-semibold">Business Street Address</label>
                 <textarea name="business_address" value={formData.business_address} rows={3} onChange={handleInputChange} className={`w-full px-4 py-2 bg-secondary/50 border rounded-lg outline-none resize-none ${errors.business_address ? 'border-red-500' : 'border-border'}`} />
                 {errors.business_address && <p className="text-[10px] text-red-500 font-bold uppercase">{errors.business_address}</p>}
              </div>
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-black hover:bg-zinc-800 text-white font-black uppercase py-8 rounded-xl shadow-lg transition-transform active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Activate Merchant Profile'}
            </Button>
          </form>
        </div>
      </main>
    </div>
  )
}