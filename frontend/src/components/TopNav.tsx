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
    { name: 'Recipes', path: '/recipes' },
  ];

  return (
    <header className="bg-ledger-navy shadow-md border-b border-ledger-navy sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Brand Name */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl text-white leading-tight flex items-baseline">
              <span className="font-brand font-semibold tracking-tight text-white">Crumb</span>
              <span className="font-data tracking-[0.15em] font-light text-white/80">Ledger</span>
              <span className="text-xs sm:text-sm font-normal text-gray-400 ml-2">{title ? `/ ${title}` : ''}</span>
            </h1>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.path}
              className={`text-sm font-medium transition-colors ${pathname === item.path ? 'text-jupiter-gold' : 'text-gray-300 hover:text-white'}`}
            >
              {item.name}
            </Link>
          ))}
        </nav>
        
        {/* Right side actions */}
        <div className="flex gap-4">
          <Link href="/profile" className="text-gray-300 hover:text-white text-xl cursor-pointer">👤</Link>
          <button onClick={() => alert("Notifications coming soon!")} className="text-gray-300 hover:text-white text-xl relative cursor-pointer">
            🔔
            <span className="absolute top-0 right-0 w-2 h-2 bg-yield-green rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
