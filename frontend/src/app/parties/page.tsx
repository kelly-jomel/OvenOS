'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import { useBakery } from '@/context/BakeryContext';

interface Party {
  id: number;
  name: string;
  party_type: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  created_at: string;
  total_orders: number;
  balance: number;
}

export default function PartiesPage() {
  const [loading, setLoading] = useState(true);
  const { currencySymbol } = useBakery();
  const [parties, setParties] = useState<Party[]>([]);
  const [activeTab, setActiveTab] = useState<'customer' | 'supplier'>('customer');
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newParty, setNewParty] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    gstin_or_tax_id: '',
    is_b2b: false
  });
  
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

  async function fetchParties() {
    try {
      const res = await api.get('/parties/');
      setParties(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddParty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name: newParty.name,
        party_type: activeTab,
        phone: newParty.phone || null,
        email: newParty.email || null,
        address: newParty.address || null,
        gstin_or_tax_id: newParty.gstin_or_tax_id || null,
        is_b2b: newParty.is_b2b
      };
      await api.post('/parties/', payload);
      setIsModalOpen(false);
      setNewParty({ name: '', phone: '', email: '', address: '', gstin_or_tax_id: '', is_b2b: false });
      fetchParties();
    } catch (err: any) {
      console.error('Failed to add party', err);
      const msg = err.response?.data?.detail || err.message || 'Unknown error';
      alert(`Error adding party: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`);
    } finally {
      setIsSubmitting(false);
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
    <div className="min-h-screen bg-gray-50 font-sans pb-20 md:pb-0 relative">
      <TopNav title="Parties" />
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-[64px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-end">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 hover:bg-orange-200 transition-colors"
          >
            <span>+</span> Add {activeTab === 'customer' ? 'Customer' : 'Supplier'}
          </button>
        </div>
        {/* Tabs */}
        <div className="flex border-t border-gray-100 max-w-7xl mx-auto">
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
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <div className="relative">
          <input 
            type="text" 
            placeholder={`Search ${activeTab}s...`}
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
              <div 
                key={party.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setExpandedId(expandedId === party.id ? null : party.id)}
              >
                <div className="p-4 flex justify-between items-center">
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
                    <p className={`text-sm font-bold ${party.balance > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                      {currencySymbol}{party.balance.toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Balance</p>
                  </div>
                </div>
                
                {/* Expandable Details */}
                {expandedId === party.id && (
                  <div className="bg-gray-50 p-4 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Total Orders</p>
                      <p className="font-medium text-gray-900">{party.total_orders}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs mb-1">Customer Since</p>
                      <p className="font-medium text-gray-900">{new Date(party.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-500 text-xs mb-1">Address</p>
                      <p className="font-medium text-gray-900 whitespace-pre-wrap">{party.address || 'No address provided'}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Party Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Add New {activeTab === 'customer' ? 'Customer' : 'Supplier'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleAddParty} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input 
                  required
                  type="text" 
                  value={newParty.name}
                  onChange={e => setNewParty({...newParty, name: e.target.value})}
                  placeholder="e.g. John Doe or ACME Corp" 
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <input 
                    type="tel" 
                    value={newParty.phone}
                    onChange={e => setNewParty({...newParty, phone: e.target.value})}
                    placeholder="+91..." 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input 
                    type="email" 
                    value={newParty.email}
                    onChange={e => setNewParty({...newParty, email: e.target.value})}
                    placeholder="john@example.com" 
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                <textarea 
                  value={newParty.address}
                  onChange={e => setNewParty({...newParty, address: e.target.value})}
                  rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                ></textarea>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN / Tax ID (Optional)</label>
                <input 
                  type="text" 
                  value={newParty.gstin_or_tax_id}
                  onChange={e => setNewParty({...newParty, gstin_or_tax_id: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="is_b2b"
                  checked={newParty.is_b2b}
                  onChange={e => setNewParty({...newParty, is_b2b: e.target.checked})}
                  className="rounded text-orange-600 focus:ring-orange-500 border-gray-300"
                />
                <label htmlFor="is_b2b" className="text-sm text-gray-700">This is a B2B {activeTab}</label>
              </div>
              
              <div className="pt-2 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting ? 'Saving...' : `Save ${activeTab === 'customer' ? 'Customer' : 'Supplier'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}
