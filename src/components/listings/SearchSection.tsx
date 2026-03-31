'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Search, X, Tag, RotateCcw } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useDebounce } from '@/hooks/use-debounce'
import { Badge } from '@/components/ui/badge'

export function SearchSection({ initialSearch, categories }: any) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [text, setText] = useState(initialSearch)
  const debouncedSearch = useDebounce(text, 400)

  const activeCategory = searchParams.get('category')
  const hasFilters = searchParams.get('search') || searchParams.get('category')

  // Effect to update URL when typing (Debounced)
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (debouncedSearch) params.set('search', debouncedSearch)
    else params.delete('search')
    
    params.set('page', '1') // Reset to page 1 on new search
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }, [debouncedSearch])

  const toggleCategory = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (activeCategory === id) params.delete('category')
    else params.set('category', id)
    
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    setText('')
    router.push(pathname) // Standardized way to clear all queries
  }

  return (
    <section className="mt-30 bg-slate-50 border-b border-border py-10">
      <div className="container mx-auto px-4">
        <div className="w-full space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold tracking-tight">Browse Inventory</h1>
            {hasFilters && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-muted-foreground hover:text-destructive gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Clear All
              </Button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search make, model, or year..."
              className="pl-12 h-14 text-lg bg-white shadow-sm border-border focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Tag className="w-4 h-4 text-muted-foreground mr-1" />
            {categories.map((cat: any) => (
              <Badge
                key={cat.id}
                variant={activeCategory === cat.id.toString() ? "default" : "outline"}
                className="cursor-pointer px-4 py-1.5 transition-all hover:border-accent"
                onClick={() => toggleCategory(cat.id.toString())}
              >
                {cat.name}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}