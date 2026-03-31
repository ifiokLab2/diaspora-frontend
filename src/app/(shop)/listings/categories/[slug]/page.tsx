import { Metadata } from 'next'
import api from '@/lib/api'
import { cookies } from 'next/headers'
import ListingsGrid from '@/components/listings/ListingsGrid'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
 
  return {
    title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Listings | MyMarket`,
    description: `Browse all items in the ${slug} category.`
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  // 1. Unwrap both promises (Next.js 15 requirement)
  const { slug } = await params
  const { page = '1' } = await searchParams
   const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
 
  
  

  try {
    // 2. Fetch listings filtered by category slug/id
    // Note: Adjust the URL based on your DRF routing (e.g., /listings/?category_slug=slug)
    const res = await api.get(`/listings/home/`, {
      params: { 
        category_slug: slug, 
        page: page 
      },
       headers: {
        'Content-Type': 'application/json',
        // If the user is logged in, pass the token so Django populates request.user
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })


    const { results, pagination } = res.data

    return (
      <main className="min-h-screen bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <header className="mt-10 md:mt-20">
            <h1 className="text-lg font-extrabold text-slate-900 capitalize mb-2">
              {slug.replace('-', ' ')}
            </h1>
            <p className="text-slate-500">
              Found {pagination.total_items} items in this category
            </p>
          </header>

          <ListingsGrid 
            initialListings={results} 
            initialPagination={pagination} 
          />
        </div>
      </main>
    )
  } catch (error) {
    console.error("Category fetch error:", error)
    notFound()
  }
}