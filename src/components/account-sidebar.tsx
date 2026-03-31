import { User, ShoppingBag, Heart, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const navItems = [
  { icon: User, label: "My Account", active: true ,href:"/account/"},
  { icon: ShoppingBag, label: "Orders", active: false ,href:"/customer/account/orders/"},
  { icon: Heart, label: "Saved Items", active: false,href:"/save-later/" },
];

const AccountSidebar = () => {
    const { user, logout, isAuthenticated } = useAuth();
  return (
    <div className="self-start w-full  lg:w-60 shrink-0 rounded-md border border-border bg-card p-4">
      <nav className="space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm font-medium transition-colors hover:bg-accent ${
              item.active ? "text-primary" : "text-foreground"
            }`}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        ))}
      </nav>
      <Separator className="my-3" />
      <div
        onClick={logout}
        className="cursor-pointer flex items-center  justify-center rounded px-3 py-1  text-sm font-medium text-foreground transition-colors hover:bg-accent"
      >
        Logout
      </div>
    </div>
  );
};

export default AccountSidebar;
