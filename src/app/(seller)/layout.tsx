// app/(seller)/layout.tsx
import { ThemeProvider } from '@/components/theme-provider';


export default function SellerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen bg-gray-50">
       <ThemeProvider storageKey="seller-theme" attribute="class" defaultTheme="dark" enableSystem>
          {children}
        </ThemeProvider>
    </div>
  );
}