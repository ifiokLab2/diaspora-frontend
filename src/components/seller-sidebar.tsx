import Link from 'next/link';

const menuItems = [
  { name: 'Overview', href: '/dashboard' },
  { name: 'Orders', href: '/dashboard/orders' },
  { name: 'Inventory', href: '/dashboard/inventory' },
  { name: 'Settings', href: '/dashboard/settings' },
];

export default function SellerSidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col h-full">
      <div className="p-6 text-xl font-bold border-b border-slate-800">
        Seller Central
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            className="block px-4 py-2 rounded hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
          >
            {item.name}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800">
        <Link href="/" className="text-xs text-slate-500 hover:text-blue-400 italic">
          ← Back to Main Shop
        </Link>
      </div>
    </aside>
  );
}