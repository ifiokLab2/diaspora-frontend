'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/seller/dashboard/sidebar'
import { DashboardHeader } from '@/components/seller/dashboard/header'
import { AddProductModal } from '@/components/seller/dashboard/add-product-modal'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Upload } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import api from '@/lib/api'
import Footer  from '@/components/seller/dashboard/footer'

interface ShopFormData {
  shopName: string
  shopDescription: string
  businessType: string
  email: string
  phone: string
  website: string
  street: string
  city: string
  country: string
  logo: string
}

export default function CreateShopProfilePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddProductModal, setShowAddProductModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<ShopFormData>({
    shopName: '',
    shopDescription: '',
    businessType: 'electronics',
    email: '',
    phone: '',
    website: '',
    street: '',
    city: '',
    country: '',
    logo: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.shopName.trim()) newErrors.shopName = 'Shop name is required'
    if (!formData.shopDescription.trim()) newErrors.shopDescription = 'Shop description is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.email.includes('@')) newErrors.email = 'Please enter a valid email'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.street.trim()) newErrors.street = 'Street address is required'
    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.country.trim()) newErrors.country = 'Country is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      console.log('[v0] Creating shop profile:', formData)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      alert('Shop profile created successfully!')
      setFormData({
        shopName: '',
        shopDescription: '',
        businessType: 'electronics',
        email: '',
        phone: '',
        website: '',
        street: '',
        city: '',
        country: '',
        logo: '',
      })
    } catch (error) {
      console.error('Error creating shop profile:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onAddProduct={() => setShowAddProductModal(true)}
      />
      
      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSubmit={handleAddProduct}
      />

      {/* Main Content */}
      <main className="ml-0 md:ml-44 mt-20 pb-8 flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 md:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link href="/shop-profile">
              <button className="flex items-center gap-2 text-accent hover:text-accent/80 mb-4">
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm font-medium">Back to Shop Profile</span>
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create Shop Profile</h1>
            <p className="text-muted-foreground">Set up your shop profile to start selling on Gadget Market</p>
          </div>

          {/* Form Container */}
          <div className="bg-card border border-border/50 rounded-lg p-6 md:p-8 max-w-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shop Logo Section */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-3">Shop Logo</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-accent/50 transition-colors cursor-pointer">
                  <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG, GIF up to 5MB</p>
                  <input type="file" className="hidden" accept="image/*" />
                </div>
              </div>

              {/* Shop Name */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Shop Name</label>
                <input
                  type="text"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleInputChange}
                  placeholder="Enter your shop name"
                  className={`w-full px-4 py-2 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.shopName ? 'border-red-500/50' : 'border-border'
                  }`}
                />
                {errors.shopName && <p className="text-xs text-red-500 mt-1">{errors.shopName}</p>}
              </div>

              {/* Shop Description */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Shop Description</label>
                <textarea
                  name="shopDescription"
                  value={formData.shopDescription}
                  onChange={handleInputChange}
                  placeholder="Tell us about your shop..."
                  rows={4}
                  className={`w-full px-4 py-2 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent ${
                    errors.shopDescription ? 'border-red-500/50' : 'border-border'
                  }`}
                />
                {errors.shopDescription && <p className="text-xs text-red-500 mt-1">{errors.shopDescription}</p>}
              </div>

              {/* Business Type */}
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Business Type</label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="electronics">Electronics</option>
                  <option value="fashion">Fashion</option>
                  <option value="home">Home & Garden</option>
                  <option value="sports">Sports & Outdoors</option>
                  <option value="books">Books & Media</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Contact Information */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Contact Information</h3>
                
                <div className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="your@email.com"
                      className={`w-full px-4 py-2 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.email ? 'border-red-500/50' : 'border-border'
                      }`}
                    />
                    {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+1 (555) 000-0000"
                      className={`w-full px-4 py-2 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.phone ? 'border-red-500/50' : 'border-border'
                      }`}
                    />
                    {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                  </div>

                  {/* Website */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Website (Optional)</label>
                    <input
                      type="url"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div className="border-t border-border pt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Address Information</h3>
                
                <div className="space-y-4">
                  {/* Street Address */}
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">Street Address</label>
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      placeholder="123 Main Street"
                      className={`w-full px-4 py-2 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent ${
                        errors.street ? 'border-red-500/50' : 'border-border'
                      }`}
                    />
                    {errors.street && <p className="text-xs text-red-500 mt-1">{errors.street}</p>}
                  </div>

                  {/* City and Country */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="New York"
                        className={`w-full px-4 py-2 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent ${
                          errors.city ? 'border-red-500/50' : 'border-border'
                        }`}
                      />
                      {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="United States"
                        className={`w-full px-4 py-2 bg-secondary border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent ${
                          errors.country ? 'border-red-500/50' : 'border-border'
                        }`}
                      />
                      {errors.country && <p className="text-xs text-red-500 mt-1">{errors.country}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-border pt-6 flex gap-3">
                <Link href="/shop-profile" className="flex-1">
                  <Button 
                    variant="outline"
                    className="w-full border-border hover:bg-secondary/50 text-foreground"
                  >
                    Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
                >
                  {loading ? 'Creating...' : 'Create Shop Profile'}
                </Button>
              </div>
            </form>
          </div>
        </div>
         {/* Footer */}
       <Footer />
      </main>
    </div>
  )
}
