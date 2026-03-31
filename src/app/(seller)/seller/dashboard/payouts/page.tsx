'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/seller/dashboard/sidebar'
import { DashboardHeader } from '@/components/seller/dashboard/header'
import { MetricCard } from '@/components/seller/dashboard/metric-card'
import { AddPaymentMethodModal } from '@/components/seller/dashboard/AddPaymentMethodModal'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, Calendar, CreditCard, Eye, Download, X, Loader2, Trash2 } from 'lucide-react'
import api from '@/lib/api'
import { AddProductModal } from '@/components/seller/dashboard/add-product-modal'
import { toast } from 'react-hot-toast'
import Footer  from '@/components/seller/dashboard/footer'


export default function PayoutsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showAddMethodModal, setShowAddMethodModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
   const [showAddProductModal, setShowAddProductModal] = useState(false)
  
  // Real Data State
  const [data, setData] = useState<any>({ 
    available_balance: 0, 
    pending_balance: 0, 
    total_earnings: 0, 
    this_month: 0, 
    history: [] 
  })
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('')

  const fetchData = async () => {
    try {
      setLoading(true)
      const [payoutRes, methodsRes] = await Promise.all([
        api.get('/seller/payouts/'),
        api.get('/seller/payment-methods/')
      ])
      setData(payoutRes.data)
      setPaymentMethods(methodsRes.data)
      
      // Auto-select default method if available
      const defaultMethod = methodsRes.data.find((m: any) => m.is_default)
      if (defaultMethod) setSelectedMethod(defaultMethod.id.toString())
    } catch (error) {
      toast.error("Failed to load payout data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])
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

  const handleRequestWithdraw = async () => {
    if (!withdrawAmount || !selectedMethod) {
      toast.error("Please provide amount and select a payment method")
      return
    }

    setSubmitting(true)
    try {
      await api.post('/seller/payouts/', {
        amount: withdrawAmount,
        method: selectedMethod
      })
      toast.success("Withdrawal request submitted")
      setShowWithdrawModal(false)
      setWithdrawAmount('')
      fetchData() // Refresh balances
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Request failed")
    } finally {
      setSubmitting(false)
    }
  }
  

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-500/15 text-green-400 border-green-500/20'
      case 'pending': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20'
      case 'processing': return 'bg-blue-500/15 text-blue-400 border-blue-500/20'
      case 'rejected': return 'bg-red-500/15 text-red-400 border-red-500/20'
      default: return 'bg-gray-500/15 text-gray-400 border-gray-500/20'
    }
  }

  if (loading && !data.history.length) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-accent" />
    </div>
  )

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      
      <AddPaymentMethodModal 
        isOpen={showAddMethodModal} 
        onClose={() => setShowAddMethodModal(false)} 
        onSuccess={fetchData} 
      />
       <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSubmit={handleAddProduct}
      />

      <main className="ml-0 md:ml-44 mt-20 pb-8 flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 md:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Payouts</h2>
            <p className="text-sm text-muted-foreground">Manage your earnings and withdrawal requests</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              icon={DollarSign}
              label="Available Balance"
              value={`£${data.available_balance.toLocaleString()}`}
              subtitle=""
              iconColor="text-accent"
            />
            <MetricCard
              icon={TrendingUp}
              label="Total Earnings"
              value={`£${data.total_earnings?.toLocaleString() || "0"}`}
              subtitle=""
              iconColor="text-green-400"
            />
            <MetricCard
              icon={Calendar}
              label="Pending Amount"
              value={`£${data.pending_balance?.toLocaleString() || "0"}`}
              subtitle=""
              iconColor="text-orange-400"
            />
            <MetricCard
              icon={CreditCard}
              label="This Month"
              value={`£${data.this_month?.toLocaleString() || "0"}`}
              subtitle=""
              iconColor="text-blue-400"
            />
          </div>

          <div className="bg-card border border-border/50 rounded-lg p-4 md:p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Request Withdrawal</h3>
                <p className="text-sm text-muted-foreground">Minimum withdrawal amount: £10</p>
              </div>
              {data.available_balance >= 10 && (
                <Button 
                onClick={() => setShowWithdrawModal(!showWithdrawModal)}
                disabled={data.available_balance < 10}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
              >
                Request Withdraw
              </Button>

              )}
              
            </div>
          </div>

          {/* Withdraw Modal */}
          {showWithdrawModal && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border/50 rounded-lg p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Request Withdrawal</h3>
                  <button onClick={() => setShowWithdrawModal(false)} className="p-1 hover:bg-secondary rounded-lg transition-colors">
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">Available Balance</label>
                    <p className="text-2xl font-bold text-foreground">£{data.available_balance.toLocaleString()}</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">Withdrawal Amount</label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount (min: £10)"
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">Payout Method</label>
                    <select 
                      value={selectedMethod}
                      onChange={(e) => setSelectedMethod(e.target.value)}
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent appearance-none"
                    >
                      <option value="">Select an account</option>
                      {paymentMethods.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.provider_name} ({m.account_number})</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-secondary/30 border border-border/50 rounded-lg p-3 text-sm">
                    <div className="flex justify-between mb-1">
                      <span className="text-muted-foreground">Estimated Fee (2%)</span>
                      <span className="text-foreground font-semibold">
                        {withdrawAmount ? `£${(parseInt(withdrawAmount) * 0.02).toFixed(0)} ` : '£0'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={() => setShowWithdrawModal(false)} variant="outline" className="flex-1">Cancel</Button>
                    <Button
                      onClick={handleRequestWithdraw}
                      disabled={submitting || !withdrawAmount || parseInt(withdrawAmount) < 1000 || !selectedMethod}
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Request'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods Section */}
          <div className="bg-card border border-border/50 rounded-lg p-4 md:p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Payment Methods</h3>
              <Button
                variant="outline" size="sm"
                onClick={() => setShowAddMethodModal(true)}
                className="text-xs h-8 px-3 border-border hover:bg-secondary/50 text-foreground"
              >
                + Add Method
              </Button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div key={method.id} className="bg-secondary/20 border border-border/50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded flex items-center justify-center text-[10px] font-bold text-white uppercase">
                      {method.method_type}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{method.provider_name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{method.account_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {method.is_default && <span className="text-[10px] font-bold uppercase bg-accent/20 text-accent px-2 py-1 rounded">Default</span>}
                  </div>
                </div>
              ))}
              {paymentMethods.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No payment methods added yet.</p>}
            </div>
          </div>

          {/* Payout History */}
          <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">Payout History</h3>
                {/*<Button variant="ghost" size="sm" className="text-xs h-8 px-3 text-accent hover:text-accent/80 gap-2 w-fit">
                  <Download className="w-4 h-4" /> Export
                </Button>*/}
              </div>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Payout ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Amount</th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.history.map((record: any) => (
                    <tr key={record.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 text-xs font-mono font-medium text-foreground">#TRX-{record.id}</td>
                      <td className="px-6 py-4 text-xs text-muted-foreground">{new Date(record.created_at).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-sm font-bold text-foreground">£{record.amount}</td>
                      <td className="hidden sm:table-cell px-6 py-4 text-xs text-muted-foreground">{record.method_details?.provider_name || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusStyles(record.status)}`}>
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {data.history.length === 0 && <p className="text-center py-12 text-sm text-muted-foreground italic">No payout activity found.</p>}
            </div>
          </div>
        </div>
        {/* Footer */}
       <Footer />
      </main>
    </div>
  )
}