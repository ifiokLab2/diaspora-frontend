'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/seller/dashboard/sidebar'
import { DashboardHeader } from '@/components/seller/dashboard/header'
import { MetricCard } from '@/components/seller/dashboard/metric-card'
import { Button } from '@/components/ui/button'
import { DollarSign, TrendingUp, Calendar, CreditCard, Eye, Download, X } from 'lucide-react'

interface PayoutRecord {
  id: string
  date: string
  amount: string
  method: string
  status: 'Completed' | 'Pending' | 'Processing' | 'Failed'
  statusColor: string
  reference: string
}

interface PaymentMethod {
  id: string
  type: string
  last4: string
  holder: string
  exp: string
  isDefault: boolean
}

const payoutRecords: PayoutRecord[] = [
  {
    id: 'PAY-2024-001',
    date: 'Feb 14, 2024',
    amount: '5,000 BDT',
    method: 'Bank Transfer',
    status: 'Completed',
    statusColor: 'bg-green-500/15 text-green-400 border-green-500/20',
    reference: 'TRF-****4521',
  },
  {
    id: 'PAY-2024-002',
    date: 'Feb 10, 2024',
    amount: '3,500 BDT',
    method: 'Card',
    status: 'Completed',
    statusColor: 'bg-green-500/15 text-green-400 border-green-500/20',
    reference: 'CARD-****1234',
  },
  {
    id: 'PAY-2024-003',
    date: 'Feb 05, 2024',
    amount: '2,750 BDT',
    method: 'Bank Transfer',
    status: 'Completed',
    statusColor: 'bg-green-500/15 text-green-400 border-green-500/20',
    reference: 'TRF-****7890',
  },
  {
    id: 'PAY-2024-004',
    date: 'Jan 28, 2024',
    amount: '4,200 BDT',
    method: 'Card',
    status: 'Processing',
    statusColor: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
    reference: 'CARD-****5678',
  },
  {
    id: 'PAY-2024-005',
    date: 'Jan 20, 2024',
    amount: '1,800 BDT',
    method: 'Bank Transfer',
    status: 'Failed',
    statusColor: 'bg-red-500/15 text-red-400 border-red-500/20',
    reference: 'TRF-****2345',
  },
]

const paymentMethods: PaymentMethod[] = [
  {
    id: '1',
    type: 'VISA',
    last4: '1234',
    holder: 'JOHN DOE',
    exp: '10/30',
    isDefault: true,
  },
  {
    id: '2',
    type: 'Mastercard',
    last4: '5678',
    holder: 'JOHN DOE',
    exp: '12/25',
    isDefault: false,
  },
]

