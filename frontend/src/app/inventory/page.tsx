'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Not logged in, redirect to login page
        router.push('/login');
      } else {
        // Logged in, show page
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
                <Link href="/inventory" className="border-orange-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Inventory
                </Link>
                <Link href="/billing" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Billing
                </Link>
                <Link href="/recipes" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Recipes
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <button className="bg-gray-100 p-2 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </button>
              <div className="ml-3 relative flex-shrink-0">
                <div>
                  <Link href="/profile">
                    <button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                      <img className="h-8 w-8 rounded-full" src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" />
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-12 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-12 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 mb-6">
            <span className="text-4xl">📦</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inventory Management</h2>
          <p className="text-gray-500 max-w-lg mx-auto">
            This module is currently under construction. Soon you'll be able to track raw ingredients, calculate batch costs, and get low-stock alerts right here.
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
