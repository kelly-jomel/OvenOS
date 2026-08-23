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
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const { currencySymbol } = useBakery();
  const router = useRouter();

  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        fetchDashboardData();
      }
    });

    async function fetchDashboardData() {
      try {
        const res = await api.get('/dashboard/');
        setDashboardData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, [router]);

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const { summary, orders_by_customer, orders_by_month, trend_chart_data } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 md:pb-0">
      <TopNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Financial Summary Cards */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-emerald-100 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <span className="text-emerald-500">↑</span>
              <h3 className="text-sm font-medium">To Collect</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{currencySymbol}{summary.accounts_receivable.toFixed(2)}</p>
            <Link href="/parties?type=customer" className="text-xs text-emerald-600 font-medium mt-2 inline-block">View Details →</Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <span className="text-rose-500">↓</span>
              <h3 className="text-sm font-medium">To Pay</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{currencySymbol}{summary.accounts_payable.toFixed(2)}</p>
            <Link href="/parties?type=supplier" className="text-xs text-rose-600 font-medium mt-2 inline-block">View Details →</Link>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <span className="text-blue-500">📈</span>
              <h3 className="text-sm font-medium">Total Sales</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{currencySymbol}{summary.total_sales.toFixed(2)}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <span className="text-purple-500">🛒</span>
              <h3 className="text-sm font-medium">Total Orders</h3>
            </div>
            <p className="text-2xl font-bold text-gray-900">{summary.total_orders}</p>
          </div>
        </section>

        {/* 30-Day Revenue Trend Chart */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">30-Day Revenue vs Expenses</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trend_chart_data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} minTickGap={20} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any, name: any) => [`${currencySymbol}${Number(value).toFixed(2)}`, name]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpenses)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Orders Analytics Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Orders by Month */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Orders by Month</h2>
            {orders_by_month.length > 0 ? (
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={orders_by_month} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" name="Orders" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-gray-500">No data available</div>
            )}
          </div>

          {/* Orders by Customer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h2 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Top Customers</h2>
            {orders_by_customer.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {orders_by_customer.sort((a: any, b: any) => b.count - a.count).slice(0, 5).map((cust: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center py-3">
                    <span className="text-sm font-medium text-gray-900">{cust.name}</span>
                    <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-1 rounded-full">{cust.count} orders</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-gray-500">No customers yet</div>
            )}
          </div>
        </section>

        {/* Quick Actions Grid */}
        <section>
          <h2 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-3 md:gap-6">
            <Link href="/invoices" className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center text-xl text-blue-500">
                🧾
              </div>
              <span className="text-xs font-medium text-gray-700">Invoices</span>
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
      </main>
      <BottomNav />
    </div>
  );
}
