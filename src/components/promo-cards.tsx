import { AlertCircle } from "lucide-react";
import image from "@/assets/sport-ads.jpg";
import Image from "next/image";
import image2 from "@/assets/dia17.jpg";

const PromoCards = () => {
  return (
    <div className="hidden lg:flex w-[300px] ml-[10px] shrink-0 flex-col items-center justify-center">
      {/* Fitness Promo */}
      <div className="relative overflow-hidden h-[49%]">
        <Image
          src={image}
          alt="Get in shape"
          className="w-full h-full"
        />
       
      </div>

      {/* Services Promo */}
      <div className="relative overflow-hidden h-[49%] mt-1">
        <Image
          src={image2}
          alt="Quality services"
          className="w-full h-full"
        />
       
      </div>
    </div>
  );
};

export default PromoCards;
