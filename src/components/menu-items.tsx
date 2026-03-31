"use client"
import { Wine,ChevronLeft,Search, User, ChevronRight , X, UtensilsCrossed, Building2, Landmark, Home, MoreHorizontal } from "lucide-react";
import { useState, useRef } from "react";
import { useRouter } from 'next/navigation';
import Image from "next/image";
import Link from 'next/link';



import fashionImg from "@/assets/fashion.png";
import meatImg from "@/assets/african-foods.png";
import fruitsImg from "@/assets/fruits-vegetables.jpg";
import herbsImg from "@/assets/african-herbs.jpeg";
import skincareImg from "@/assets/skincare.png";
import hairImg from "@/assets/hair-products.jpg";
import condimentsImg from "@/assets/condiments.png";
import yamImg from "@/assets/yam-tubers.jpg";
import beverages from "@/assets/beverages.jpg";

const categories = [
  { image: fashionImg, label: "Fashion" ,link:"fashion"},
  { image: meatImg, label: "Meat & African Foods",link:"meat-african-foods" },
  { image: fruitsImg, label: "Fruits & Vegetables" ,link:"fruits-vegetables"},
  { image: herbsImg, label: "African Herbs",link:"african-herbs" },
  { image: skincareImg, label: "Skincare", link:"skincare",featured: true },
  { image: hairImg, label: "Hair Products",link:"hair-products" },
  { image: condimentsImg, label: "Condiments",link:"condiments" },
  { image: yamImg, label: "Yam & Tubers" ,link:"yam-tubers"},
]
const services = [
  { icon: Wine, label: "Night Life",link:"night-life" },
  { icon: UtensilsCrossed, label: "Restaurant",link:"restaurant" },
  { icon: Building2, label: "Bureau De Change",link:"bureau-de-change" },
  { icon: Landmark, label: "Real Estates",link:"real-estates" },
  { icon: Home, label: "Home Services" ,link:"home-services"},
  
];

const menuItems = () => {
   const [searchModal,setSearchModal] = useState(false);
  const [servicesSearch, setServicesSearch] = useState('')
  const [location, setLocation] = useState('')
  const [productsSearch, setProductsSearch] = useState('');
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };


  const toggleSearchModal  = ()=>{
    setSearchModal(!searchModal);
  };
  
  
 
   const handleFullSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    // Attach all three if they exist
    if (productsSearch.trim()) params.set("search", productsSearch.trim());
    if (servicesSearch.trim()) params.set("listings", servicesSearch.trim());
    if (location.trim()) params.set("location", location.trim());
    
    params.set("page", "1"); // Always reset to page 1

    const queryString = params.toString();
    
    // Logic: If Service/Location are filled, go to /services. Otherwise /products.
    const targetPath = (servicesSearch || location) ? '/search/listings' : '/search/products';
    
    router.push(`${targetPath}?${queryString}`);
    
    setSearchModal(false);
    //setSuggestions([]);
  };

  return (
   <>
      <section className="py-2 px-[6%] ">
        <h2 className="text-lg font-semibold text-primary mb-6">Services & Listings</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(80px,1fr))] gap-[12px]  w-full pb-2">
          {services.map((service) => (
            <Link
            href = {`/listings/categories/${service.link}`}
              key={service.label}
              className="inline-block min-w-[100px] px-4 py-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <service.icon className="flex items-center justify-center w-full h-5 text-primary-yellow" />
              <span className="flex items-center justify-center w-full text-xs text-foreground whitespace-nowrap">{service.label}</span>
            </Link>
          ))}
          <button
            onClick = {toggleSearchModal}
              className="inline-block min-w-[100px] px-4 py-2 hover:opacity-80 transition-opacity cursor-pointer"
            >
              <MoreHorizontal className="flex items-center justify-center w-full h-5 text-primary-yellow" />
              <span className="flex items-center justify-center w-full text-xs text-foreground whitespace-nowrap">More</span>
            </button>
          
        </div>
    </section>

     <section className="py-2 px-[6%]">
      <h2 className="text-lg font-semibold text-primary mb-6">Products & Brands</h2>
      <div className="relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-foreground" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide px-12 py-4"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {categories.map((cat, index) => (
            <Link
             key={cat.label}
              className="flex flex-col items-center gap-3 flex-shrink-0 cursor-pointer"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              href = {`/products/category/${cat.link}`}
            >
              <div
                className={`relative w-28 h-28 md:w-36 md:h-36 rounded-full overflow-hidden transition-all duration-200 ${
                  cat.featured || hoveredIndex === index
                    ? "ring-4 ring-accent bg-accent shadow-lg scale-105"
                    : "bg-muted"
                }`}
              >
                <Image
                 
                  src={cat.image}
                  alt={cat.label}
                  // Add these props:
                  fill
                  sizes="(max-width: 768px) 112px, 144px" 
                  className="w-full h-full object-cover"
                />

              </div>
              <span className="text-sm text-foreground text-center whitespace-nowrap font-medium">
                {cat.label}
              </span>
            </Link>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-card border border-border shadow-md flex items-center justify-center hover:bg-muted transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-foreground" />
        </button>
      </div>
      <div className="mt-6 border-b border-border" />
    </section>

    <div  className={`z-10000 transform transition-transform duration-300 ease-in-out ${searchModal ? "translate-x-0":"-translate-x-full"} md:hidden bg-white fixed  top-0 bottom-0 right-0 left-0 overflow-scroll`}>
              {/* Header */}
              <div className="shadow-lg flex items-center justify-between px-6 py-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">DBLKS</h1>
                <button
                  className="flex items-center justify-center w-5 h-5 cursor-pointer rounded-full bg-black hover:bg-red-600 transition-colors"
                  aria-label="Close"
                >
                  <X onClick = {toggleSearchModal} className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Main Content */}
              <div className="max-w-4xl mx-auto px-6 py-3">
                {/* Subtitle */}
                <p className="text-gray-700 text-sm font-medium mb-8">
                  Search for products and brands here.
                </p>

                {/* Products & Brands Search */}
                <div className="relative flex mb-6 border border-gray-300 rounded ">
                  <input
                    type="text"
                    placeholder="Search for products, brands and categories"
                    value={productsSearch} 
                    onChange={(e) => setProductsSearch(e.target.value)}
                    className="text-sm min-w-0 flex-1 px-4 py-2  text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />

                  <button
                    onClick={handleFullSearch}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded flex items-center justify-center transition-colors"
                    aria-label="Search products"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>

                {/* Services & Listings Search */}
                <div className="flex">
                  <input
                    type="text"
                    placeholder="Search for Services & Listings."
                    value={servicesSearch} 
                    onChange={(e) => setServicesSearch(e.target.value)}
                    className="text-sm min-w-0 flex-1 px-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={location} 
                    onChange={(e) => setLocation(e.target.value)}
                    className="text-sm min-w-0 w-32 px-4 py-2 border border-gray-300 rounded text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent"
                  />
                  <button
                   onClick={handleFullSearch}
                    className=" bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded flex items-center justify-center transition-colors"
                    aria-label="Search services"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </div>
          </div>
   </>
  );
};

export default menuItems;
