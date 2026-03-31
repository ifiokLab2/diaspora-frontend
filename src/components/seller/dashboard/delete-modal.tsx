'use client'

import { Button } from '@/components/ui/button'
import { AlertTriangle, X, Loader2 } from 'lucide-react'

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  loading: boolean
  itemName: string
}


export function DeleteConfirmationModal({ isOpen, onClose, onConfirm, loading, itemName }: DeleteModalProps) {
  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card border border-border rounded-xl shadow-2xl w-full max-w-md z-[111] overflow-hidden">
        
        <div className="p-6 text-center">
          {/* Warning Icon */}
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>

          <h3 className="text-xl font-bold text-foreground mb-2">Delete Product?</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Are you sure you want to delete <span className="text-foreground font-semibold">"{itemName}"</span>? 
            This action cannot be undone and the product will be removed from your inventory.
          </p>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-border"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              onClick={onConfirm} 
              disabled={loading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'YES, DELETE'}
            </Button>
          </div>
        </div>

        {/* Close button X */}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 hover:bg-secondary rounded-full transition-colors"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </>
  )
}