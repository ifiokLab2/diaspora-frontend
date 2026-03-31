'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation' // Import usePathname
import { ChevronRight, LayoutDashboard, Package, ShoppingCart, BarChart3, CreditCard, Settings, LogOut, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const pathname = usePathname(); // Get the current path

  // Helper to determine if a link is active
  const isActive = (path: string) => pathname === path;

  // Shared link styles
  const linkStyles = (path: string) => 
    `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      isActive(path) 
        ? 'bg-secondary text-accent' 
        : 'text-foreground hover:bg-secondary'
    }`;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed left-0 top-0 h-screen w-44 bg-background border-r border-border flex flex-col z-40 transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:fixed md:translate-x-0 md:z-10`}>
        
        {/* Logo */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-accent-foreground font-bold text-base">D</span>
            </div>
            <Link href = '/' className="font-bold text-white text-xs truncate">DBLKS Market</Link>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0 ml-2"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* User Profile */}
        <div className="px-4 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
              <span className="text-white text-sm font-semibold">
                {user?.first_name?.[0].toUpperCase() || ""}{user?.last_name?.[0].toUpperCase() || ""}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-white text-sm font-semibold truncate max-w-[80px]">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-muted-foreground text-xs">Owner</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        </div>

        {/* Main Menu */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-3 py-4">
            <p className="text-xs text-muted-foreground font-semibold mb-3 px-2">MAIN MENU</p>
            <nav className="space-y-2">
              <Link href="/seller/dashboard" className={linkStyles('/seller/dashboard')}>
                <LayoutDashboard className="w-5 h-5" />
                <span className="text-sm font-medium">Dashboard</span>
              </Link>
              
              <Link href="/seller/dashboard/products" className={linkStyles('/seller/dashboard/products')}>
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Products</span>
              </Link>

              <Link href="/seller/dashboard/listings" className={linkStyles('/seller/dashboard/listings')}>
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Listings</span>
              </Link>

              <Link href="/seller/dashboard/orders" className={`${linkStyles('/seller/dashboard/orders')} relative`}>
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm font-medium">Orders</span>
                <span className="absolute right-2 bg-accent text-accent-foreground text-xs font-bold px-1.5 py-0.5 rounded"></span>
              </Link>

              <Link href="/seller/dashboard/analytics" className={linkStyles('/seller/dashboard/analytics')}>
                <BarChart3 className="w-5 h-5" />
                <span className="text-sm font-medium">Analytics</span>
              </Link>

              <Link href="/seller/dashboard/payouts" className={linkStyles('/seller/dashboard/payouts')}>
                <CreditCard className="w-5 h-5" />
                <span className="text-sm font-medium">Payouts</span>
              </Link>
            </nav>
          </div>

          {/* Settings Section */}
          <div className="px-3 py-4 border-t border-border">
            <p className="text-xs text-muted-foreground font-semibold mb-3 px-2">SETTINGS</p>
            <nav className="space-y-2">
              <Link href="/seller/dashboard/shop/profile" className={linkStyles('/seller/dashboard/shop/profile')}>
                <Package className="w-5 h-5" />
                <span className="text-sm font-medium">Shop Profile</span>
              </Link>
             
            </nav>
          </div>
        </div>

        {/* Log Out */}
        <div className="p-4 border-t border-border">
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-secondary transition-colors text-foreground">
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  )
}