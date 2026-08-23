'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useBakery } from '@/context/BakeryContext';
import { Menu, X, ChevronDown, Bell, User } from 'lucide-react';

interface SideNavProps {
  title?: string;
}

export default function SideNav({ title }: SideNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useBakery();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    Sales: pathname.startsWith('/sales') || pathname === '/clients' || pathname === '/estimates' || pathname === '/invoices',
    Purchases: pathname.startsWith('/purchases'),
    CRM: pathname.startsWith('/crm')
  });

  useEffect(() => {
    if (!profile) return;
    const isProfileComplete = !!profile.trading_name;
    if (!isProfileComplete) {
      if (pathname !== '/profile') {
        router.push('/profile');
      }
      return;
    }
    if (isProfileComplete && pathname !== '/upgrade') {
      const createdDate = new Date(profile.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - createdDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 15 && profile.subscription_plan === 'free') {
        router.push('/upgrade');
      }
    }
  }, [profile, pathname, router]);

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { 
      name: 'Sales', 
      path: '/clients',
      subItems: [
        { name: 'Customers', path: '/clients' },
        { name: 'Estimates', path: '/estimates' },
        { name: 'Sales Orders', path: '/sales/sales-orders' },
        { name: 'Invoices', path: '/invoices' },
        { name: 'Payments Received', path: '/sales/payments-received' },
        { name: 'Credit Notes', path: '/sales/credit-notes' },
        { name: 'e-Way Bills', path: '/sales/eway-bills' },
      ]
    },
    { 
      name: 'Purchases', 
      path: '/purchases',
      subItems: [
        { name: 'Vendors', path: '/purchases/vendors' },
        { name: 'Expenses', path: '/purchases/expenses' },
        { name: 'Bills', path: '/purchases/bills' },
        { name: 'Recurring Bills', path: '/purchases/recurring-bills' },
        { name: 'Payments Made', path: '/purchases/payments-made' },
        { name: 'Vendor Credits', path: '/purchases/vendor-credits' },
      ]
    },
    { name: 'Accountant', path: '/accountant' },
    { name: 'Reports', path: '/reports' },
    { name: 'Products', path: '/products' },
    { name: 'Inventory', path: '/inventory' },
    { name: 'Recipes', path: '/recipes' },
    { 
      name: 'CRM', 
      path: '/crm/leads',
      subItems: [
        { name: 'Leads', path: '/crm/leads' },
        { name: 'Contacts', path: '/crm/contacts' },
        { name: 'Accounts', path: '/crm/accounts' },
        { name: 'Deals', path: '/crm/deals' },
        { name: 'Activities', path: '/crm/activities' },
      ]
    },
  ];

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-ledger-navy shadow-md border-b border-slate-800 sticky top-0 z-40">
        <div className="px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="h-8 w-auto bg-white rounded-md p-1" />
            <h1 className="text-lg text-white font-brand font-semibold tracking-tight">Crumb<span className="font-data font-light text-white/80">Ledger</span></h1>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-300 hover:text-white">
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Sidebar Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-64 bg-ledger-navy text-gray-300 z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} overflow-y-auto flex flex-col`}>
        {/* Brand */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
            <Image src="/logo.png" alt="Logo" width={32} height={32} className="h-8 w-auto bg-white rounded-md p-1" />
            <h1 className="text-xl text-white font-brand font-semibold tracking-tight">Crumb<span className="font-data font-light text-white/80">Ledger</span></h1>
          </Link>
          <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(item => {
            const isActive = item.subItems 
              ? item.subItems.some(sub => pathname === sub.path) || pathname.startsWith(item.path)
              : pathname === item.path;

            return (
              <div key={item.name}>
                {item.subItems ? (
                  <>
                    <button 
                      onClick={() => toggleMenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-slate-800 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                      {item.name}
                      <ChevronDown size={16} className={`transition-transform duration-200 ${expandedMenus[item.name] ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedMenus[item.name] && (
                      <div className="mt-1 ml-2 pl-3 border-l border-slate-700 space-y-1">
                        {item.subItems.map(sub => (
                          <Link
                            key={sub.name}
                            href={sub.path}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2 rounded-md text-sm transition-colors ${pathname === sub.path ? 'bg-slate-800 text-jupiter-gold font-medium' : 'text-gray-400 hover:text-white hover:bg-slate-800'}`}
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-slate-800 text-jupiter-gold' : 'hover:bg-slate-800 hover:text-white'}`}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-800 space-y-3">
          <Link href="/profile" className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover:bg-slate-800 hover:text-white transition-colors text-gray-300">
            <User size={18} /> Profile Settings
          </Link>
          <Link href="/upgrade" className="flex items-center justify-center gap-2 bg-jupiter-gold text-ledger-navy font-bold px-3 py-2 rounded-md hover:bg-yellow-400 transition-colors">
            Upgrade Plan ⚡️
          </Link>
        </div>
      </aside>
    </>
  );
}
