"use client";
import { useState, useEffect } from "react";
import { Heart, MapPin, Diamond } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import { getImageUrl, formatCurrency, getDistanceInMiles } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  price: number;
  discount_price: number;
  discount_percentage: number;
  main_image: string;
  slug: string;
  city_name?: string;
  country_name?: string;
  latitude?: number;
  longitude?: number;
  is_saved?: boolean; // Ensure your serializer sends this
}

const ProductCard = ({ 
  id, 
  latitude, 
  longitude, 
  discount_percentage, 
  city_name, 
  main_image, 
  name, 
  price, 
  discount_price, 
  slug,
  is_saved 
}: Product) => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [distance, setDistance] = useState<string>("calculating...");
  const [saved, setSaved] = useState(is_saved || false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    setSaved(is_saved || false);
    
  }, [is_saved]);

  // 1. Distance Calculation Logic
  useEffect(() => {
    if (!latitude || !longitude) {
      setDistance("Location unknown");
      return;
    }
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const miles = getDistanceInMiles(position.coords.latitude, position.coords.longitude, latitude, longitude);
          setDistance(`${miles} miles`);
        },
        () => setDistance("Distance unavailable")
      );
    }
  }, [latitude, longitude]);

  // 2. Optimistic Toggle Save Logic
  

   
  const handleToggleSave = async (e: React.MouseEvent) => {
     e.preventDefault(); // Prevents the Link from navigating to detail page
      e.stopPropagation(); // Stops event bubbling
    if (!isAuthenticated) {
      toast.error("Please login to save items");
      router.push(`/login/customer?callbackUrl=/product-detail/${slug}`);
      return;
    }

    setSaveLoading(true);
    try {
      // Hits your Django endpoint: /api/products/saved/toggle/<id>/
      const response = await api.post(`/products/saved/toggle/${id}/`);
      setSaved(response.data.saved); // Backend should return { "saved": true/false }
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error(`Error saving products`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <Link href={`/product-detail/${slug}`} className="relative shadow-lg border border-border rounded-md overflow-hidden bg-card group block transition-all hover:shadow-xl">
      <div className="relative">
        <Image
          src={getImageUrl(main_image)}
          alt={name}
          loading="lazy"
          className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
          
          height={300}
          width={300}
        />
        
        {/* Heart Button */}
        <button 
          onClick={handleToggleSave}
           disabled={saveLoading}
           
          className={`${saveLoading ? 'opacity-50' : ''} absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all`}
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              saved ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`} 
          />
        </button>
      </div>

      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium text-foreground truncate">{name}</h3>
        
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-sale">{formatCurrency(discount_price)}</span>
          {discount_percentage > 0 && (
             <span className="text-[10px] text-red-500">-{discount_percentage}%</span>
          )}
        </div>
        
        <div>
          <span className="text-xs text-original-price line-through">{formatCurrency(price)}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-distance font-medium text-blue-600">
          <Diamond className="w-3.5 h-3.5" />
          <span>{distance}{}</span>
        </div>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="w-3.5 h-3.5" />
          <span className="truncate">{city_name}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;