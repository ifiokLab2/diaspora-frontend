'use client'

import { Bell, Search, Plus, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from './theme-toggle'

interface DashboardHeaderProps {
  onMenuClick: () => void
  onAddProduct?: () => void
}

export function DashboardHeader({ onMenuClick, onAddProduct }: DashboardHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 md:left-44 bg-background border-b border-border/50 z-30">
      <div className="px-4 sm:px-6 md:px-8 py-4 md:py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={onMenuClick}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg md:text-xl font-semibold text-foreground">Dashboard Overview</h1>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          {/* Search - Hidden on mobile and small tablets */}
          <div className="relative hidden lg:flex items-center">
            {/*<Search className="absolute left-3 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search orders, products..."
              className="pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />*/}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Notification Bell 
          <button className="relative p-2 hover:bg-secondary rounded-lg transition-colors">
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-foreground" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          */}

          {/* Add Product Button - Hide text on mobile */}
          <Button 
            onClick={onAddProduct}
            className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium gap-2 text-xs md:text-sm px-2 md:px-4"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Product</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
