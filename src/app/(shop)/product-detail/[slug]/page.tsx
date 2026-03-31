import { notFound } from "next/navigation";
import ProductCard from "@/components/product-detail/product-card";
import ProductCardSmall from "@/components/product-detail/product-card-small";
import api from "@/lib/api";
import { cookies } from 'next/headers';

// 1. Define the Fetching Logic
async function getProduct(slug: string) {
 
  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;
  try {
    // Hits your Django endpoint: /products/<slug>/
     const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${slug}/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // If the user is logged in, pass the token so Django populates request.user
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      // ISR: Revalidate the data every 60 seconds
      next: { revalidate: 60 },
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
}

// 2. The Page Component
export default async function ProductDetailPage({  params }: { params: { slug: string } }) {
  const resolvedParams = await params; // Await params
  const data = await getProduct(resolvedParams.slug);

  const { product, related } = data;

  // If Django returns 404, show the Next.js 404 page
  if (!product) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background py-2 px-[6%] mt-15 md:mt-30 mb-20">
      
      <ProductCard product={product} />

      <section className="px-[6%] py-10 border-t">
        <h2 className="text-xl font-bold mb-6">You might also like</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {related.map((product: any, index: number) => (
            <ProductCardSmall key={index} {...product} />

          ))}
        </div>
      </section>
    </main>
  );
}

// 3. Dynamic Metadata (Great for SEO & Social Sharing)
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const resolvedParams = await params; // Await params
  const data = await getProduct(resolvedParams.slug);
  if (!data?.product) return { title: "Product Not Found" };

  const { product } = data;
  return {
    title: `${product.name} | Your Store`,
    description: product.description.slice(0, 160),
    openGraph: {
      images: [product.main_image],
    },
  };
}