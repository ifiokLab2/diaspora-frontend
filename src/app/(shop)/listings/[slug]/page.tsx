import { Metadata } from 'next'
import { cache } from 'react'
import api from '@/lib/api'
import { notFound } from 'next/navigation'
import { MapPin, Calendar, Eye, ShieldCheck, MessageSquare, Share2, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import DetailGallery from '@/components/listings/DetailGallery'
import ListingActions from '@/components/listings/ListingActions'
import ShareListings from '@/components/listings/share-listings'
import { getImageUrl, formatCurrency, getDistanceInMiles } from '@/lib/utils';
// 1. DEDUPLICATION: This function ensures only one API call is made per request
const getListing = cache(async (slug: string) => {
  try {
    const res = await api.get(`/listings/public/${slug}/`)
    return res.data
  } catch (error) {
    return null
  }
})

// 2. DYNAMIC METADATA (SEO & Social Sharing)
export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params
  const listing = await getListing(slug)

  if (!listing) return { title: 'Listing Not Found' }

  return {
    title: `${listing.title} | MarketPlace`,
    description: listing.description.slice(0, 160),
    openGraph: {
      title: listing.title,
      description: listing.description.slice(0, 160),
      images: [{ url: listing.main_image }],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: listing.title,
      images: [listing.main_image],
    }
  }
}

// 3. MAIN PAGE COMPONENT
export default async function ListingDetailPage(props: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await props.params
  const listing = await getListing(slug)

  if (!listing) notFound()

 

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: Media & Info */}
          <div className="lg:col-span-8 space-y-6">
            <DetailGallery 
              mainImage={listing.main_image} 
              additionalImages={listing.additional_images || []} 
            />
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold mb-4 text-slate-900">About this listing</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>
            </div>
          </div>

          {/* RIGHT: Sidebar Action Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 sticky top-24">
              <div className="flex justify-between items-start mb-4">
                <Badge className=" border-none capitalize px-3 py-1">
                  {listing.pricing_model}
                </Badge>
                <ShareListings 
                  listingId={listing.id} 
                  listingTitle={listing.title} 
                />
               
              </div>

              <h1 className="text-2xl font-extrabold text-slate-900 mb-2 leading-tight">
                {listing.title}
              </h1>
              
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {listing.views_count} views</span>
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {new Date(listing.created_at).toLocaleDateString()}</span>
              </div>

              <div className="text-3xl font-black text-slate-900 mb-6">
                {formatCurrency(listing.price)}
                {listing.pricing_model === 'hourly' && <span className="text-lg font-normal text-muted-foreground">/hr</span>}
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                  <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden flex items-center justify-center font-bold text-slate-600">
                    {listing.seller?.seller_first_name?.[0] || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{listing?.seller_first_name} {listing?.seller_last_name}</p>
                    <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-bold">
                      <ShieldCheck className="w-3 h-3" /> VERIFIED SELLER
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-start gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                    <span>{listing.address}, {listing.city_name || listing.city?.name}</span>
                  </div>
                </div>

                {/*<div className="grid grid-cols-1 gap-3 pt-4">
                  <Button className="w-full  h-14 font-bold text-lg shadow-md">
                    Contact Seller
                  </Button>
                  <Button variant="outline" className="w-full h-14 gap-2 font-semibold">
                    <MessageSquare className="w-5 h-5" /> Chat Now
                  </Button>
                </div*/}
                <ListingActions 
                  listingId={listing.id} 
                  listingTitle={listing.title} 
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}