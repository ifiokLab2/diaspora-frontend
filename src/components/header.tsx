"use client";
import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCartStore } from '@/store/useCartStore';
import api from '@/lib/api'; 
import { 
  Bookmark, Shirt, Utensils, Carrot, Leaf, Droplets, Scissors, 
  Package, Grid2x2, Apple, Wine, Calendar, Church, Store, Users, 
  Home, Hotel, UtensilsCrossed, X, ShoppingBag, Palette, Heart, 
  Search, User, HelpCircle, ShoppingCart, ChevronRight, ChevronDown, 
  ChevronUp, Menu 
} from "lucide-react";


const menuData = [
  {
    id:1,
    name:"Night Life",
    subs:["Clubbing","Hookup","Bars & Lounge"]
  },
  {
    id:2,
    name:"Arts & Entertainment",
    subs:["Musicians","DJs","Dancers","Waiters and Waitresses","Decorators","Cooks & Chefs"]
  },
  {
    id:3,
    name:"Home Services",
    subs:["Child minders","Painters","Cleaners","Movers and Van Hires","Gardener","Furniture Fixers"]
  },
  {
    id:4,
    name:"Restaurant",
    subs:["Jamaican Restaurants","Nigerian Restaurants"]
  },
  {
    id:5,
    name:"Professional Services",
    subs:["Accountants","Lawyers","Lesson Teachers","Project Manager","IT Developers","Business Consultants","Social Workers"]
  },
  {
    id:6,
    name:"Religious Organizations",
    subs:["Churches","Mosques","Worship" ,"Places"]
  },
  {
    id:7,
    name:"More",
    subs:["Hotels & Travels","Repair services", "Beauty & Fashion"]
  },

];

