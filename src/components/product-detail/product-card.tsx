'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Star, Heart, Check } from "lucide-react";
import Image from "next/image";
import { useCartStore } from '@/store/useCartStore';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast'; // Import toast
import api from '@/lib/api'; // Ensure you import your axios instance
import { getImageUrl, formatCurrency, getDistanceInMiles } from '@/lib/utils';

const ProductCard = ({ product }: any) => {
 // const { addItem, loading: cartLoading } = useCartStore();
  const { addItem, isLoading: cartLoading } = useCartStore();
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const allImages = product.images || [product.main_image];
  const [isAdded, setIsAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(product.main_image);
  
  // --- New State for Saved Items ---
  const [isSaved, setIsSaved] = useState(product.is_saved || false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    setSelectedImage(product.main_image);
  }, [product.main_image]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push(`/login/customer?callbackUrl=/product-detail/${product.slug}`);
      return;
    }
    try {
      await addItem(product.id, 1);
      setIsAdded(true);
      setTimeout(() => setIsAdded(false), 2000);
    } catch (error) {
      //alert("Could not add item to cart.");
      toast.error('Could not add product to cart.');
    }
  };

  // --- New Function: Toggle Save ---
  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      router.push(`/login/customer?callbackUrl=/product-detail/${product.slug}`);
      return;
    }

    setSaveLoading(true);
    try {
      // Hits your Django endpoint: /api/products/saved/toggle/<id>/
      const response = await api.post(`/products/saved/toggle/${product.id}/`);
      setIsSaved(response.data.saved); // Backend should return { "saved": true/false }
      toast.success(response.data.message);
    } catch (error) {
      console.error("Error saving item:", error);
      toast.error(`Error saving products`);
    } finally {
      setSaveLoading(false);
    }
  };

  return (
    <>
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Product Image Section */}
          <div className="md:w-[320px] shrink-0 p-6 bg-muted/30">
            <div className="relative w-full aspect-square bg-white rounded-md overflow-hidden border">
              <Image
                src={getImageUrl(selectedImage)}
                alt={product.name}
                fill
                className="object-contain p-2 transition-all duration-300"
                priority={true}                 
                fetchPriority="high"
                sizes="(max-width: 768px) 100vw, 320px"
              />
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-2 w-full overflow-x-auto py-2">
                {allImages.map((img: any, index: number) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(img.image || img)}
                    className={`relative w-16 h-16 shrink-0 rounded-md border-2 overflow-hidden transition-all 
                      ${selectedImage === (img.image || img) ? 'border-yellow-500 ring-2 ring-yellow-100' : 'border-transparent'}`}
                  >
                    <Image src={getImageUrl(img.image || img)} alt="" fill className="object-cover" sizes="64px"  loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Section */}
          <div className="flex-1 p-6 flex flex-col">
            <div className="flex items-start justify-between">
              <div>
                <span className="inline-block px-2.5 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                  Official Store
                </span>
                <h1 className="mt-2 text-lg font-bold text-foreground">{product.name}</h1>
                <div className="flex items-center gap-1.5 mt-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                  <span className="text-sm text-muted-foreground ml-1">(verified ratings)</span>
                </div>
              </div>

              {/* SAVED ITEM (HEART) BUTTON */}
              <button 
                onClick={handleToggleSave}
                disabled={saveLoading}
                className={`p-2 rounded-full transition-all hover:bg-gray-100 ${saveLoading ? 'opacity-50' : ''}`}
              >
                <Heart 
                  className={`cursor-pointer w-6 h-6 transition-colors ${
                    isSaved ? "fill-red-500 text-red-500" : "text-muted-foreground"
                  }`} 
                />
              </button>
            </div>

            <div className="border-t border-border my-4" />

            <div className="mt-auto">
              <p className="text-2xl font-bold text-foreground">{formatCurrency(product.discount_price || product.price)}</p>
              
              <button 
                onClick={handleAddToCart}
                disabled={cartLoading || isAdded}
                className={`cursor-pointer mt-6 w-full flex items-center justify-center gap-3 font-bold text-sm tracking-wider py-4 rounded-md transition-all 
                  ${isAdded ? 'bg-green-600 text-white' : 'bg-yellow-500 text-black hover:opacity-90'}`}
              >
                {isAdded ? <><Check className="w-5 h-5" /> ADDED TO Cart</> : <><ShoppingCart className="w-5 h-5" /> ADD TO CART</>}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-base font-bold text-foreground">Product Description</h2>
        <div className="border-t border-border mt-2 mb-4" />
        <div 
          className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: product.description }} 
        />
      </div>
    </>
  );
};

export default ProductCard;