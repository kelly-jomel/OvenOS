'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import BottomNav from '@/components/BottomNav';

interface Party {
  id: number;
  name: string;
  party_type: string;
  phone: string | null;
  email: string | null;
}

export default function PartiesPage() {
  const [loading, setLoading] = useState(true);
  const [parties, setParties] = useState<Party[]>([]);
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        fetchParties();
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchParties = async () => {
    try {
      const res = await api.get('/parties/');
      setParties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredParties = parties.filter(p => p.party_type === activeTab);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 md:pb-0">
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">Parties</h1>
          <button className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <span>+</span> Add Party
          </button>
        </div>
        {/* Tabs */}
        <div className="flex border-t border-gray-100">
          <button 
            onClick={() => setActiveTab('customer')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'customer' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Customers
          </button>
          <button 
            onClick={() => setActiveTab('supplier')}
            className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'supplier' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            Suppliers
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search parties..." 
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <span className="absolute right-4 top-3 text-gray-400">🔍</span>
        </div>

        {filteredParties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
            <span className="text-4xl mb-2 block">👥</span>
            <p className="text-gray-500 text-sm">No {activeTab}s found.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredParties.map(party => (
              <div key={party.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
                    {party.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{party.name}</h3>
                    <p className="text-xs text-gray-500">{party.phone || 'No Phone'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">₹0.00</p>
                  <p className="text-xs text-gray-500">Balance</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <BottomNav />
    </div>
  );
}
