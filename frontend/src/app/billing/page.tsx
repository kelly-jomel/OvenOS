'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <img src="/logo.png" alt="OvenOS Logo" className="h-8 w-auto object-contain" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-500">
                  OvenOS
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/inventory" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Inventory
                </Link>
                <Link href="/billing" className="border-orange-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Billing
                </Link>
                <Link href="/recipes" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Recipes
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative flex-shrink-0">
                <Link href="/profile">
                  <button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                    <img className="h-8 w-8 rounded-full" src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-12 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 mb-6">
            <span className="text-4xl">💳</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Billing & Invoices</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            This module is currently under construction. Soon you'll be able to send professional invoices, track deposits, and manage your bakery's finances here.
          </p>
          <div className="mt-8">
            <Link href="/dashboard" className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700">
              Return to Dashboard
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
