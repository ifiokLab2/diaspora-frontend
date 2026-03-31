import ProductList from '@/components/search/ProductList';
import BackToTop from '@/components/BackToTop';
import { Suspense } from 'react';
import { cookies } from 'next/headers';

// Simple Skeleton Component for Suspense Fallback
function ProductSkeleton() {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
      <div className="aspect-square bg-gray-200 animate-pulse" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
        <div className="flex justify-between items-center pt-2">
          <div className="h-5 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default async function ProductsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  // 1. Setup Data & Cookies
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  const params = await searchParams;
  
  // 2. Extract specific search filters
  const searchQuery = typeof params.search === 'string' ? params.search : "";
  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
  let initialData = { results: [], count: 0 };

  // 3. Initial Fetch for Page 1 using Native Fetch (Next.js Standard)
  try {
    const url = new URL('search/products/', BASE_URL);
    
    // Add Query Params
    if (searchQuery) url.searchParams.append('search', searchQuery);
    
    url.searchParams.append('page', '1');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // Revalidate every 60 seconds (Incremental Static Regeneration)
      next: { revalidate: 60 }, 
    });

    if (response.ok) {
      initialData = await response.json();
      //console.log('initialData:',initialData);
    }
  } catch (err) {
    console.error("Initial Server-side Fetch Error:", err);
  }

  return (
    <main className="max-w-[1400px] mx-auto px-[6%] pt-32 pb-20 min-h-screen">
      <header className="mb-12">
        <h1 className="text-sm font-black text-gray-900 tracking-tight">
          {searchQuery
            ? `Results for "${searchQuery}"` 
            : "Explore All Products"}
        </h1>
        
       
        
        <p className="text-gray-400 text-sm mt-1">Found {initialData.count} items</p>
      </header>

      <ProductList 
          key={searchQuery }
          initialProducts={initialData.results || []} 
          initialCount={initialData.count || 0}
          searchQuery={searchQuery}
         
        />

      <BackToTop />
    </main>
  );
}