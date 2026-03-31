'use client';
import { useState, useEffect } from 'react'; // Added useState and useEffect
import { Heart, MapPin, Diamond } from "lucide-react";
import Image from "next/image";
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl, formatCurrency, getDistanceInMiles } from '@/lib/utils';

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
  is_saved?: boolean; // Added to interface
}

const ProductCardSmall = ({
  id,
  latitude,
  longitude,
  discount_percentage,
  country_name,
  city_name,
  main_image,
  name,
  price,
  discount_price,
  slug,
  is_saved
}: Product) => {
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(is_saved || false);
  const [loading, setLoading] = useState(false);
  const [distance, setDistance] = useState<string>("calculating...");

  // Handle distance calculation
  useEffect(() => {
    if (!latitude || !longitude) {
      setDistance("Location unknown");
      return;
    }

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const miles = getDistanceInMiles(
            position.coords.latitude,
            position.coords.longitude,
            latitude,
            longitude
          );
          setDistance(`${miles} miles away`);
        },
        () => setDistance("Distance unavailable")
      );
    }
  }, [latitude, longitude]);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); // Stop the Link from navigating
    if (!isAuthenticated) return alert("Please login to save items.");
    
    setLoading(true);
    try {
      const res = await api.post(`/products/saved/toggle/${id}/`);
      setIsSaved(res.data.saved);
    } catch (err) {
      console.error("Error toggling saved item", err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Link href={`/product-detail/${slug}`} className="shadow-lg border border-border rounded-md overflow-hidden bg-card group block">
      <div className="relative">
        <Image
          src={getImageUrl(main_image)} // Fixed: was 'image'
          alt={name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
         
          height={300}
          width={300}
        />
        <button 
          onClick={handleToggleSave}
          disabled={loading}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart 
            className={`w-4 h-4 transition-colors ${
              isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"
            }`} 
          />
        </button>
      </div>

      <div className="p-3 space-y-1">
        <h3 className="text-sm font-medium text-foreground truncate">{name}</h3>
        
        <div className="flex items-center gap-2">
          {/* Fixed: Use discount_price and price directly */}
          <span className="text-sm font-semibold text-sale"> 
            {formatCurrency(discount_price)}
          </span>
          {discount_percentage > 0 && (
            <span className="text-[10px] text-red-600 font-bold">-{discount_percentage}%</span>
          )}
        </div>
        
        {price > discount_price && (
          <div>
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(price)}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 text-[10px] font-medium text-blue-600">
          <Diamond className="w-3 h-3" />
          <span>{distance}</span>
        </div>

        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{city_name}, {country_name}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCardSmall;