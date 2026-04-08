"use client";

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search, Tag, RotateCcw, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useDebounce } from '@/hooks/use-debounce';
import { Badge } from '@/components/ui/badge';

export function SearchSection({ initialSearch, categories }: any) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // useTransition is the professional way to handle "loading" states 
  // during Next.js navigation/URL changes.
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<string | null>(null);

  const [text, setText] = useState(initialSearch);
  const debouncedSearch = useDebounce(text, 300);

  const activeCategory = searchParams.get('category');
  const hasFilters = !!(searchParams.get('search') || searchParams.get('category'));

  // Sync URL with search input
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedSearch) params.set('search', debouncedSearch);
    else params.delete('search');
    
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }, [debouncedSearch]);

  const toggleCategory = (id: string) => {
    setPendingId(id); // Set the ID that is currently loading
    const params = new URLSearchParams(searchParams.toString());
    
    if (activeCategory === id) params.delete('category');
    else params.set('category', id);
    
    params.set('page', '1');
    
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  };

  // Reset pendingId once the transition (loading) is finished
  useEffect(() => {
    if (!isPending) setPendingId(null);
  }, [isPending]);

  const clearFilters = () => {
    setText('');
    router.push(pathname);
  };

  return (
    <section className="mt-20 bg-slate-50 border-b border-border py-10">
      <div className="container mx-auto px-4">
        <div className="w-full space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-extrabold tracking-tight">Browse Listings</h1>
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
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center">
              {isPending && !pendingId ? (
                <Loader2 className="w-5 h-5 animate-spin text-accent" />
              ) : (
                <Search className="text-muted-foreground w-5 h-5" />
              )}
            </div>
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search Listings"
              className="pl-12 h-14 text-lg bg-white shadow-sm border-border focus-visible:ring-2 focus-visible:ring-accent"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <Tag className="w-4 h-4 text-muted-foreground mr-1" />
            {categories.map((cat: any) => {
              const isLoading = pendingId === cat.id.toString() && isPending;
              const isActive = activeCategory === cat.id.toString();
              
              return (
                <Badge
                  key={cat.id}
                  variant={isActive ? "default" : "outline"}
                  className={`cursor-pointer px-4 py-1.5 transition-all hover:border-accent flex items-center gap-2 ${
                    isLoading ? "opacity-70" : ""
                  }`}
                  onClick={() => !isPending && toggleCategory(cat.id.toString())}
                >
                  {isLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  {cat.name}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}