'use client'

import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'
import DashboardContent from '@/components/seller/dashboard/dashboard-content'

export default function DashboardPage() {
  return (
    <Suspense 
      fallback={
        <div className="h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}