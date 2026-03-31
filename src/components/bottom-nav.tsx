"use client";
import { Home, DollarSign, Megaphone, User } from "lucide-react";
import { usePathname } from 'next/navigation'; // Import usePathname
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

const BottomNav = () => {
  const { user } = useAuth();
  const pathname = usePathname(); // Get the current active path

  const tabs = [
    { icon: Home, label: "Home", link: '/' },
    { icon: DollarSign, label: "Sell", link: '/seller/dashboard' },
    { icon: Megaphone, label: "Post Ads", link: '/seller/dashboard/listings' },
    { 
      icon: User, 
      label: "Account", 
      link: user?.role === "seller" ? '/seller/dashboard/shop/profile' : '/account' 
    },
  ];

  return (
    <nav className="fixed block md:hidden bottom-0 left-0 right-0 bg-gray-900 z-50">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          
          // Logic to check if the current link is active
          // For Home ('/'), we check for exact match. 
          // For others, we check if the pathname starts with the link to keep parent tabs active.
          const isActive = tab.link === '/' 
            ? pathname === '/' 
            : pathname.startsWith(tab.link);

          return (
            <Link
              key={tab.label}
              href={tab.link}
              className="flex flex-col items-center gap-0.5 px-2 py-1"
            >
              <Icon
                className={`w-5 h-5 transition-colors ${
                  isActive ? "text-accent" : "text-gray-400"
                }`}
              />
              <span
                className={`text-[10px] transition-colors ${
                  isActive
                    ? "text-accent font-semibold"
                    : "text-gray-400"
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;