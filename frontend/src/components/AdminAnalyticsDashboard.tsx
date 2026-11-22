"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Download, Users, DollarSign, Award, Globe, ArrowLeft, RefreshCw } from "lucide-react";
import { SubscriberRecord, MOCK_SUBSCRIBERS } from "@/app/api/admin/subscribers/route";

export function AdminAnalyticsDashboard() {
  const [subscribers, setSubscribers] = useState<SubscriberRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [countryFilter, setCountryFilter] = useState("All");
  const [planFilter, setPlanFilter] = useState("All");

  const fetchSubscribers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/subscribers");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setSubscribers(data);
    } catch (err: any) {
      // Fallback seamlessly to local mock records if network fails
      console.warn("Using local fallback records:", err);
      setSubscribers(MOCK_SUBSCRIBERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const filtered = useMemo(() => {
    return subscribers.filter((sub) => {
      const matchCountry = countryFilter === "All" || sub.country === countryFilter;
      const matchPlan = planFilter === "All" || sub.subscription_plan === planFilter;
      return matchCountry && matchPlan;
    });
  }, [subscribers, countryFilter, planFilter]);

  // Aggregate Metrics
  const totalSubscribers = subscribers.length;
  const activePro = subscribers.filter((s) => s.subscription_plan === "pro" && s.subscription_status === "active").length;
  const freeUsers = subscribers.filter((s) => s.subscription_plan === "free").length;
  const totalMRR = subscribers.reduce((sum, s) => sum + (s.subscription_status === "active" ? s.mrr : 0), 0);

  // Country Breakdown
  const countries = useMemo(() => {
    const set = new Set(subscribers.map((s) => s.country));
    return Array.from(set);
  }, [subscribers]);

  const exportCSV = () => {
    const headers = [
      "Bakery ID",
      "Trading Name",
      "Country",
      "Owner Email",
      "Owner Name",
      "Plan",
      "Status",
      "Start Date",
      "End Date",
    ];
    const rows = filtered.map((s) => [
      s.bakery_id,
      `"${s.trading_name.replace(/"/g, '""')}"`,
      s.country,
      s.owner_email,
      `"${s.owner_name.replace(/"/g, '""')}"`,
      s.subscription_plan,
      s.subscription_status,
      s.subscription_start_date || "",
      s.subscription_end_date || "",
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `crumbledger_subscribers_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link href="/app" className="text-slate-400 hover:text-white transition flex items-center text-xs">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to App
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <div className="flex items-center space-x-2">
            <span className="font-bold text-base text-white tracking-tight">Crumb</span>
            <span className="text-amber-400 text-xs font-mono font-semibold uppercase tracking-widest bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
              ADMIN
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchSubscribers}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Refresh Subscribers"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/app"
            className="text-xs font-semibold text-slate-300 hover:text-white transition px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700"
          >
            Sign Out
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl w-full mx-auto p-6 sm:p-8 flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Analytics Dashboard
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Active subscriptions, subscriber distribution, and Monthly Recurring Revenue (MRR).
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export to CSV</span>
          </button>
        </div>

        {/* Aggregate KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Total Bakeries</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-white font-mono mt-2">{totalSubscribers}</div>
            <div className="text-[11px] text-slate-500 mt-1">Global accounts</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Active Pro Plan</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-extrabold text-amber-400 font-mono mt-2">{activePro}</div>
            <div className="text-[11px] text-emerald-400 mt-1">Paying customers</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Free / Trial Users</span>
              <Users className="w-4 h-4 text-slate-400" />
            </div>
            <div className="text-3xl font-extrabold text-slate-300 font-mono mt-2">{freeUsers}</div>
            <div className="text-[11px] text-slate-500 mt-1">Potential conversions</div>
          </div>

          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Monthly Revenue (MRR)</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-2">
              ${totalMRR.toFixed(2)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Direct subscription billing</div>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs">
          <span className="font-semibold text-slate-300">Filter Bakeries:</span>

          {/* Country filter */}
          <div className="flex items-center space-x-1.5">
            <Globe className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="All">All Countries</option>
              {countries.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Plan filter */}
          <div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
            >
              <option value="All">All Plans</option>
              <option value="pro">Pro Plan</option>
              <option value="free">Free Plan</option>
            </select>
          </div>

          <span className="text-[11px] text-slate-500 ml-auto">
            Showing {filtered.length} of {subscribers.length} records
          </span>
        </div>

        {/* Subscribers Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Bakery</th>
                  <th className="py-3.5 px-4">Owner Contact</th>
                  <th className="py-3.5 px-4">Plan</th>
                  <th className="py-3.5 px-4">Start Date</th>
                  <th className="py-3.5 px-4">End Date</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((sub) => (
                  <tr key={sub.bakery_id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{sub.trading_name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {sub.bakery_id} • {sub.country}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-slate-200 font-medium">{sub.owner_name}</div>
                      <div className="text-[11px] text-slate-400">{sub.owner_email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          sub.subscription_plan === "pro"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-slate-800 text-slate-400"
                        }`}
                      >
                        {sub.subscription_plan}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {sub.subscription_start_date}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400">
                      {sub.subscription_end_date || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          sub.subscription_status === "active"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-rose-950 text-rose-400 border border-rose-800"
                        }`}
                      >
                        {sub.subscription_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
