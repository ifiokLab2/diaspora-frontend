"use client";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import api from '@/lib/api';
import ListingCard from '@/components/listings-card';
import ProductSkeleton from '@/components/ProductSkeleton';
import { getCookie } from 'cookies-next'; // Use this for Client Components

export default  function  ListingsList({ initialListings, initialCount, searchQuery }: any) {
  const token = getCookie('accessToken');
  const [listings, setListings] = useState(initialListings);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialListings.length < initialCount);

  const { ref, inView } = useInView({ threshold: 0.1 });

  const loadMore = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    
    try {
      const nextPage = page + 1;
      
      // Modern URL construction via Axios params (which uses WHATWG internally)
      const { data } = await api.get('/search/listing/', {
        params: {
          search: searchQuery,
          page: nextPage
        },
        headers: {
          'Content-Type': 'application/json',
          // If token exists, spread the Authorization header into the object
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const newItems = data.results || [];
      setListings((prev: any) => [...prev, ...newItems]);
      setPage(nextPage);
      
      if (listings.length + newItems.length >= (data.count || 0)) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Infinite scroll error:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
     
    if (inView && hasMore && !loading) {
      loadMore();
    }
    
  }, [inView]);
  //<ProductCard key={p.id} product={p} />

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {listings.map((p: any) => <ListingCard key={p.id} {...p} />)}
        {loading && Array.from({ length: 4 }).map((_, i) => <ProductSkeleton key={i} />)}
      </div>

      <div ref={ref} className="h-20 w-full" />
      {!hasMore && listings.length > 0 && (
        <p className="text-center text-gray-400 py-10 italic">End of results.</p>
      )}
    </>
  );
}