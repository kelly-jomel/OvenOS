'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TopNavProps {
  title?: string;
}

export default function TopNav({ title }: TopNavProps) {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Customers', path: '/parties' },
    { name: 'Purchases', path: '/purchases' },
    { name: 'Billing', path: '/billing' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Profile', path: '/profile' },
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Brand Name */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 font-bold text-lg">
            O
          </div>
          <div>
            <h1 className="text-sm sm:text-lg font-bold text-gray-900 leading-tight">
              OvenOS <span className="text-xs sm:text-sm font-normal text-gray-500">{title ? `/ ${title}` : ''}</span>
            </h1>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.path}
              className={`text-sm font-medium transition-colors ${pathname === item.path ? 'text-orange-600' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        {/* Right side actions */}
        <div className="flex gap-4">
          <button onClick={() => alert("Search functionality coming soon!")} className="text-gray-500 hover:text-gray-900 text-xl cursor-pointer">🔍</button>
          <button onClick={() => alert("Notifications coming soon!")} className="text-gray-500 hover:text-gray-900 text-xl relative cursor-pointer">
            🔔
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
