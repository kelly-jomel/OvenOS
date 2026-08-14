'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import api from '@/lib/api';
import BottomNav from '@/components/BottomNav';
import TopNav from '@/components/TopNav';
import { useBakery } from '@/context/BakeryContext';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const { currencySymbol } = useBakery();
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 md:pb-0">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Financial Summary Cards */}
        <section className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <span className="text-emerald-500">↑</span>
              <h3 className="text-sm font-medium">To Collect</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{currencySymbol}0.00</p>
            <Link href="/parties?type=customer" className="text-xs text-emerald-600 font-medium mt-2 inline-block">View Details →</Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <span className="text-rose-500">↓</span>
              <h3 className="text-sm font-medium">To Pay</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{currencySymbol}0.00</p>
            <Link href="/parties?type=supplier" className="text-xs text-rose-600 font-medium mt-2 inline-block">View Details →</Link>
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3 md:gap-6">
            <Link href="/billing" className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-2xl text-indigo-600 shadow-sm border border-indigo-100 hover:bg-indigo-100 transition-colors">
                🧾
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">Add Sale</span>
            </Link>
            
            <Link href="/purchases" className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-2xl text-emerald-600 shadow-sm border border-emerald-100 hover:bg-emerald-100 transition-colors">
                🛒
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">Add Purchase</span>
            </Link>

            <Link href="/parties" className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-2xl text-amber-600 shadow-sm border border-amber-100 hover:bg-amber-100 transition-colors">
                👥
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">Add Party</span>
            </Link>

            <Link href="/inventory" className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-2xl text-rose-600 shadow-sm border border-rose-100 hover:bg-rose-100 transition-colors">
                📦
              </div>
              <span className="text-xs font-medium text-gray-700 text-center">Add Item</span>
            </Link>
          </div>
        </section>

        {/* Business Metrics */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Today's Overview</h2>
            <select className="text-xs bg-gray-50 border border-gray-200 rounded p-1 outline-none text-gray-700">
              <option>Today</option>
              <option>Yesterday</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Sales</p>
              <p className="text-lg font-bold text-gray-900">{currencySymbol}0.00</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">Purchases</p>
              <p className="text-lg font-bold text-gray-900">{currencySymbol}0.00</p>
            </div>
          </div>
        </section>

        {/* Storefront Upsell Banner */}
        <section className="bg-gradient-to-r from-orange-600 to-yellow-500 rounded-xl shadow-md p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold">Want Your Own E-Commerce Website?</h2>
            <p className="text-sm opacity-90">Get a fully custom branded website with online ordering and payment gateway for just {currencySymbol}8,000.</p>
          </div>
          <button 
            onClick={async () => {
              try {
                const res = await api.post('/storefront/request');
                alert(res.data.message || 'Request sent! We will contact you soon.');
              } catch (e) {
                alert('Failed to send request. Please try again.');
              }
            }}
            className="bg-white text-orange-600 px-6 py-2 rounded-lg font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors whitespace-nowrap"
          >
            I'm Interested
          </button>
        </section>

      </main>

      <BottomNav />
    </div>
  );
}