export default function PayoutsPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const handleRequestWithdraw = () => {
    if (withdrawAmount) {
      console.log('[v0] Withdrawal request:', withdrawAmount)
      setWithdrawAmount('')
      setShowWithdrawModal(false)
    }
  }

  return (
    <div className="bg-background h-screen flex flex-col overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <DashboardHeader 
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <main className="ml-0 md:ml-44 mt-20 pb-8 flex-1 overflow-y-auto">
        <div className="px-4 sm:px-6 md:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Payouts</h2>
            <p className="text-sm text-muted-foreground">Manage your earnings and withdrawal requests</p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <MetricCard
              icon={DollarSign}
              label="Available Balance"
              value="12,450"
              subtitle="BDT"
              iconColor="text-accent"
            />
            <MetricCard
              icon={TrendingUp}
              label="Total Earnings"
              value="45,680"
              subtitle="BDT"
              iconColor="text-green-400"
            />
            <MetricCard
              icon={Calendar}
              label="Pending Amount"
              value="3,200"
              subtitle="BDT"
              iconColor="text-orange-400"
            />
            <MetricCard
              icon={CreditCard}
              label="This Month"
              value="8,945"
              subtitle="BDT"
              iconColor="text-blue-400"
            />
          </div>

          {/* Withdraw Section */}
          <div className="bg-card border border-border/50 rounded-lg p-4 md:p-6 mb-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Request Withdrawal</h3>
                <p className="text-sm text-muted-foreground">Minimum withdrawal amount: 1,000 BDT</p>
              </div>
              <Button 
                onClick={() => setShowWithdrawModal(true)}
                className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
              >
                Request Withdraw
              </Button>
            </div>
          </div>

          {/* Withdraw Modal */}
          {showWithdrawModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-card border border-border/50 rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-foreground">Request Withdrawal</h3>
                  <button
                    onClick={() => setShowWithdrawModal(false)}
                    className="p-1 hover:bg-secondary rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-foreground" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                      Available Balance
                    </label>
                    <p className="text-2xl font-bold text-foreground">12,450 BDT</p>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide block mb-2">
                      Withdrawal Amount
                    </label>
                    <input
                      type="number"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder="Enter amount (min: 1,000 BDT)"
                      className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>

                  <div className="bg-secondary/30 border border-border/50 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground mb-2">Processing Fee (2%)</p>
                    <p className="text-sm font-semibold text-foreground">
                      {withdrawAmount ? `${(parseInt(withdrawAmount) * 0.02).toFixed(0)} BDT` : '0 BDT'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setShowWithdrawModal(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRequestWithdraw}
                      disabled={!withdrawAmount || parseInt(withdrawAmount) < 1000}
                      className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Request
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Payment Methods */}
          <div className="bg-card border border-border/50 rounded-lg p-4 md:p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-foreground">Payment Methods</h3>
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-8 px-3 border-border hover:bg-secondary/50 text-foreground"
              >
                + Add Method
              </Button>
            </div>

            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className="bg-secondary/20 border border-border/50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-8 bg-gradient-to-br from-slate-700 to-slate-800 rounded flex items-center justify-center text-xs font-bold text-white">
                      {method.type === 'VISA' ? 'VISA' : 'MC'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {method.type} ending in {method.last4}
                      </p>
                      <p className="text-xs text-muted-foreground">{method.holder} • {method.exp}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {method.isDefault && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">Default</span>
                    )}
                    <button className="p-2 hover:bg-secondary rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Payout History */}
          <div className="bg-card border border-border/50 rounded-lg overflow-hidden">
            <div className="p-4 md:p-6 border-b border-border/50">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h3 className="text-lg font-semibold text-foreground">Payout History</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-8 px-3 text-accent hover:text-accent/80 gap-2 w-fit"
                >
                  <Download className="w-4 h-4" />
                  Export
                </Button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto w-full">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Payout ID
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="hidden sm:table-cell px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Method
                    </th>
                    <th className="px-3 md:px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payoutRecords.map((record) => (
                    <tr key={record.id} className="border-b border-border hover:bg-secondary/20 transition-colors">
                      <td className="px-3 md:px-6 py-4">
                        <span className="text-xs md:text-sm font-medium text-foreground">{record.id}</span>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <span className="text-xs md:text-sm text-muted-foreground">{record.date}</span>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <span className="text-xs md:text-sm font-medium text-foreground">{record.amount}</span>
                      </td>
                      <td className="hidden sm:table-cell px-3 md:px-6 py-4">
                        <span className="text-xs md:text-sm text-muted-foreground">{record.method}</span>
                      </td>
                      <td className="px-3 md:px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 md:px-3 py-1 rounded-full text-xs font-medium border ${record.statusColor}`}
                        >
                          {record.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 md:px-6 py-4 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">Showing 1-5 of 24 payouts</p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-border hover:bg-secondary"
                >
                  ←
                </Button>
                <Button
                  size="sm"
                  className="h-8 w-8 p-0 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  1
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-border hover:bg-secondary hidden sm:inline-flex"
                >
                  2
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 border-border hover:bg-secondary"
                >
                  →
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 md:px-8 mt-12 py-6 border-t border-border/30 text-center">
          <p className="text-xs text-muted-foreground">
            © 2024 Gadget Market Seller Dashboard. All rights reserved.
          </p>
        </div>
      </main>
    </div>
  )
}
