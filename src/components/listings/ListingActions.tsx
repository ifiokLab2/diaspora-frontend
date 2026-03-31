'use client'

import { useState } from 'react'
import { AlertTriangle, MessageSquare, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ReportModal from '@/components/listings/ReportModal'

interface ListingActionsProps {
  listingId: number
  listingTitle: string
}

export default function ListingActions({ listingId, listingTitle }: ListingActionsProps) {
  const [isReportOpen, setIsReportOpen] = useState(false)

  return (
    <div className="space-y-4">
     {/* <div className="grid grid-cols-1 gap-3 pt-4">
        <Button className="w-full h-14 font-bold text-lg shadow-md">
          Contact Seller
        </Button>
        <Button variant="outline" className="w-full h-14 gap-2 font-semibold">
          <MessageSquare className="w-5 h-5" /> Chat Now
        </Button>
      </div>*/}

      <div className="flex justify-center pt-2">
        <button 
          onClick={() => setIsReportOpen(true)}
          className="flex items-center gap-2 text-slate-400 hover:text-red-600 text-xs font-medium transition-colors"
        >
          <AlertTriangle size={14} />
          Report this listing
        </button>
      </div>

      <ReportModal 
        listingId={listingId}
        listingTitle={listingTitle}
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  )
}