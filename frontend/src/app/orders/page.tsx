'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';

type Order = {
  id: number;
  display_id: string;
  customer_name: string;
  customer_phone?: string;
  items: string;
  status: string;
  source: string;
  created_at: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        fetchOrders();
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders/');
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId: number, status: string) => {
    try {
      await api.patch(`/orders/${orderId}`, { status });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const generateInvoice = (order: Order) => {
    const query = new URLSearchParams({
      party_name: order.customer_name,
      party_phone: order.customer_phone || '',
      item_name: 'Custom Order',
      description: order.items
    }).toString();
    router.push(`/billing?${query}`);
  };

  const statusColors: Record<string, string> = {
    new: 'bg-blue-100 text-blue-800',
    preparing: 'bg-yellow-100 text-yellow-800',
    baking: 'bg-orange-100 text-orange-800',
    ready: 'bg-green-100 text-green-800',
    delivered: 'bg-gray-100 text-gray-800',
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 md:pb-0">
      <TopNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Orders Dashboard</h1>
        </div>

        <div className="grid gap-4">
          {orders.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <p className="text-gray-500">No orders yet.</p>
            </div>
          ) : (
            orders.map(order => (
              <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-xs font-bold text-gray-500 uppercase">{order.display_id} • {order.source}</span>
                    <h3 className="text-lg font-bold text-gray-900">{order.customer_name}</h3>
                    {order.customer_phone && <p className="text-sm text-gray-600">{order.customer_phone}</p>}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${statusColors[order.status.toLowerCase()] || 'bg-gray-100'}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded p-3 my-3">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{order.items}</p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <select 
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1 outline-none"
                  >
                    <option value="new">New</option>
                    <option value="preparing">Preparing</option>
                    <option value="baking">Baking</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                  </select>

                  <button 
                    onClick={() => generateInvoice(order)}
                    className="bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
                  >
                    Generate Invoice
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  );
}
