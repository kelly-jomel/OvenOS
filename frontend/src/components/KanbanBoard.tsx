'use client';
import React, { useState, useEffect } from 'react';

// Types for our Kanban board
type Order = {
  id: number;
  display_id: string;
  customer_name: string;
  items: string;
  status: 'new' | 'preparing' | 'baking' | 'ready' | 'delivered';
  source: 'website' | 'whatsapp' | 'instagram';
};

const initialOrders: Order[] = [
  { id: 'ORD-001', customerName: 'Alice Smith', items: 'Chocolate Truffle Cake (1kg)', status: 'new', source: 'website' },
  { id: 'ORD-002', customerName: 'Rahul Verma', items: 'Red Velvet Cupcakes x6', status: 'preparing', source: 'whatsapp' },
  { id: 'ORD-003', customerName: 'Priya Sharma', items: 'Sourdough Loaf', status: 'baking', source: 'instagram' },
  { id: 'ORD-004', customerName: 'John Doe', items: 'Vanilla Buttercream Cake', status: 'ready', source: 'website' },
];

const COLUMNS = [
  { id: 'new', title: 'New Orders' },
  { id: 'preparing', title: 'Prep / Mixing' },
  { id: 'baking', title: 'Baking / Cooling' },
  { id: 'ready', title: 'Ready for Dispatch' },
  { id: 'delivered', title: 'Delivered' },
];

import api from '@/lib/api';

export default function KanbanBoard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders/');
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setError('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: number) => {
    e.dataTransfer.setData('orderId', id.toString());
  };

  const handleDrop = async (e: React.DragEvent, status: Order['status']) => {
    const id = parseInt(e.dataTransfer.getData('orderId'), 10);
    if (!id) return;
    
    // Optimistic update
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id ? { ...order, status } : order
      )
    );

    try {
      await api.patch(`/orders/${id}`, { status });
    } catch (err) {
      console.error('Failed to update order status:', err);
      // Revert on failure by refetching
      fetchOrders();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  if (loading) {
    return <div className="p-10 flex justify-center text-gray-500">Loading orders...</div>;
  }

  if (error) {
    return <div className="p-10 flex justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="flex gap-4 p-4 overflow-x-auto min-h-[70vh] bg-gray-50">
      {COLUMNS.map((col) => (
        <div
          key={col.id}
          className="flex-shrink-0 w-80 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col"
          onDrop={(e) => handleDrop(e, col.id as Order['status'])}
          onDragOver={handleDragOver}
        >
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50 rounded-t-xl">
            <h3 className="font-semibold text-gray-700">{col.title}</h3>
            <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-1 rounded-full">
              {orders.filter((o) => o.status === col.id).length}
            </span>
          </div>
          
          <div className="flex-1 p-3 space-y-3 overflow-y-auto">
            {orders
              .filter((order) => order.status === col.id)
              .map((order) => (
                <div
                  key={order.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, order.id)}
                  className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-500">{order.display_id}</span>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                      order.source === 'whatsapp' ? 'bg-green-100 text-green-700' :
                      order.source === 'instagram' ? 'bg-pink-100 text-pink-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {order.source}
                    </span>
                  </div>
                  <h4 className="font-medium text-gray-900">{order.customer_name}</h4>
                  <p className="text-sm text-gray-600 mt-1">{order.items}</p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}
