'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useBakery } from '@/context/BakeryContext';
import { Menu, X } from 'lucide-react';

interface TopNavProps {
  title?: string;
}

export default function TopNav({ title }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useBakery();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!profile) return;

    const isProfileComplete = !!profile.trading_name;

    // Priority 1: Enforce profile completion
    if (!isProfileComplete) {
      if (pathname !== '/profile') {
        router.push('/profile');
      }
      return; // Stop further checks if profile is incomplete
    }

    // Priority 2: Enforce subscription after 15 days
    if (isProfileComplete && pathname !== '/upgrade') {
      const createdDate = new Date(profile.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      const isTrialExpired = diffDays > 15;
      const isFreePlan = profile.subscription_plan === 'free';
      
      if (isTrialExpired && isFreePlan) {
        router.push('/upgrade');
      }
    }
  }, [profile, pathname, router]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'CRM', path: '/crm/leads' },
    { name: 'Clients', path: '/clients' },
    { name: 'Invoices', path: '/invoices' },
    { name: 'Estimates', path: '/estimates' },
    { name: 'Purchases', path: '/purchases' },
    { name: 'Products', path: '/products' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Recipes', path: '/recipes' },
  ];

  return (
    <header className="bg-ledger-navy shadow-md border-b border-ledger-navy sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Brand Name */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image src="/logo.png" alt="CrumbLedger Logo" width={32} height={32} className="h-8 w-auto object-contain bg-white rounded-md p-1" />
          <div className="hidden sm:block">
            <h1 className="text-xl sm:text-2xl text-white leading-tight flex items-baseline">
              <span className="font-brand font-semibold tracking-tight text-white">Crumb</span>
              <span className="font-data tracking-[0.15em] font-light text-white/80">Ledger</span>
              <span className="text-xs sm:text-sm font-normal text-gray-400 ml-2">{title ? `/ ${title}` : ''}</span>
            </h1>
          </div>
          <div className="block sm:hidden">
             <h1 className="text-lg text-white leading-tight flex items-baseline">
               <span className="font-brand font-semibold tracking-tight text-white">Crumb</span>
             </h1>
          </div>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-6">
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
        <div className="flex gap-4 items-center">
          <Link href="/upgrade" className="text-xs font-bold bg-jupiter-gold text-ledger-navy px-3 py-1.5 rounded-full hover:bg-yellow-400 transition hidden sm:block">
            Upgrade ⚡️
          </Link>
          <Link href="/profile" className="text-gray-300 hover:text-white text-xl cursor-pointer hidden sm:block">👤</Link>
          <button onClick={() => alert("Notifications coming soon!")} className="text-gray-300 hover:text-white text-xl relative cursor-pointer hidden sm:block">
            🔔
            <span className="absolute top-0 right-0 w-2 h-2 bg-yield-green rounded-full"></span>
          </button>
          
          {/* Mobile menu button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden text-gray-300 hover:text-white focus:outline-none"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      
      {/* Mobile Navigation Dropdown */}
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:hidden bg-ledger-navy border-t border-slate-800 shadow-xl absolute w-full left-0 max-h-[calc(100vh-4rem)] overflow-y-auto`}>
        <div className="px-4 py-4 space-y-1">
          {navItems.map((item) => (
            <Link 
              key={item.name} 
              href={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block px-3 py-3 rounded-md text-base font-medium transition-colors ${pathname === item.path ? 'bg-slate-800 text-jupiter-gold' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 mt-2 border-t border-slate-700 flex flex-col space-y-3">
             <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-slate-800 hover:text-white rounded-md">
                👤 Profile Settings
             </Link>
             <Link href="/upgrade" onClick={() => setIsMobileMenuOpen(false)} className="text-center bg-jupiter-gold text-ledger-navy font-bold py-3 rounded-md shadow-md mt-2">
                Upgrade Plan ⚡️
             </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
