'use client'
import { useState } from 'react'
import Image from "next/image";
import { getImageUrl, formatCurrency, getDistanceInMiles } from '@/lib/utils';
export default function DetailGallery({ mainImage, additionalImages }: any) {
  const [activeImage, setActiveImage] = useState(mainImage)
  const allImages = [mainImage, ...additionalImages.map((img: any) => img.image)]

  return (
    <div className="space-y-4">
      {/* Big Display */}
      <div className="mt-10 md:mt-26 relative aspect-[16/10] w-full bg-white rounded-2xl overflow-hidden border border-slate-200">
        <Image
          src={getImageUrl(activeImage)} 
          alt="Listing focus" 
          className="w-full object-cover"
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 800px"
          priority // Added priority since this is likely the LCP element

         
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {allImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(img)}
            className={`relative flex-shrink-0 w-24 aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all ${
              activeImage === img ? 'border-accent ring-2 ring-accent/20' : 'border-transparent'
            }`}
          >

            <Image
              src={ getImageUrl(img)} 
              alt="Listing additionals" 
             className="w-full h-full object-cover" 
              fill
              sizes="96px"
              
            />
          </button>
        ))}
      </div>
    </div>
  )
}