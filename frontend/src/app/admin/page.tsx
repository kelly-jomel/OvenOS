'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Subscriber {
  bakery_id: number;
  trading_name: string;
  country: string;
  owner_email: string;
  owner_name: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_start_date: string | null;
  subscription_end_date: string | null;
}

export default function AdminDashboard() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Filters
  const [filterCountry, setFilterCountry] = useState('All');
  const [filterPlan, setFilterPlan] = useState('All');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        fetchSubscribers();
      }
    });

    async function fetchSubscribers() {
      try {
        const response = await api.get('/admin/subscribers');
        setSubscribers(response.data);
      } catch (err: any) {
        if (err.response?.status === 403) {
          setError('You do not have permission to view this page. Super Admin only.');
        } else if (err.response?.data?.detail) {
          setError(`Error: ${err.response.data.detail}`);
        } else {
          setError(`Failed to load subscribers. Status: ${err.response?.status || 'Network Error'}`);
        }
      } else {
          setError('Failed to load subscribers.');
        }
      } finally {
        setLoading(false);
      }
    };

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const handleExportCSV = () => {
    const headers = ['Bakery ID', 'Trading Name', 'Country', 'Owner Email', 'Owner Name', 'Plan', 'Status', 'Start Date', 'End Date'];
    const rows = filteredSubscribers.map(sub => [
      sub.bakery_id,
      `"${sub.trading_name.replace(/"/g, '""')}"`,
      sub.country,
      sub.owner_email,
      `"${sub.owner_name.replace(/"/g, '""')}"`,
      sub.subscription_plan,
      sub.subscription_status,
      sub.subscription_start_date || '',
      sub.subscription_end_date || ''
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crumbledger_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Memoized computations
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(sub => {
      if (filterCountry !== 'All' && sub.country !== filterCountry) return false;
      if (filterPlan !== 'All' && sub.subscription_plan !== filterPlan) return false;
      return true;
    });
  }, [subscribers, filterCountry, filterPlan]);

  const kpis = useMemo(() => {
    const total = filteredSubscribers.length;
    const activeProList = filteredSubscribers.filter(s => s.subscription_plan === 'pro' && s.subscription_status === 'active');
    const free = filteredSubscribers.filter(s => s.subscription_plan === 'free').length;
    
    let mrrUsd = 0;
    let mrrGbp = 0;
    let mrrInr = 0;
    activeProList.forEach(s => {
      if (s.country === 'US') mrrUsd += 10;
      else if (s.country === 'GB') mrrGbp += 8;
      else mrrInr += 500;
    });

    const mrrParts = [];
    if (mrrUsd > 0) mrrParts.push(`$${mrrUsd}`);
    if (mrrGbp > 0) mrrParts.push(`£${mrrGbp}`);
    if (mrrInr > 0) mrrParts.push(`₹${mrrInr}`);
    const mrrString = mrrParts.length > 0 ? mrrParts.join(' + ') : '₹0';

    return { total, activePro: activeProList.length, free, mrrString };
  }, [filteredSubscribers]);

  const countryChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSubscribers.forEach(sub => {
      counts[sub.country] = (counts[sub.country] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
  }, [filteredSubscribers]);

  const timeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredSubscribers.forEach(sub => {
      if (sub.subscription_start_date) {
        const date = new Date(sub.subscription_start_date);
        const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
        counts[monthYear] = (counts[monthYear] || 0) + 1;
      }
    });
    // For a real app, sort chronologically, but this works for basic display
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  }, [filteredSubscribers]);

  const countries = ['All', ...Array.from(new Set(subscribers.map(s => s.country)))];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-data">
      <header className="bg-ledger-navy text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
             <span className="font-brand font-bold text-xl tracking-tight text-white">Crumb</span>
             <span className="font-data font-light text-lg tracking-[0.15em] text-jupiter-gold">ADMIN</span>
          </div>
          <button onClick={handleLogout} className="text-sm font-medium text-slate-300 hover:text-white transition">Sign Out</button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics Dashboard</h1>
          <button 
            onClick={handleExportCSV}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-ledger-navy bg-jupiter-gold hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
          >
            <i className="fa-solid fa-download mr-2"></i> Export to CSV
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <p className="font-medium">{error}</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select 
                  value={filterCountry} 
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                >
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
                <select 
                  value={filterPlan} 
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md"
                >
                  <option value="All">All Plans</option>
                  <option value="pro">Pro Only</option>
                  <option value="free">Free Only</option>
                </select>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Bakeries</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{kpis.total}</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Pro Subscriptions</dt>
                  <dd className="mt-1 text-3xl font-semibold text-amber-600">{kpis.activePro}</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Free / Trial Users</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{kpis.free}</dd>
                </div>
              </div>
              <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
                <div className="px-4 py-5 sm:p-6">
                  <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue (MRR)</dt>
                  <dd className="mt-1 text-2xl font-semibold text-green-600">{kpis.mrrString}</dd>
                </div>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Bakeries by Country</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={countryChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis allowDecimals={false} />
                      <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="count" fill="#fbbf24" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">New Subscriptions Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeChartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="date" />
                      <YAxis allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="count" stroke="#1e293b" fill="#cbd5e1" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Bakery</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Start Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">End Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredSubscribers.map((sub) => (
                      <tr key={sub.bakery_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{sub.trading_name}</div>
                          <div className="text-sm text-gray-500">ID: {sub.bakery_id} &bull; {sub.country}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{sub.owner_name}</div>
                          <div className="text-sm text-gray-500">{sub.owner_email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            sub.subscription_plan === 'pro' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {sub.subscription_plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sub.subscription_start_date ? new Date(sub.subscription_start_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                          {sub.subscription_end_date ? new Date(sub.subscription_end_date).toLocaleDateString() : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            sub.subscription_status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {sub.subscription_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {filteredSubscribers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                          No subscribers match your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