interface SubCategory {
  id: number;
  name: string;
  slug: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  subs: SubCategory[];
}
const SearchSuggestions = ({ suggestions, isSearching, close }: any) => {
  if (isSearching) return (
    <div className="absolute top-full left-0 right-0 bg-white p-3 shadow-lg border border-t-0 text-xs text-gray-500 z-[1001]">
      Searching...
    </div>
  );
  if (suggestions.length === 0) return null;

  return (
    <div className="absolute top-full left-0 right-0 bg-white shadow-xl border border-t-0 rounded-b-md z-[1001] max-h-64 overflow-y-auto">
      {suggestions.map((item: any) => (
        <Link 
          key={item.id} 
          href={`/product-detail/${item.slug}`}
          onClick={close}
          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 border-b last:border-0 transition-colors"
        >
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-sm text-gray-700">{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default function Header() {
  const { user, logout, isAuthenticated } = useAuth();
  const items = useCartStore((state) => state.items);
  // Calculate total items in cart (sum of quantities)
  const cartItemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const [userModal,setUserModal] = useState(false);
  const [helpModal,setHelpModal] = useState(false);
  const [sidebarOpen,setSideBarOpen] = useState(false);
  const [searchModal,setSearchModal] = useState(false);
  const [servicesSearch, setServicesSearch] = useState('')
  const [location, setLocation] = useState('')
  const router = useRouter();

  const [productsSearch, setProductsSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false)
  const [categories, setCategories] = useState<Category[]>([]);


  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await api.get('/listings/categories/menu/');
        setCategories(res.data);
      } catch (error) {
        console.error("Failed to load categories", error);
      } finally {
        //setLoading(false);
      }
    };
    fetchMenu();
  }, []);


  const visitCart = () => {
    if (!isAuthenticated) {
      router.push('/login/customer?callbackUrl=/cart/');
      return;
    }else{
      router.push('/cart/');
      return;
    }
   
  };

  const handleProductsSearch = () => {
    console.log('Products search:', productsSearch)
  }

  const handleServicesSearch = () => {
    console.log('Services search:', servicesSearch, 'Location:', location)
  }
  const toggleSearchModal  = ()=>{
    setSearchModal(!searchModal);
  };
  const toggleUserModal  = ()=>{
    setUserModal(!userModal);
  };
  const toggleSideBarModal  = ()=>{
    setSideBarOpen(!sidebarOpen);
  };
  const toggleHelpModal  = ()=>{
    setHelpModal(!helpModal);
  };

  

  // Debounce logic for Products
  useEffect(() => {
    if (productsSearch.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await api.get(`/products/suggestions/?q=${productsSearch}`);
        setSuggestions(data);
      } catch (err) {
        console.error("Suggestion error:", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [productsSearch]);

  /*const handleFullSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();

    // Attach all three if they exist
    if (productsSearch.trim()) params.set("search", productsSearch.trim());
    if (servicesSearch.trim()) params.set("service", servicesSearch.trim());
    if (location.trim()) params.set("location", location.trim());
    
    params.set("page", "1"); // Always reset to page 1

    const queryString = params.toString();
    
    // Logic: If Service/Location are filled, go to /services. Otherwise /products.
    const targetPath = (servicesSearch || location) ? '/services' : '/products';
    
    router.push(`${targetPath}?${queryString}`);
    
    setSearchModal(false);
    setSuggestions([]);
  };*/

  const handleFullSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const params = new URLSearchParams();
    setSearchModal(false); // Close mobile modal
    setSuggestions([]);    // Close desktop suggestions
    setShowSuggestions(false); // Hide the suggestion box

    // Attach all three if they exist
    if (productsSearch.trim()) params.set("search", productsSearch.trim());
    if (servicesSearch.trim()) params.set("listings", servicesSearch.trim());
    if (location.trim()) params.set("location", location.trim());
    
    params.set("page", "1"); // Always reset to page 1

    const queryString = params.toString();
    
    // Logic: If Service/Location are filled, go to /services. Otherwise /products.
    const targetPath = (servicesSearch || location) ? '/search/listings' : '/search/products';
    
    router.push(`${targetPath}?${queryString}`);
    //router.refresh();
    
    setSearchModal(false);
    setSuggestions([]);
  };


  return (
    <header className="fixed z-1000 shadow-lg bg-white top-0 right-0 left-0">
      <nav className="relative hidden md:flex w-full bg-topbar border-b border-border py-2 px-[6%]">
      {/* Desktop nav  max-w-[1400px] mx-auto items-center justify-between px-4 py-2 */}
      <div className="w-full  flex items-center justify-between gap-6 ">
          {categories.map((cat) => (
            <div
              onClick={() => router.push(`/listings/categories/${cat.slug}`)}
              key={cat.id}
              className=" group cursor-pointer flex items-center gap-1 text-[0.6rem] lg:text-sm  text-topbar-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {cat.name}
              <ChevronDown className="h-3.5 w-3.5" />

              <div 
                className=" p-4 grid gap-[5px] grid-cols-[repeat(auto-fit,minmax(250px,1fr))] z-50 invisible bg-white w-full group-hover:visible absolute left-0 right-0 top-7"
                onClick={(e) => e.stopPropagation()} // Prevents parent redirect when clicking sub-links
              >
                {cat.subs.map((sub)=>(
                  
                  <Link 
                      key={sub.id}
                     href={`/listings/categories/${sub.slug}`}
                      className="text-sm text-slate-500 hover:text-blue-700 hover:translate-x-1 transition-all block py-1"
                    >
                      {sub.name}
                    </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      {/* Mobile banner */}
      <div className="md:hidden text-center py-2 px-4 text-sm text-topbar-foreground">
        Shop now or find services and professionals.
      </div>
    </nav>

    <div className="max-w-[1400px] mx-auto flex items-center justify-between  py-4 px-[6%]">
        {/* Mobile: Hamburger + Logo */}
        <div className="flex items-center  ">
          <button onClick = {toggleSideBarModal}  className="md:hidden text-foreground">
            <Menu className="h-6 w-6" />
          </button>
          <Link href ="/" className="text-xl flex items-center font-bold text-foreground tracking-tight">
            <span className="hidden md:inline">DBLKS</span>
            <span className="md:hidden font-bold text-sm">DiasporaBlacks</span>
          </Link>
        </div>

        {/* Side Bar */}

        
          <div onClick = {toggleSideBarModal} className={`transform transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0":"-translate-x-full"} md:hidden  fixed bg-black/20 top-0 bottom-0 right-0 left-0`}>
          <div onClick = {(e)=>{e.stopPropagation()}} className="overflow-y-scroll h-full w-[80%] bg-white">
            <div className =" flex items-center justify-between shadow-lg px-4 py-6" >
              <Link href = "/" className="cursor-pointer font-bold">DBLKS</Link>
              <X onClick = {toggleSideBarModal} className="hover:text-primary-yellow h-6 w-6 cursor-pointer font-bold" />
            </div>

            <div className = "flex flex-col px-4 py-4">
             {user?.role ==="seller" ? (
                 <Link href = "/seller/dashboard/shop/profile" className = "flex items-center justify-between">
                <span className = "text-primary-yellow text-bold">
                  My DBLKS Account
                </span>
                 <ChevronRight className = "hover:text-primary-yellow" size = {18} strokeWidth = {3} />

              </Link>
              ):(
               <Link href = "/account/" className = "flex items-center justify-between">
                <span className = "text-primary-yellow text-bold">
                  My DBLKS Account
                </span>
                 <ChevronRight className = "hover:text-primary-yellow" size = {18} strokeWidth = {3} />

              </Link>
              )}

              <Link href = "/customer/account/orders/" className = "hover:text-primary-yellow flex items-center mb-1">
               <ShoppingBag className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                  Orders
                </span>
                 
              </Link>
               <Link href = "/save-later/" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Heart className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                  Saved Items
                </span>
                 
              </Link>
               <Link href = "/cart/" className = "hover:text-primary-yellow  flex items-center mb-1">
               <ShoppingCart className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                  ShoppingCart
                </span>
                 
              </Link>

              {isAuthenticated ? (
                 <button onClick={logout} className="hover:text-primary-yellow cursor-pointer flex items-center justify-center my-[10px]">
                   <span>Logout</span>
                 </button>
                 ):(
                  <Link href = "/login/customer/" className="hover:text-primary-yellow cursor-pointer flex items-center justify-center my-[10px]">
                   <span>Login</span>
                 </Link>
                 )}

            </div>

             <div className = "flex flex-col px-4 py-4">
              <Link href = "/" className = "flex items-center justify-between">
                <span className = "text-primary-yellow text-bold">
                  Products
                </span>
                 <ChevronRight className = "hover:text-primary-yellow" size = {18} strokeWidth = {3} />

              </Link>

              <Link href = "/products/category/arts/" className = "hover:text-primary-yellow flex items-center mb-1">
               <Palette className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                  Arts
                </span>
                 
              </Link>
               <Link href = "/products/category/fashion/" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Shirt className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                  Fashion
                </span>
                 
              </Link>
               <Link href = "/products/category/african-foods/" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Utensils className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                  African Foods
                </span>
                 
              </Link>
               <Link href = "/products/category/fruits-vegetable/" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Carrot className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                 Fruits & Vegetables
                </span>
                 
              </Link>
               <Link href = "/products/category/african-herbs-spice/" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Leaf className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                 African Herbs & Spice
                </span>
                 
              </Link>
               <Link href = "/products/category/lotions-skincare-products/" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Droplets className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                 Lotions & Skincare Products
                </span>
                 
              </Link>
               <Link href = "/products/category/hair-products/" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Scissors className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                  Hair Products
                </span>
                 
              </Link>
               <Link href = "/products/category/condiments/" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Package className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                 Condiments
                </span>
                 
              </Link>
               <Link href = "/products/category/yam-tubers/" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Grid2x2 className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                  Yam & Tubers
                </span>
                 
              </Link>
               <Link href = "/products/category/grain-flour-cereal/" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Apple className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                  Grain, Flour & Cereal
                </span>
                 
              </Link>
               <Link href = "/products/category/drinks-beverages/" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Wine className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                 Drinks & Beverages
                </span>
                 
              </Link>

            </div>

             <div className = "flex flex-col px-4 py-4">
              <Link href = "/listings/" className = "flex items-center justify-between">
                <span className = "text-primary-yellow text-bold">
                  Listings & Services
                </span>
                 <ChevronRight className = "hover:text-primary-yellow" size = {18} strokeWidth = {3} />

              </Link>

              <Link href = "/listings/categories/real-estates" className = "hover:text-primary-yellow flex items-center mb-1">
               <Calendar className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                 Real Estates
                </span>
                 
              </Link>
              
              
               <Link href = "/listings/categories/night-life" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Users className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                 Night Life
                </span>
                 
              </Link>
               <Link href = "/listings/categories/religious-organizations" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Church className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                Religious Organizations
                </span>
                 
              </Link>
               <Link href = "/listings/categories/home-services" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Home className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                 Home Services
                </span>
                 
              </Link>
               <Link href = "/listings/categories/hotels-travel" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Hotel className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                  Hotels & Travel
                </span>
                 
              </Link>
               <Link href = "/listings/categories/restaurants" className = "hover:text-primary-yellow  flex items-center mb-1">
               <UtensilsCrossed className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                 Restaurants
                </span>
                 
              </Link>
               <Link href = "/listings/categories/yam-tubers" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Grid2x2 className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                  Yam & Tubers
                </span>
                 
              </Link>
               <Link href = "/listings/categories/grain-flour-cereal" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Apple className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                  Grain, Flour & Cereal
                </span>
                 
              </Link>
               <Link href = "/listings/categories/drinks-beverages" className = "hover:text-primary-yellow  flex items-center mb-1">
               <Wine className="h-3.5 w-3.5 mr-2" />
                <span className = "text-[.75rem]">
                 Drinks & Beverages
                </span>
                 
              </Link>

            </div>
            <div className = "flex flex-col px-4 py-4">
              <Link href = "/contact" className = "flex items-center justify-between">
                <span className = "text-primary-yellow text-bold">
                  Customer Care
                </span>
                 <ChevronRight className = "hover:text-primary-yellow" size = {18} strokeWidth = {3} />

              </Link>

              <Link href = "/seller/dashboard/" className = "hover:text-primary-yellow flex items-center mb-1">
               
                <span className = "text-[.75rem]">
                 Sell on DiasporaBlack
                </span>
                 
              </Link>
              
            </div>
          </div>
          
          </div>
       
        

        {/* Search Bar - Desktop only */}
        <form onSubmit={handleFullSearch} className="hidden md:flex flex-1 max-w-[850px] relative">
          <div className="flex relative flex-[1.5] border border-border rounded-l-md overflow-visible">
            <input
              type="text"
              placeholder="Search products"
              value={productsSearch}
              onChange={(e) => setProductsSearch(e.target.value)}
         
              className="w-full px-4 py-2.5 border-y border-r border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary-yellow"
            />
            <SearchSuggestions 
              suggestions={suggestions} 
              isSearching={isSearching} 
              close={() => setSuggestions([])} 
            />
          </div>

          <input
            type="text"
            placeholder="Services & listings"
            value={servicesSearch}
            onChange={(e) => setServicesSearch(e.target.value)}
            
            className="flex-1 px-4 py-2.5 border-y border-r border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary-yellow"
          />

          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            
            className="w-32 lg:w-48 px-4 py-2.5 border-y border-r border-border text-sm focus:outline-none focus:ring-1 focus:ring-primary-yellow"
          />

          <button type="submit" className="px-6 py-2.5 bg-primary-yellow text-white font-semibold text-sm rounded-r-md hover:bg-opacity-90">
            Search
          </button>
        </form>

        {/* User Actions */}
        <div className="flex items-center shrink-0">
          {/* Mobile: search icon */}
          <button onClick = {toggleSearchModal} className="md:hidden text-foreground">
            <Search className="h-5 w-5" />
          </button>
          {/* mobile search*/}
          <div  className={`z-50 transform transition-transform duration-300 ease-in-out ${searchModal ? "translate-x-0":"-translate-x-full"} md:hidden bg-white fixed  top-0 bottom-0 right-0 left-0 overflow-scroll`}>
              {/* Header */}
              <div className="shadow-lg flex items-center justify-between px-6 py-6 border-b border-gray-200">
                <h1 className="text-2xl font-bold text-gray-900">DBLKS</h1>
                <button
                  onClick={toggleSearchModal}
                  className="flex items-center justify-center w-5 h-5 cursor-pointer rounded-full bg-black hover:bg-red-600 transition-colors"
                  aria-label="Close"
                >
                  <X  className="w-3 h-3 text-white" />
                </button>
              </div>

              {/* Main Content */}
              <form onSubmit = {handleFullSearch} className="max-w-4xl mx-auto px-6 py-3">
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
                    type = "submit"
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
                    type = "submit"
                    className=" bg-gray-800 hover:bg-gray-900 text-white px-6 py-3 rounded flex items-center justify-center transition-colors"
                    aria-label="Search services"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                </div>
              </form>
          </div>
          {/* Desktop: full user menu */}
          <div tabIndex={0} role="button" onClick = {toggleUserModal} className="relative hidden md:flex items-center gap-1.5 text-sm text-foreground hover:text-primary transition-colors">
            <User className="h-5 w-5" />
            Hi, {user?.first_name}
            {userModal ? (
               <ChevronUp className="h-3.5 w-3.5" />
              ) :(
               <ChevronDown className="h-3.5 w-3.5" />
              )}
            
            {userModal && (
              <div className = "fixed bg-black/20 top-0 bottom-0 left-0 right-0 z-10000">
                <div onClick = {(e)=>e.stopPropagation()} className="shadow-md p-4 flex flex-col border rounded-[6px] absolute bg-white w-60  top-22 right-20">
                 {!isAuthenticated && (
                    <>
                       <Link className = "text-center my-[10px] rounded-[6px] border-transparent bg-primary-yellow text-white py-[8px]" href = "/login/customer/" >Customer Login</Link>
                      <Link className = "text-center my-[10px] rounded-[6px] border-transparent bg-primary-yellow text-white py-[8px]" href = "/login/seller/" >Seller Login</Link>
                  
                    </>
                  )}
                 <Link className = "text-center my-[10px] rounded-[6px] border-transparent bg-primary-yellow text-white py-[8px]" href = "/seller/dashboard/" >Add Products  </Link>
                   
                 
                   {user?.role ==="seller" ? (
                        <Link href = "/seller/dashboard/shop/profile" className="hover:text-primary-yellow cursor-pointer flex items-center  my-[10px]">
                         <User className="h-5 w-5 mr-2" />
                         <span>My Accounts</span>
                       </Link>
                      
                    ):(
                      <Link href = "/account/" className="hover:text-primary-yellow cursor-pointer flex items-center  my-[10px]">
                       <User className="h-5 w-5 mr-2" />
                       <span>My Accounts</span>
                     </Link>
                    )}

                   <Link href = "/customer/account/orders/" className="hover:text-primary-yellow  cursor-pointer flex items-center my-[10px]">
                     <ShoppingBag className="h-3.5 w-3.5 mr-2" />
                     <span>Orders</span>
                   </Link>
                   <Link href = "/save-later/" className="hover:text-primary-yellow cursor-pointer flex items-center my-[10px]">
                     <Heart className="h-3.5 w-3.5 mr-2" />
                     <span>Saved Items</span>
                   </Link>
                   {isAuthenticated ? (
                   <button onClick={logout} className="hover:text-primary-yellow cursor-pointer flex items-center justify-center my-[10px]">
                     <span>Logout</span>
                   </button>
                   ):(
                    <Link href = "/login/customer/" className="hover:text-primary-yellow cursor-pointer flex items-center justify-center my-[10px]">
                     <span>Login</span>
                   </Link>
                   )}
                </div>
              </div>
            )}
            
          </div>
          {/* Mobile: user icon only */}
          <button onClick = {toggleSideBarModal} className="m-1 md:hidden text-foreground">
            <User className="h-5 w-5" />
          </button>
          <button onClick = {toggleHelpModal} className="hidden lg:flex items-center gap-1 text-foreground hover:text-primary transition-colors">
            <HelpCircle className="h-5 w-5" />
           
            {helpModal ? (
                 <ChevronUp className="h-3.5 w-3.5" />
                
              ):(
             <ChevronDown className="h-3.5 w-3.5" />
              )}

             {helpModal && (
              <div className = "fixed bg-black/20 top-0 bottom-0 left-0 right-0 z-10000">
                <div onClick = {(e)=>e.stopPropagation()} className="shadow-md p-4 flex flex-col border rounded-[6px] absolute bg-white w-60  top-22 right-20">
                  
                 

                   {user?.role ==="seller" ? (
                      <Link href = "/seller/dashboard/shop/profile" className="hover:text-primary-yellow cursor-pointer flex items-center  my-[10px]">
                         <HelpCircle className="h-5 w-5 mr-2" />
                         <span>My Accounts</span>
                       </Link>

                      
                    ):(
                       <Link href = "/account/" className="hover:text-primary-yellow cursor-pointer flex items-center  my-[10px]">
                         <HelpCircle className="h-5 w-5 mr-2" />
                         <span>My Accounts</span>
                       </Link>
                    )}

                   <Link href = "/customer/account/orders/" className="hover:text-primary-yellow cursor-pointer flex items-center my-[10px]">
                     <ShoppingBag className="h-3.5 w-3.5 mr-2" />
                     <span>Orders</span>
                   </Link>
                   
                </div>
              </div>
            )}
          </button>
          <button onClick = {visitCart} className="cursor-pointer relative text-foreground hover:text-primary transition-colors">
            <ShoppingCart  className="h-5 w-5" />
            {cartItemCount > 0 && (
             <span className="absolute -top-2 -right-2 bg-primary-yellow text-primary-foreground text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
            
          </button>
        </div>
      </div>
    </header>
  );
}