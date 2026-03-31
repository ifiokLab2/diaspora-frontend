'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { CreditCard, Info, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { getImageUrl, formatCurrency, getDistanceInMiles } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'react-hot-toast'

interface PaymentMethod {
  type: string
  provider: string
  account_name: string
  display_number: string
  icon: string
  is_mobile: boolean
}
interface QuickActionsProps {
  balance: string
  paymentMethod: any
  // CHANGE THIS LINE: Add the second argument (id)
  onRequestWithdraw: (amount: number, id: string | number) => Promise<void> | void 
  loading?: boolean
}



export function QuickActions({ balance, paymentMethod, onRequestWithdraw, loading }: QuickActionsProps) {
  const [amount, setAmount] = useState<string>('')
  const numericBalance = parseFloat(balance.replace(/,/g, ''))
  const thresholdMet = numericBalance >= 10

  const handleAction = async () => {
    const val = parseFloat(amount)
    if (isNaN(val) || val < 10 || val > numericBalance) return

    if (!paymentMethod?.id) {
    toast.error("Please select a payment method first");
    return;
  }
    
    await onRequestWithdraw(val, paymentMethod.id);
    setAmount('') // Clear input on success
  }
  const handleMax = () => setAmount(numericBalance.toString())

  return (
    <div className="space-y-4 md:space-y-5">
      {/* Payout Balance Section */}
      <div className="bg-card border border-border/50 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Available for Payout</h3>
          <Info className="w-3 h-3 md:w-4 md:h-4 text-muted-foreground hover:text-foreground cursor-help" />
        </div>

        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-2xl font-bold text-foreground">£{balance}</h2>
          {thresholdMet && (
            <button 
              onClick={handleMax}
              className="text-[10px] text-accent hover:underline font-bold uppercase"
            >
              Use Max
            </button>
          )}
        </div>
        {/* Amount Input Field */}
        <div className="mb-4">
          <label className="text-[10px] uppercase font-semibold text-muted-foreground mb-1.5 block">
            Withdraw Amount
          </label>
          <div className="relative">
             <Input 
               type="number" 
               placeholder="Min. 10"
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               className="bg-secondary/30 border-border h-9 text-sm focus-visible:ring-accent pr-12"
             />
             <span className="absolute right-3 top-2 text-[10px] text-muted-foreground font-bold">£</span>
          </div>
        </div>

        <Button 
          onClick={handleAction}
          disabled={!thresholdMet || loading || !amount || parseFloat(amount) > numericBalance || parseFloat(amount) < 10}
          className="w-full bg-secondary hover:bg-secondary/90 text-foreground gap-2 text-xs md:text-sm border border-border/50"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
          <span>{loading ? 'Processing...' : 'Confirm Withdrawal'}</span>
        </Button>
      </div>

      {/* Default Payout Method Card */}
      <div className="bg-card border border-border/50 rounded-lg p-4 md:p-6">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <h3 className="text-xs font-medium text-foreground uppercase tracking-wide">Default Payout Method</h3>
          {paymentMethod && (
            <Link href = "/seller/dashboard/payouts" className="text-xs text-accent hover:text-accent/80 font-medium">Edit</Link>
            )}
          
        </div>

        {paymentMethod ? (
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-lg p-3 md:p-5 text-white shadow-xl border border-white/5">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                  {paymentMethod.type}
                </span>
                <span className="text-sm md:text-base font-semibold leading-none">
                  {paymentMethod.provider}
                </span>
              </div>
              <span className="text-lg md:text-xl">{paymentMethod.icon}</span>
            </div>

            <div className="space-y-3 md:space-y-4">
              <div className="text-xs md:text-sm font-mono tracking-[0.15em] text-slate-200">
                {paymentMethod.display_number}
              </div>

              <div className="grid grid-cols-1 text-xs pt-2 md:pt-3 border-t border-slate-700/50">
                <p className="text-slate-400 text-[9px] uppercase tracking-wider font-semibold">Account Holder</p>
                <p className="font-semibold text-xs md:text-sm mt-0.5 truncate uppercase">
                  {paymentMethod.account_name}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center">
            <p className="text-xs text-muted-foreground mb-3">No payout method linked</p>
            <Link href = "/seller/dashboard/payouts" className="text-xs text-accent hover:text-accent/80 font-medium">Add Method</Link>
           
            
          </div>
        )}
      </div>
    </div>
  )
}