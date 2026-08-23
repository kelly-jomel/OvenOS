'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';

interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  quantity: number;
}

export default function PublicOrderForm() {
  const { bakery_id } = useParams();
  
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ [key: number]: number }>({});
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchInventory() {
      try {
        const { data } = await api.get(`/inventory/public/${bakery_id}`);
        setInventory(data);
      } catch (err) {
        console.error('Failed to load inventory', err);
      } finally {
        setInitialLoading(false);
      }
    };
    if (bakery_id) fetchInventory();
  }, [bakery_id]);

  const handleQuantityChange = (id: number, delta: number) => {
    setSelectedItems(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      
      const newItems = { ...prev };
      if (next === 0) {
        delete newItems[id];
      } else {
        newItems[id] = next;
      }
      return newItems;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Combine selected items and special instructions
    let finalItemsText = '';
    
    const selectedList = Object.entries(selectedItems).map(([idStr, qty]) => {
      const id = parseInt(idStr);
      const item = inventory.find(i => i.id === id);
      return item ? `${qty}x ${item.name}` : null;
    }).filter(Boolean);
    
    if (selectedList.length > 0) {
      finalItemsText += 'Selected Items:\n- ' + selectedList.join('\n- ') + '\n\n';
    }
    
    if (specialInstructions.trim()) {
      finalItemsText += 'Special Instructions / Others:\n' + specialInstructions;
    }
    
    if (!finalItemsText.trim()) {
      setError('Please select at least one item or provide special instructions.');
      setLoading(false);
      return;
    }

    try {
      await api.post(`/orders/public/${bakery_id}`, {
        customer_name: customerName,
        customer_phone: customerPhone,
        items: finalItemsText.trim(),
        source: 'website'
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-paper-white flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-md shadow-lg max-w-md w-full text-center border border-gray-200">
          <div className="w-16 h-16 bg-yield-green/20 text-yield-green rounded-full flex items-center justify-center text-3xl mx-auto mb-4">
            ✓
          </div>
          <h2 className="text-2xl font-brand font-bold text-ledger-navy mb-2">Order Received!</h2>
          <p className="text-ink-grey/80 mb-6 font-data">
            Thank you, {customerName}! We have received your request and will contact you shortly at {customerPhone}.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="text-ledger-navy font-semibold hover:text-jupiter-gold transition-colors underline"
          >
            Submit another order
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-paper-white py-12 px-4 sm:px-6 lg:px-8 flex justify-center font-data">
      <div className="max-w-md w-full">
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-brand font-bold text-ledger-navy tracking-tight mb-2">Place an Order</h1>
          <p className="text-ink-grey/70">Please select from our menu and fill out your details below.</p>
        </div>

        <div className="bg-white rounded-md shadow-md border border-gray-200 overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-100">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-ink-grey mb-1">
                  Your Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-jupiter-gold focus:border-jupiter-gold text-ink-grey transition-shadow"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-ink-grey mb-1">
                  WhatsApp Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-jupiter-gold focus:border-jupiter-gold text-ink-grey transition-shadow"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-brand font-semibold text-ledger-navy mb-3 uppercase tracking-wider">
                  Menu Selection
                </label>
                
                {initialLoading ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-jupiter-gold"></div>
                  </div>
                ) : inventory.length === 0 ? (
                  <p className="text-sm text-ink-grey/60 italic py-2">No menu items available at the moment. Please use the special instructions box below.</p>
                ) : (
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {inventory.map(item => {
                      const qty = selectedItems[item.id] || 0;
                      return (
                        <div key={item.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-md hover:border-jupiter-gold/50 transition-colors bg-paper-white/50">
                          <div>
                            <p className="font-medium text-ink-grey">{item.name}</p>
                            <p className="text-xs text-ink-grey/60">Per {item.unit}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-md overflow-hidden">
                            <button 
                              type="button" 
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="px-3 py-1 text-ink-grey hover:bg-gray-100 font-bold"
                            >
                              -
                            </button>
                            <span className="text-sm font-medium w-4 text-center">{qty}</span>
                            <button 
                              type="button" 
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="px-3 py-1 text-ink-grey hover:bg-gray-100 font-bold"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <label htmlFor="details" className="block text-sm font-medium text-ink-grey mb-1">
                  Special Instructions / Others
                </label>
                <p className="text-xs text-ink-grey/60 mb-2">Need a custom cake, allergy requirements, or a different item? Describe it here!</p>
                <textarea
                  id="details"
                  rows={4}
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-jupiter-gold focus:border-jupiter-gold text-ink-grey transition-shadow resize-none"
                  placeholder="E.g., No nuts please. Also I'd like a custom 2kg Spiderman cake."
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-brand font-bold text-ledger-navy bg-jupiter-gold hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-jupiter-gold transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-8"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-ledger-navy" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Order Request'
                )}
              </button>
            </form>
          </div>
          <div className="bg-paper-white p-4 border-t border-gray-200 text-center">
            <p className="text-xs text-ink-grey/70">
              Powered by <span className="font-brand font-bold text-ledger-navy">CrumbLedger</span>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
