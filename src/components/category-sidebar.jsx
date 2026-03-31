import {
  ShoppingBag, Apple, Leaf, Briefcase, Droplets, Utensils, Circle,
  GlassWater, Home, Hotel, Moon, CalendarPlus, List, Building
} from "lucide-react";
import Link from 'next/link';

const productCategories = [
  { icon: ShoppingBag, label: "Meat & African Foods",link :"meat-african-foods" },
  { icon: Apple, label: "Fruits & Vegetables" ,link :"fruits-vegetables"},
  { icon: Leaf, label: "African Herbs & Spices",link :"african-herbs-spices" },
  { icon: Briefcase, label: "Hair Products" ,link :"hair-products"},
  { icon: Utensils, label: "Condiments" ,link :"condiments"},
  { icon: Circle, label: "Yam & Tubers" ,link :"yam-tubers"},
  { icon: GlassWater, label: "Drinks & Beverages",link :"drinks-beverages" },
];

const serviceCategories = [
  { icon: Building, label: "Real Estates" ,link :"real-estates"},
  { icon: Home, label: "Home Services",link :"home-services" },
  { icon: Hotel, label: "Hotels & Travel" ,link :"hotels-travels"},
  { icon: Moon, label: "Night Life" ,link :"night-life"},
  { icon: CalendarPlus, label: "Professional Service" ,link :"professional-service"},
  { icon: CalendarPlus, label: "Peligious Organization" ,link :"religious-organization"},
  //{ icon: CalendarPlus, label: "Create Event" ,link :"real-estates"},
  //{ icon: List, label: "Recent events" ,link :"real-estates"},
];

const CategorySidebar = () => {
  return (
    <aside className="bg-white hidden md:flex flex-col items-center justify-between  shrink-0 mr-[10px] p-5 ">
      {/* Products Header */}
      <div>
          <h3 className="text-primary-yellow text-sm font-semibold text-category-header mb-3">
            <Link href = "/" className = "flex items-center gap-2">
              <ShoppingBag className="h-4 w-4" />
              Products
            </Link>
          </h3>
          <ul className="space-y-2.5 mb-5">
            {productCategories.map((cat) => (
              <li key={cat.label}>
                <Link
                  href={`/products/category/${cat.link}`}
                  className="flex items-center gap-2 text-[.7rem] text-category-link hover:text-primary transition-colors"
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
      </div>

      {/* Listings Header */}
        <div>
          <h3 className=" text-primary-yellow text-sm font-semibold text-category-header mb-3">
            <Link href = "/listings" className = "flex items-center gap-2">
             <Droplets className="h-4 w-4" />
             Listings & Services
            </Link>
           
          </h3>
          <ul className="space-y-2.5">
            {serviceCategories.map((cat) => (
              <li key={cat.label}>
                <Link
                  href={`/listings/categories/${cat.link}/`}
                  className="flex items-center gap-2 text-[.7rem] text-category-link hover:text-primary transition-colors"
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
    </aside>
  );
};

export default CategorySidebar;
