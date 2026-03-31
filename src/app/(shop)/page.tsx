import Link from 'next/link';
import CategorySidebar from "@/components/category-sidebar";
import HeroBanner from "@/components/hero-banner";
import PromoCards from "@/components/promo-cards";
import MenuItems from "@/components/menu-items";
import Products from "@/components/products";
// Mock data for demonstration
const featuredProducts = [
  { id: 1, name: "Premium Wireless Headphones", price: 299, image: "🎧" },
  { id: 2, name: "Minimalist Leather Watch", price: 150, image: "⌚" },
  { id: 3, name: "Smart Home Assistant", price: 89, image: "🎙️" },
  { id: 4, name: "Mechanical Gaming Keyboard", price: 120, image: "⌨️" },
];

export default function ShopHomePage() {
  return (
    <div className="mt-18 md:mt-28">
      <div className = "md:hidden text-[#313133] font-bold text-center text-[.7rem]  bg-[#EBF0CE] p-3 m-1">Shop now or find services and professionals.</div>
      {/* Hero Section */}
      <section className="h-[50vh] md:h-[75vh] py-2 px-[6%] bg-[#EBF0CE] relative  overflow-hidden flex">
          <CategorySidebar />
          <HeroBanner />
          <PromoCards />
      </section>
      {/* menu items */}
      <MenuItems />

      <section>
       {/* Products Grid */}
      <Products />
      
      </section>
    </div>
  );
}