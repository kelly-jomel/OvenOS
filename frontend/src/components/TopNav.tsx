'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useBakery } from '@/context/BakeryContext';

interface TopNavProps {
  title?: string;
}

export default function TopNav({ title }: TopNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useBakery();

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
    { name: 'Customers', path: '/parties' },
    { name: 'Purchases', path: '/purchases' },
    { name: 'Billing', path: '/billing' },
    { name: 'Products', path: '/products' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Recipes', path: '/recipes' },
  ];

  return (
    <header className="bg-ledger-navy shadow-md border-b border-ledger-navy sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Brand Name */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <img src="/logo.png" alt="CrumbLedger Logo" className="h-8 w-auto object-contain bg-white rounded-md p-1" />
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
        <div className="flex gap-4 items-center">
          <Link href="/upgrade" className="text-xs font-bold bg-jupiter-gold text-ledger-navy px-3 py-1.5 rounded-full hover:bg-yellow-400 transition hidden sm:block">
            Upgrade ⚡️
          </Link>
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
