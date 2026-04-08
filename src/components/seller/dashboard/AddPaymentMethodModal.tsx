'use client'

import { useState } from 'react'
import { X, Landmark, Smartphone, ShieldCheck, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import api from '@/lib/api'
import { toast } from 'react-hot-toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AddPaymentMethodModal({ isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    method_type: 'bank',
    provider_name: '',
    account_name: '',
    account_number: '',
    routing_number: '',
    is_default: false
  })

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/seller/payment-methods/', formData)
      toast.success("Payment method added successfully")
      onSuccess()
      onClose()
      setFormData({ 
        method_type: 'bank', provider_name: '', account_name: '', 
        account_number: '', routing_number: '', is_default: false 
      })
    } catch (error) {
      toast.error("Failed to add payment method. Please check your details.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-secondary/20">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Landmark className="w-5 h-5 text-accent" />
            Add Payout Account
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-secondary rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Method Selector */}
          <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl mb-4">
            {['bank',].map((type) => (
              //'bkash', 'nagad'
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, method_type: type })}
                className={`flex-1 py-2 text-xs font-bold uppercase rounded-lg transition-all ${
                  formData.method_type === type 
                  ? 'bg-accent text-accent-foreground shadow-lg' 
                  : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                {formData.method_type === 'bank' ? 'Bank Name' : 'Provider (e.g. Personal/Agent)'}
              </label>
              <input
                required
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-all"
                placeholder={formData.method_type === 'bank' ? "e.g. City Bank" : "e.g. Personal"}
                value={formData.provider_name}
                onChange={(e) => setFormData({...formData, provider_name: e.target.value})}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Account Holder Name</label>
              <input
                required
                className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-all"
                placeholder="Full name on account"
                value={formData.account_name}
                onChange={(e) => setFormData({...formData, account_name: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">
                   {formData.method_type === 'bank' ? 'Account Number' : 'Phone Number'}
                </label>
                <input
                  required
                  className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-all font-mono"
                  placeholder={formData.method_type === 'bank' ? "0000 0000" : "017XXXXXXXX"}
                  value={formData.account_number}
                  onChange={(e) => setFormData({...formData, account_number: e.target.value})}
                />
              </div>

              {formData.method_type === 'bank' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-muted-foreground ml-1">Routing No.</label>
                  <input
                  type = "number"
                    className="w-full bg-secondary/30 border border-border rounded-xl px-4 py-2.5 text-sm focus:border-accent focus:outline-none transition-all"
                    placeholder="9 Digits"
                    value={formData.routing_number}
                    onChange={(e) => setFormData({...formData, routing_number: e.target.value})}
                  />
                </div>
              )}
            </div>

            <label className="flex items-center gap-3 p-3 bg-secondary/20 rounded-xl cursor-pointer hover:bg-secondary/40 transition-all border border-transparent hover:border-border">
              <input
                type="checkbox"
                className="w-4 h-4 accent-accent"
                checked={formData.is_default}
                onChange={(e) => setFormData({...formData, is_default: e.target.checked})}
              />
              <span className="text-xs text-foreground font-medium">Set as primary withdrawal account</span>
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="flex-1 border border-border hover:bg-secondary"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground font-bold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Account"}
            </Button>
          </div>

          <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Encrypted and Secure
          </p>
        </form>
      </div>
    </div>
  )
}