'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight, MapPin, Eye, Clock, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import Image from "next/image";
import { getImageUrl, formatCurrency, getDistanceInMiles } from '@/lib/utils';

export default function ListingsGrid({ initialListings, initialPagination }: any) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())
    router.push(`${pathname}?${params.toString()}`, { scroll: true })
  }

  // Helper to color-code pricing models from your model's PRICING_MODELS
  const getPricingBadge = (model: string) => {
    switch (model) {
      case 'negotiable': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'hourly': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-amber-100 text-amber-700 border-amber-200' // fixed
    }
  }

  if (initialListings.length === 0) {
    return (
      <div className="py-24 text-center border-2 border-dashed rounded-3xl bg-slate-50/50">
        <h3 className="text-xl font-semibold text-slate-900">No results found</h3>
        <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {initialListings.map((listing: any) => (
          <Link key={listing.id} href={`/listings/${listing.slug}`}>
            <Card className="group h-full border-border hover:border-accent/50 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">
              {/* Image Header */}
              <div className="relative aspect-[16/11] bg-muted overflow-hidden">
                <Image
                  src={getImageUrl(listing.main_image)} 
                  alt={listing.title}
                  fill
                  loading="lazy"

                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <Badge className={`capitalize border shadow-sm ${getPricingBadge(listing.pricing_model)}`}>
                    {listing.pricing_model}
                  </Badge>
                </div>
                {listing.views_count > 0 && (
                  <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {listing.views_count}
                  </div>
                )}
              </div>

              {/* Content */}
              <CardContent className="px-5 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {listing.subcategory_name || 'Item'}
                  </span>
                </div>
                
                <h3 className="font-bold text-sm leading-tight mb-2 line-clamp-2  transition-colors">
                  {listing.title}
                </h3>

                <div className="mt-auto">
                  <p className="text-sm font-black text-muted-foreground mb-4">
                    {formatCurrency(listing.price)}
                    {listing.pricing_model === 'hourly' && <span className="text-sm font-normal text-muted-foreground">/hr</span>}
                  </p>
                  
                  <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 " /> 
                        {listing.city_name || listing.city?.name || 'Remote'}
                      </span>
                      <span className="flex items-center gap-1 shrink-0">
                        <Clock className="w-3.5 h-3.5" /> 
                        {new Date(listing.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination Container */}
       {/* Pagination Container */}
      <div className="flex items-center justify-center gap-6 pt-10 border-t">
        <Button 
          variant="outline" 
          size="sm"
          disabled={!initialPagination.has_previous}
          onClick={() => handlePageChange(initialPagination.current_page - 1)}
          className="rounded-full px-6"
        >
          <ChevronLeft className="w-4 h-4 mr-2" /> Prev
        </Button>

        <div className="text-sm font-semibold">
          Page {initialPagination.current_page} <span className="text-muted-foreground font-normal">of</span> {initialPagination.total_pages}
        </div>

        <Button 
          variant="outline" 
          size="sm"
          disabled={!initialPagination.has_next}
          onClick={() => handlePageChange(initialPagination.current_page + 1)}
          className="rounded-full px-6"
        >
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
