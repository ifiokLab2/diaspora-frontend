"use client";
import React, { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import { AlertCircle } from "lucide-react";
import image1 from "@/assets/dia10.jpg";
import image2 from "@/assets/dia12.jpg";
import image3 from "@/assets/dia14.jpg";
import image4 from "@/assets/dia15.jpg";
import image5 from "@/assets/dia17.jpg";
import image6 from "@/assets/dia18.jpg";
import image7 from "@/assets/dia5.jpg";
import image8 from "@/assets/dia6.jpg";
import image9 from "@/assets/sport-ads.jpg";
import Image from "next/image";

const slides = [
  { id: 1, src: image1, title: 'First Impression' },
  { id: 2, src: image2, title: 'Seamless Experience' },
  { id: 3, src: image3, title: 'Modern Design' },
 { id: 4, src: image4, title: 'Modern Design' },
  { id: 5, src: image5, title: 'Modern Design' },
   { id: 6, src: image6, title: 'Modern Design' },
    { id: 7, src: image7, title: 'Modern Design' },
     { id: 8, src: image8, title: 'Modern Design' },
      { id: 9, src: image9, title: 'Modern Design' },
       
];


const HeroBanner = () => {
  // 2. Initialize Autoplay with options
  const autoplayOptions = {
    delay: 3000, // 5 seconds per slide
    stopOnInteraction: true,
    rootNode: (emblaRoot: HTMLElement) => emblaRoot.parentElement,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [Autoplay(autoplayOptions)]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);

  
  const scrollTo = useCallback((index: number) => emblaApi && emblaApi.scrollTo(index), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on('select', onSelect);
  }, [emblaApi, onSelect]);


  return (
    <section className="relative  w-full overflow-hidden group">
      {/* The Viewport */}
      <div className="h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div className="relative flex-[0_0_100%] min-w-0 h-full" key={slide.id}>
              <Image
                src={slide.src}
                alt={slide.title}
                fill
                
                priority={index === 0} // Correct! Keep this for the first slide
                sizes="100vw"          // Add this: Tells Next.js the image fills the screen width
                loading={index === 0 ? "eager" : "lazy"}
                className="w-full h-full object-cover"

              />
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3 z-10">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`cursor-pointer h-2 w-2 rounded-full transition-all duration-300 ${
              index === selectedIndex ? "bg-white " : "bg-white/50 hover:bg-white/80"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroBanner;
