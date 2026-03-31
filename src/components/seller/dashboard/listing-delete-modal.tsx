'use client'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog"
import { Loader2, Trash2, AlertTriangle } from "lucide-react"

interface DeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  listingTitle: string
  loading?: boolean
}

export function DeleteListingModal({ isOpen, onClose, onConfirm, listingTitle, loading }: DeleteModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-[400px] border-border/50 shadow-2xl">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <AlertDialogTitle className="text-xl font-bold">Delete Listing?</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground pt-2">
            Are you sure you want to delete <span className="font-bold text-foreground">"{listingTitle}"</span>? 
            This action cannot be undone and will remove all associated analytics.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-6 sm:justify-center gap-2">
          <AlertDialogCancel disabled={loading} className="flex-1">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
                e.preventDefault();
                onConfirm();
            }}
            disabled={loading}
            className="flex-1 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes, Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}