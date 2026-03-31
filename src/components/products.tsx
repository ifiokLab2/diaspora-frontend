import ProductCard from "@/components/product-card";
import { ChevronRight } from "lucide-react";
import { cookies } from 'next/headers';
import Link from 'next/link';

// 1. Define the Product interface based on your Django Model

interface Product {
  id: number;
  name: string;
  slug: string;
  category_name: string;
  description: string;
  main_image: string;
  price: number;            // Strict number to match ProductCard expectations
  discount_price: number;   // Strict number to match ProductCard expectations
  discount_percentage: number; 
  available: boolean;
  created_date: string;
  [key: string]: any; 
}

// 2. Type the fetch function to return a Promise of a Product array
async function getProducts(): Promise<Product[]> {
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error(`Error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();
    
    // Determine if data is an array or a paginated object
    const rawProducts = Array.isArray(data) ? data : data.results || [];

    // 3. TRANSFORM DATA: Convert string decimals from Django to JS Numbers
    return rawProducts.map((p: any) => ({
      ...p,
      price: Number(p.price) || 0,
      discount_price: Number(p.discount_price) || 0,
      discount_percentage: Number(p.discount_percentage) || 0,
    }));

  } catch (err) {
    console.error("Failed to load products", err);
    return [];
  }
}

const Products = async () => {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-background py-2 px-[6%]">
      {/* --- Arts Section --- */}
      <div className="max-w-6xl mx-auto py-6 space-y-6">
        <Link 
          href="/products/category/Arts/" 
          className="bg-[#FEE2CC] flex items-center justify-between px-5 py-3 rounded-sm cursor-pointer hover:opacity-90 transition-opacity"
        >
          <span className="text-sm font-medium text-foreground">Arts</span>
          <ChevronRight className="w-5 h-5 text-foreground" />
        </Link>

        {products.length > 0 && (
          <>
            {/* Filtered list for Arts */}
            {products.filter((product: Product) => product.category_name === "Arts").length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products
                  .filter((product: Product) => product.category_name === "Arts")
                  .slice(0, 4)
                  .map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-sm border-2 border-dashed">
                <p className="text-gray-400 text-sm">No art products found in the database.</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- General/Fashion Section --- */}
       <div className="max-w-6xl mx-auto py-6 space-y-6">
        <Link 
          href="/products/category/fashion/" 
          className="bg-[#FEE2CC] flex items-center justify-between px-5 py-3 rounded-sm cursor-pointer hover:opacity-90 transition-opacity"
        >
          <span className="text-sm font-medium text-foreground">Fashion</span>
          <ChevronRight className="w-5 h-5 text-foreground" />
        </Link>

        {products.length > 0 && (
          <>
            {/* Filtered list for Arts */}
            {products.filter((product: Product) => product.category_name === "Fashion").length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {products
                  .filter((product: Product) => product.category_name === "Fashion")
                  .slice(0, 4)
                  .map((product) => (
                    <ProductCard key={product.id} {...product} />
                  ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-sm border-2 border-dashed">
                <p className="text-gray-400 text-sm">No Fashion products found in the database.</p>
              </div>
            )}
          </>
        )}
      </div>
    
    </div>
  );
};

export default Products;