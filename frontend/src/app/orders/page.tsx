'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import SideNav from '@/components/SideNav';
import BottomNav from '@/components/BottomNav';
import { useBakery } from '@/context/BakeryContext';

interface Order {
  id: number;
  display_id: string;
  customer_name: string;
  customer_phone: string | null;
  items: string;
  status: string;
  source: string;
  delivery_date: string | null;
  created_at: string;
}

export default function OrdersPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [currentDate, setCurrentDate] = useState(new Date());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // New Order Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [itemsText, setItemsText] = useState('');
  const [deliveryDateStr, setDeliveryDateStr] = useState('');

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

  async function fetchOrders() {
    try {
      const response = await api.get('/orders/');
      setOrders(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let dDate = null;
      if (deliveryDateStr) {
        dDate = new Date(deliveryDateStr).toISOString();
      }
      
      const payload = {
        customer_name: customerName,
        customer_phone: customerPhone || null,
        items: itemsText,
        source: 'manual',
        delivery_date: dDate
      };
      
      await api.post('/orders/', payload);
      setIsModalOpen(false);
      
      // Reset form
      setCustomerName('');
      setCustomerPhone('');
      setItemsText('');
      setDeliveryDateStr('');
      
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert('Error creating order');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/orders/${id}`, { status: newStatus });
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getOrdersForDay = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    // Use local string match for simplicity
    const targetDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    return orders.filter(o => {
      if (!o.delivery_date) return false;
      // Convert UTC to local date string to match
      const orderDate = new Date(o.delivery_date);
      const oStr = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}-${String(orderDate.getDate()).padStart(2, '0')}`;
      return oStr === targetDateStr;
    });
  };

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  if (loading) {
    return (
      <div className="min-h-screen lg:pl-64 flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const calendarDays = generateCalendar();

  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Orders" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
            <p className="text-sm text-gray-500 mt-1">Track your upcoming fulfillments.</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white rounded-lg shadow-sm border p-1 flex">
              <button onClick={() => setView('calendar')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${view === 'calendar' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>Calendar</button>
              <button onClick={() => setView('list')} className={`px-4 py-1.5 rounded-md text-sm font-medium ${view === 'list' ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'}`}>List</button>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700 shadow-sm transition-colors">
              + New Order
            </button>
          </div>
        </div>

        {view === 'calendar' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-2 border rounded-md hover:bg-gray-100">←</button>
                <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 border rounded-md text-sm font-medium hover:bg-gray-100">Today</button>
                <button onClick={nextMonth} className="p-2 border rounded-md hover:bg-gray-100">→</button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 border-b">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="p-2 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider border-r last:border-r-0">{d}</div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 auto-rows-fr">
              {calendarDays.map((day, idx) => {
                const dayOrders = day ? getOrdersForDay(day) : [];
                const isToday = day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear();
                
                return (
                  <div key={idx} className={`min-h-[100px] p-2 border-r border-b last:border-r-0 ${!day ? 'bg-gray-50' : ''} ${isToday ? 'bg-orange-50/30' : ''}`}>
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isToday ? 'text-orange-600' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {dayOrders.map(o => (
                            <div key={o.id} className="text-xs p-1 rounded bg-orange-100 text-orange-800 truncate border border-orange-200" title={`${o.customer_name}: ${o.items}`}>
                              {o.customer_name}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {view === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {orders.length === 0 ? (
              <div className="p-12 text-center text-gray-500">No orders found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {orders.sort((a,b) => (b.delivery_date || '').localeCompare(a.delivery_date || '')).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.display_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.delivery_date ? new Date(order.delivery_date).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                          <div className="text-xs text-gray-500">{order.customer_phone}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{order.items}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select 
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className={`text-xs font-bold rounded-full px-3 py-1 outline-none border-none
                              ${order.status === 'new' ? 'bg-blue-100 text-blue-800' : ''}
                              ${order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' : ''}
                              ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : ''}
                              ${!['new','preparing','delivered'].includes(order.status) ? 'bg-gray-100 text-gray-800' : ''}
                            `}
                          >
                            <option value="new">New</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </main>

      {/* Add Order Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900">Add New Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              <form id="add-order-form" onSubmit={handleAddOrder} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                  <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery/Fulfillment Date *</label>
                  <input required type="datetime-local" value={deliveryDateStr} onChange={e => setDeliveryDateStr(e.target.value)} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Items Ordered *</label>
                  <textarea required value={itemsText} onChange={e => setItemsText(e.target.value)} placeholder="E.g., 1x Chocolate Cake, 12x Cupcakes" rows={3} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"></textarea>
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium border rounded-lg hover:bg-white">Cancel</button>
              <button type="submit" form="add-order-form" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50">
                {isSubmitting ? 'Saving...' : 'Save Order'}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
