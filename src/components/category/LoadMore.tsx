"use client";

import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import ProductCard from "@/components/product-card";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";

type Props = {
  slug: string;
  initialOffset: number;
};

export default function LoadMore({ slug, initialOffset }: Props) {
  const { ref, inView } = useInView();
  const [products, setProducts] = useState<any[]>([]);
  const [offset, setOffset] = useState(initialOffset);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      loadMoreProducts();
    }
  }, [inView]);

  const loadMoreProducts = async () => {
    setLoading(true);
    try {
      // Django DRF typically uses ?limit=10&offset=10 for pagination
      const res = await api.get(`/products/category/?category=${slug}&offset=${offset}&limit=10`);
      const newProducts = res.data.results || res.data;

      if (newProducts.length === 0) {
        setHasMore(false);
      } else {
        setProducts((prev) => [...prev, ...newProducts]);
        setOffset((prev) => prev + 10);
      }
    } catch (error) {
      console.error("Error loading more products", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product,index) => (
         <ProductCard key={index} {...product} />
        ))}
      </div>

      {hasMore && (
        <div ref={ref} className="flex justify-center py-10 w-full">
          <Loader2 className="animate-spin text-primary-yellow" size={32} />
        </div>
      )}
    </>
  );
}