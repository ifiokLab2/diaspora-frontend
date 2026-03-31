"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin, Eye, Clock, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from "next/image";
import Link from 'next/link';
import { getImageUrl, formatCurrency, getDistanceInMiles } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Listing {
  id: number;
  title: string;
  subcategory_name: string;
  category: string;
  views_count: number;
  description: string;
  main_image: string;
  slug: string;
  pricing_model?: string;
  country_name: string;
  city_name: string;
  price?:number;
  address?: string;
  country?: string;
  city?: string;
  created_at?:string,
  is_active?: boolean; // Ensure your serializer sends this
}

 const getPricingBadge = (model: string) => {
    switch (model) {
      case 'negotiable': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'hourly': return 'bg-purple-100 text-purple-700 border-purple-200'
      default: return 'bg-amber-100 text-amber-700 border-amber-200' // fixed
    }
  }

const ListingCard = ({ 
  id, 
  title, 
  subcategory_name, 
  category, 
  views_count, 
  main_image, 
  description, 
  pricing_model, 
  price, 
  address,
  country_name,
  city_name,
  slug,
  created_at,
  is_active 
}: Listing) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  

 

 

  // 2. Optimistic Toggle Save Logic
  

   
  

  return (
     <Link href={`/listings/${slug}`}>
      <Card className="group h-full border-border hover:border-accent/50 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col">
        {/* Image Header */}
        <div className="relative aspect-[16/11] bg-muted overflow-hidden">
          <Image
            src={getImageUrl(main_image)} 
            alt={title}
            fill
            unoptimized={true}
            loading="lazy"

            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className={`capitalize border shadow-sm ${getPricingBadge(pricing_model || 'default')}`}>
              {pricing_model}
            </Badge>
          </div>
          {views_count > 0 && (
            <div className="absolute bottom-3 right-3 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1">
              <Eye className="w-3 h-3" /> {views_count}
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="px-5 flex-1 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-bold  uppercase tracking-widest">
              {subcategory_name || 'Item'}
            </span>
          </div>
          
        
           <h3 className=" text-sm font-medium text-foreground truncate transition-colors">{title}</h3>


          <div className="mt-auto">

            <p className="text-sm font-semibold text-slate-900">
              {formatCurrency(price || 0)}
              {pricing_model === 'hourly' && <span className="text-sm font-normal text-muted-foreground">/hr</span>}
            </p>
            
            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1 truncate">
                  <MapPin className="w-3.5 h-3.5 " /> 
                  {city_name  || 'Remote'}
                </span>
                <span className="flex items-center gap-1 shrink-0">
                  <Clock className="w-3.5 h-3.5" /> 
               {created_at ? (
              new Date(created_at).toLocaleDateString('en-GB', { 
                day: 'numeric', 
                   month: 'short', 
                    year: 'numeric' 
                      })
                    ) : (
                     "Recent"
                    )}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default ListingCard;