'use client';

import React, { useEffect, useState } from 'react';
import SideNav from '@/components/SideNav';
import BottomNav from '@/components/BottomNav';
import { useBakery } from '@/context/BakeryContext';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import Link from 'next/link';
import { TrendingUp, Activity, CreditCard, Wallet, FileText, UserPlus, FileBarChart, ArrowDownRight, PieChart } from 'lucide-react';

export default function Dashboard() {
  const { profile } = useBakery();
  const [loading, setLoading] = useState(true);
  
  const [summary, setSummary] = useState({
    total_revenue: 0,
    pending_receivables: 0,
    total_expenses: 0,
    net_cash_position: 0,
  });

  const [trendChartData, setTrendChartData] = useState<any[]>([]);
  const [recentClients, setRecentClients] = useState<any[]>([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!profile?.id) return;
      
      try {
        // Fetch Invoices
        const invoicesQuery = query(collection(db, 'invoices'), where('bakery_id', '==', profile.id));
        const invoicesSnap = await getDocs(invoicesQuery);
        let totalRevenue = 0;
        let pendingReceivables = 0;
        const revenueByDate: Record<string, number> = {};

        invoicesSnap.forEach(doc => {
          const data = doc.data();
          const amount = data.total || data.amount || 0;
          if (data.status === 'paid') {
            totalRevenue += amount;
          } else {
            pendingReceivables += amount;
          }
          
          if (data.created_at) {
            const dateStr = data.created_at.toDate().toISOString().split('T')[0];
            revenueByDate[dateStr] = (revenueByDate[dateStr] || 0) + amount;
          }
        });

        // Fetch Purchases/Expenses
        const purchasesQuery = query(collection(db, 'purchases'), where('bakery_id', '==', profile.id));
        const purchasesSnap = await getDocs(purchasesQuery);
        let totalExpenses = 0;
        const expensesByDate: Record<string, number> = {};
        
        purchasesSnap.forEach(doc => {
          const data = doc.data();
          const amount = data.total || data.amount || 0;
          totalExpenses += amount;
          
          if (data.created_at) {
            const dateStr = data.created_at.toDate().toISOString().split('T')[0];
            expensesByDate[dateStr] = (expensesByDate[dateStr] || 0) + amount;
          }
        });

        // Fetch Recent Clients
        const clientsQuery = query(collection(db, 'clients'), where('bakery_id', '==', profile.id), orderBy('created_at', 'desc'), limit(3));
        const clientsSnap = await getDocs(clientsQuery);
        const clientsData = clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Build 30 day chart data
        const chartData = [];
        for (let i = 29; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const shortDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          
          chartData.push({
            date: shortDate,
            Incoming: revenueByDate[dateStr] || 0,
            Outgoing: expensesByDate[dateStr] || 0
          });
        }
        
        setSummary({
          total_revenue: totalRevenue,
          pending_receivables: pendingReceivables,
          total_expenses: totalExpenses,
          net_cash_position: totalRevenue - totalExpenses
        });
        
        setTrendChartData(chartData);
        setRecentClients(clientsData);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [profile?.id]);

  const currencySymbol = profile?.currency_symbol || '₹';

  if (loading) {
    return (
      <div className="min-h-screen lg:pl-64 bg-[#f8f9fb] font-sans pb-20 md:pb-0 flex items-center justify-center">
        <SideNav title="Dashboard" />
        <div className="text-gray-400">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:pl-64 bg-[#f8f9fb] font-sans pb-20 md:pb-0">
      <SideNav title="Dashboard" />
      
      <main className="max-w-7xl mx-auto p-6 space-y-6">
        
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-between h-32">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-green-50 rounded-full"></div>
            <div className="w-10 h-10 rounded-xl bg-green-100 text-green-600 flex items-center justify-center mb-2 z-10">
              <TrendingUp size={20} />
            </div>
            <div className="z-10">
              <p className="text-xs text-gray-500 font-medium mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">{currencySymbol}{summary.total_revenue.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-between h-32">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-orange-50 rounded-full"></div>
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center mb-2 z-10">
              <Activity size={20} />
            </div>
            <div className="z-10">
              <p className="text-xs text-gray-500 font-medium mb-1">Pending Receivables</p>
              <h3 className="text-2xl font-bold text-gray-900">{currencySymbol}{summary.pending_receivables.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-between h-32">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-red-50 rounded-full"></div>
            <div className="w-10 h-10 rounded-xl bg-red-100 text-red-500 flex items-center justify-center mb-2 z-10">
              <CreditCard size={20} />
            </div>
            <div className="z-10">
              <p className="text-xs text-gray-500 font-medium mb-1">Total Expenses</p>
              <h3 className="text-2xl font-bold text-gray-900">{currencySymbol}{summary.total_expenses.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative overflow-hidden flex flex-col justify-between h-32">
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-50 rounded-full"></div>
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center mb-2 z-10">
              <Wallet size={20} />
            </div>
            <div className="z-10">
              <p className="text-xs text-gray-500 font-medium mb-1">Net Cash Position</p>
              <h3 className="text-2xl font-bold text-gray-900">{currencySymbol}{summary.net_cash_position.toLocaleString()}</h3>
            </div>
          </div>

        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Cash Flow Overview</h2>
                <p className="text-sm text-gray-500">Your incoming vs outgoing cash flow.</p>
              </div>
              <div className="flex gap-4 text-xs font-medium text-gray-600">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Incoming</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Outgoing</div>
              </div>
            </div>
            
            <div className="flex-1 min-h-[250px] w-full bg-[#fcfcfc] rounded-xl flex flex-col items-center justify-center">
              {summary.total_revenue > 0 || summary.total_expenses > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorIncoming" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorOutgoing" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f87171" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f87171" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} minTickGap={20} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any, name: any) => [`${currencySymbol}${Number(value).toFixed(2)}`, name]}
                    />
                    <Area type="monotone" dataKey="Incoming" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIncoming)" />
                    <Area type="monotone" dataKey="Outgoing" stroke="#f87171" strokeWidth={3} fillOpacity={1} fill="url(#colorOutgoing)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-gray-400">
                  <div className="w-12 h-12 mx-auto mb-3 opacity-20 border-l-4 border-b-4 border-gray-400 border-solid flex items-end justify-between p-1">
                     <div className="w-2 h-4 bg-gray-400"></div>
                     <div className="w-2 h-6 bg-gray-400"></div>
                     <div className="w-2 h-3 bg-gray-400"></div>
                  </div>
                  <p className="text-sm">Add more transactions to generate your chart.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4 flex-1">
              <Link href="/invoices" className="border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow text-center h-[110px]">
                <div className="w-10 h-10 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
                <span className="text-xs font-medium text-gray-600">New Invoice</span>
              </Link>
              <Link href="/purchases/expenses" className="border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow text-center h-[110px]">
                <div className="w-10 h-10 bg-red-50 text-red-400 rounded-full flex items-center justify-center">
                  <ArrowDownRight size={18} />
                </div>
                <span className="text-xs font-medium text-gray-600">Add Expense</span>
              </Link>
              <Link href="/clients" className="border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow text-center h-[110px]">
                <div className="w-10 h-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                  <UserPlus size={18} />
                </div>
                <span className="text-xs font-medium text-gray-600">Add Client</span>
              </Link>
              <Link href="/reports" className="border border-gray-100 rounded-xl p-4 flex flex-col items-center justify-center gap-3 hover:shadow-md transition-shadow text-center h-[110px]">
                <div className="w-10 h-10 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center">
                  <Activity size={18} />
                </div>
                <span className="text-xs font-medium text-gray-600">View Reports</span>
              </Link>
            </div>
          </div>
          
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-400 p-8 text-white flex flex-col justify-center relative overflow-hidden">
            <div className="relative z-10 max-w-lg">
              <h2 className="text-2xl font-bold mb-3">Grow your business with CRM</h2>
              <p className="text-blue-50 text-sm mb-6 leading-relaxed">
                Connect your finances directly to your sales pipeline. Manage leads, track deals, and convert them to invoices seamlessly.
              </p>
              <Link href="/crm/leads" className="inline-block bg-white text-blue-600 font-bold px-5 py-2.5 rounded-lg shadow hover:bg-gray-50 transition-colors text-sm">
                Launch CRM Web App
              </Link>
            </div>
            {/* Background Graphic */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20 hidden md:block">
               <PieChart size={160} strokeWidth={1} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Clients</h2>
            {recentClients.length > 0 ? (
              <div className="flex-1 space-y-4">
                {recentClients.map(client => (
                  <div key={client.id} className="flex justify-between items-center border-b border-gray-50 pb-3 last:border-0">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.email || client.phone}</p>
                    </div>
                    <Link href={`/clients`} className="text-blue-500 text-xs font-medium hover:underline">View</Link>
                  </div>
                ))}
                <div className="pt-2 text-center">
                  <Link href="/clients" className="text-xs text-blue-500 hover:underline">View All →</Link>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-3">
                  <UserPlus size={20} />
                </div>
                <p className="text-sm font-medium text-gray-900 mb-1">No clients yet</p>
                <p className="text-xs text-gray-500 mb-4 max-w-[200px]">Add your first client to start generating invoices.</p>
                <Link href="/clients" className="text-xs text-blue-500 font-medium hover:underline">Add Client →</Link>
              </div>
            )}
          </div>
          
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
