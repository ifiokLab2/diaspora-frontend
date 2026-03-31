// app/(shop)/layout.tsx
import Header from "@/components/header";
import Footer from "@/components/footer";
import BottomNav from "@/components/bottom-nav";
import { ThemeProvider } from '@/components/theme-provider';

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
   <ThemeProvider 
      storageKey="shop-theme" 
      defaultTheme="light"
      //defaultTheme="light" // Force sellers to start in light mode
      //forcedTheme="light"  // Use this if you want to DISABLE dark mode for sellers entirely
    >
      
        <div className="flex flex-col min-h-screen w-full">
          <Header /> 
          <main className="flex-grow">
            {children}
          </main>
           <BottomNav />
          <Footer />
        </div>
    </ThemeProvider>
  );
}
