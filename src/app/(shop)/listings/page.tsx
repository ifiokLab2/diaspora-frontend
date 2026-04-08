import api from '@/lib/api'
import ListingsGrid from '@/components/listings/ListingsGrid'
import { SearchSection } from '@/components/listings/SearchSection'
import { Suspense } from 'react'
import { Loader2 } from 'lucide-react'

export const revalidate = 0;

export default async function ListingHomePage(props: {
  searchParams: Promise<{ page?: string; search?: string; category?: string }>
}) {
  const searchParams = await props.searchParams;
  const page = searchParams.page || '1'
  const query = searchParams.search || ''
  const category = searchParams.category || ''

  // Parallel fetch for speed
  const [listingRes, catRes] = await Promise.all([
    api.get(`/listings/home/`, { params: { page, search: query, category } }),
    api.get('/listings/categories/')
  ]);

  const { results, pagination } = listingRes.data;
  const categories = catRes.data;

  return (
    <div className="min-h-screen bg-background">
      <SearchSection initialSearch={query} categories={categories} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              {query ? `Results for "${query}"` : 'Marketplace'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {pagination.total_items} items available
            </p>
          </div>
        </div>

        <Suspense fallback={<div className="h-60 flex items-center justify-center"><Loader2 className="animate-spin text-accent" /></div>}>
          <ListingsGrid 
            initialListings={results} 
            initialPagination={pagination} 
          />
        </Suspense>
      </div>
    </div>
  );
}