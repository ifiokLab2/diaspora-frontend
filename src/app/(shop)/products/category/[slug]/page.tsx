import React from "react";
import { Metadata } from 'next';
import Link from "next/link";
import { ArrowLeft, ShoppingBag, SlidersHorizontal,ChevronRight } from "lucide-react";
import ProductCard from "@/components/product-card";
import LoadMore from "@/components/category/LoadMore";
import ScrollToTop from "@/components/category/ScrollToTop";

type Props = {
  params: { slug: string };
};

/**
 * 1. DYNAMIC METADATA (Server-Side)
 * Automatically sets the browser tab title based on the URL slug.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const title = slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
    
  return { 
    title: `${title} - DiasporaBlack`,
    description: `Explore the finest collection of ${title} at DiasporaBlack. Hand-picked quality from across the diaspora.`
  };
}

/**
 * 2. DATA FETCHING (Server-Side)
 * Fetches the first page (limit 10) to ensure fast initial page load and SEO.
 */
async function getInitialProducts(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api";
  
  try {
    const res = await fetch(`${baseUrl}/products/category/?category=${slug}&limit=10&offset=0`, {
      next: { revalidate: 60 } // Cache data for 60 seconds
    });

    if (!res.ok) return [];
    
    const data = await res.json();
    // Support both standard lists and DRF paginated responses (results)
    return data.results || data;
  } catch (error) {
    console.error("Fetch error:", error);
    return [];
  }
}

export default async function CategoryPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  const initialProducts = await getInitialProducts(slug);
  const displayTitle = slug.replace(/-/g, ' ');

  return (
    <div className="min-h-screen bg-background pb-24 px-[6%] relative">
      
      {/* --- BREADCRUMBS & NAV --- */}
      <nav className="mt-18 md:mt-36 py-2">
        <Link 
          href="/" 
          className="text-xs flex items-center gap-2 text-muted-foreground hover:text-primary-yellow transition-colors group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
          Back to Marketplace
        </Link>
      </nav>

      {/* --- CATEGORY HEADER --- */}
      <header className="mt-1">
          <Link href = "/products/category/Arts/" className=" bg-[#FEE2CC] flex items-center justify-between bg-category px-5 py-3 rounded-sm cursor-pointer hover:opacity-90 transition-opacity">
            <span className="text-sm font-medium text-foreground">{displayTitle}</span>
            <ChevronRight className="w-5 h-5 text-foreground" />
          </Link>
      </header>

      {/* --- PRODUCT GRID SECTION --- */}
      {initialProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 border-2 border-dashed rounded-[2rem] bg-muted/5">
          <div className="p-6 bg-muted rounded-full mb-6">
            <ShoppingBag className="text-muted-foreground/40" size={48} />
          </div>
          <h2 className="text-2xl font-black italic">No items found</h2>
          <p className="text-muted-foreground text-sm mt-2 mb-8">This category is currently being curated. Check back soon!</p>
          <Link 
            href="/" 
            className="bg-primary-yellow text-black px-10 py-4 rounded-full font-black text-sm shadow-xl hover:scale-105 transition-transform"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      ) : (
        <>
          {/* First 10 Products (SEO Rendered) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {initialProducts.map((product: any, index: number) => (
              <ProductCard key={index} {...product} />
            ))}
          </div>


          {/* 3. INFINITE SCROLL TRIGGER (Client-Side)
              This component takes over once the user reaches the bottom. */}
          <LoadMore slug={slug} initialOffset={10} />
        </>
      )}

      {/* --- 4. SCROLL TO TOP BUTTON (Client-Side) --- */}
      <ScrollToTop />
    </div>
  );
}