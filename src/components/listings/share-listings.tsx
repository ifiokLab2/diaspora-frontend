'use client'

import { useState } from 'react'
import { AlertTriangle, MessageSquare, Share2, Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-hot-toast';

interface ListingActionsProps {
  listingId: number
  listingTitle: string
}

export default function ShareListings({ listingId, listingTitle }: ListingActionsProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const shareData = {
      title: listingTitle,
      text: `Check out this listing: ${listingTitle}`,
      url: window.location.href,
    }

    try {
      // Use Web Share API if available (Mobile)
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
        //setCopied(true)
        //toast.success("Link copied to clipboard!")
        //setTimeout(() => setCopied(false), 2000)
      } else {
        // Fallback to Clipboard (Desktop)
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        toast.success("Link copied to clipboard!")
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        toast.error("Could not share listing")
      }
    }
  }

  return (
     <Button 
        variant="ghost" 
        onClick={handleShare}
        size="icon" 
        className={`h-14 gap-2 font-semibold transition-all ${copied ? 'border-green-500 text-green-600' : ''}`}
     >
       {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
        {copied ? 'Copied' : ''}
    </Button>
    
  )
}