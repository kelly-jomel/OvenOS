"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import {
  Layers,
  Scale,
  ShoppingBag,
  Receipt,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Plus,
} from "lucide-react";
import Link from "next/link";

export function ProductShowcase() {
  const [activeTab, setActiveTab] = useState<"costing" | "inventory" | "pos" | "analytics">("costing");
  const { currencyRate, currencySymbol } = useApp();

  return (
    <section id="product-preview" className="py-24 bg-slate-950 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Platform Tour</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Everything A Modern Bakery Needs. Zero Clutter.
          </h2>
          <p className="mt-4 text-base text-slate-400">
            Switch between real modules below to see how CrumbLedger handles everything from raw gram flour tracking to counter billing.
          </p>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          <button
            onClick={() => setActiveTab("costing")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "costing"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>1. Recipe & Batch Costing</span>
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "inventory"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>2. Live Pantry Inventory</span>
          </button>
          <button
            onClick={() => setActiveTab("pos")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "pos"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>3. Fast Bakery POS</span>
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "analytics"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/25"
                : "bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>4. Margin Analytics</span>
          </button>
        </div>

        {/* Tab Content Window Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          {/* Simulated Mac App Window Header */}
          <div className="bg-slate-950/80 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-3 text-xs font-mono text-slate-400 hidden sm:inline">
                crumbledger.app / {activeTab}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-slate-400">
              <span className="flex items-center text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5 animate-pulse" />
                Live Cloud Sync
              </span>
              <Link
                href="/app"
                className="bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded text-[11px] font-semibold transition"
              >
                Launch This Module &rarr;
              </Link>
            </div>
          </div>

          {/* Tab 1: Recipe Costing */}
          {activeTab === "costing" && (
            <div className="p-6 sm:p-8 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6 mb-6">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-400 font-semibold">
                    Master Formula Breakdown
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    Signature Valrhona Chocolate Cake (Yield: 10 Cakes)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Prep: 45m • Bake: 35m • Baker Rate: {currencySymbol}{(22 * currencyRate).toFixed(0)}/hr
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-slate-800 px-4 py-2 rounded-xl text-right">
                    <div className="text-[10px] uppercase text-slate-400">Suggested Retail</div>
                    <div className="text-xl font-bold text-white font-mono">
                      {currencySymbol}{(34 * currencyRate).toFixed(2)}
                      <span className="text-xs text-slate-400 font-normal"> / cake</span>
                    </div>
                  </div>
                  <div className="bg-emerald-950/70 border border-emerald-800/80 px-4 py-2 rounded-xl text-right">
                    <div className="text-[10px] uppercase text-emerald-300">Gross Margin</div>
                    <div className="text-xl font-bold text-emerald-400 font-mono">71.2%</div>
                  </div>
                </div>
              </div>

              {/* Table preview */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">Ingredient</th>
                      <th className="py-2.5 px-3">Batch Qty</th>
                      <th className="py-2.5 px-3">Unit Cost</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    <tr>
                      <td className="py-3 px-3 font-sans font-medium text-white">Valrhona Dutch Cocoa 100%</td>
                      <td className="py-3 px-3">350 g</td>
                      <td className="py-3 px-3">{currencySymbol}{(0.042 * currencyRate).toFixed(3)}/g</td>
                      <td className="py-3 px-3 text-right text-amber-300 font-semibold">{currencySymbol}{(14.7 * currencyRate).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-sans font-medium text-white">Organic Grass-fed Butter</td>
                      <td className="py-3 px-3">500 g</td>
                      <td className="py-3 px-3">{currencySymbol}{(0.0245 * currencyRate).toFixed(3)}/g</td>
                      <td className="py-3 px-3 text-right text-amber-300 font-semibold">{currencySymbol}{(12.25 * currencyRate).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-sans font-medium text-white">Fine Pastry Flour (T55)</td>
                      <td className="py-3 px-3">600 g</td>
                      <td className="py-3 px-3">{currencySymbol}{(0.0036 * currencyRate).toFixed(3)}/g</td>
                      <td className="py-3 px-3 text-right text-amber-300 font-semibold">{currencySymbol}{(2.16 * currencyRate).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="py-3 px-3 font-sans font-medium text-white">Packaging: Eco-Kraft Cake Box</td>
                      <td className="py-3 px-3">10 boxes</td>
                      <td className="py-3 px-3">{currencySymbol}{(0.7 * currencyRate).toFixed(2)}/ea</td>
                      <td className="py-3 px-3 text-right text-amber-300 font-semibold">{currencySymbol}{(7.0 * currencyRate).toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab 2: Live Pantry Inventory */}
          {activeTab === "inventory" && (
            <div className="p-6 sm:p-8 animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-bold text-white">Real-Time Raw Ingredient Stock</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Every batch cooked or sale punched automatically deducts raw grams from your inventory.
                  </p>
                </div>
                <span className="text-xs bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-full font-medium flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" /> 1 Item Below Reorder Level
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-400">Valrhona Cocoa Powder</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded">Healthy</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-2">3,500 g</div>
                  <div className="text-[11px] text-slate-500 mt-1">Min threshold: 1,000 g</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-amber-500/40">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-400">Organic Butter (Tournage)</span>
                    <span className="text-[10px] bg-amber-950 text-amber-400 px-2 py-0.5 rounded">Reorder Soon</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-amber-300 mt-2">2,100 g</div>
                  <div className="text-[11px] text-slate-500 mt-1">Min threshold: 2,000 g</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-start">
                    <span className="text-xs text-slate-400">Eco-Kraft Cake Box 10x10</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded">Healthy</span>
                  </div>
                  <div className="text-2xl font-bold font-mono text-white mt-2">85 units</div>
                  <div className="text-[11px] text-slate-500 mt-1">Min threshold: 30 units</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: POS Register */}
          {activeTab === "pos" && (
            <div className="p-6 sm:p-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-lg font-bold text-white">Touch-Friendly Counter POS</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-amber-500 transition">
                      <div className="text-xs font-semibold text-white">Chocolate Fudge Cake</div>
                      <div className="text-amber-400 font-mono text-xs mt-1">{currencySymbol}{(34 * currencyRate).toFixed(2)}</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">71.2% margin</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-amber-500 transition">
                      <div className="text-xs font-semibold text-white">French Butter Croissant</div>
                      <div className="text-amber-400 font-mono text-xs mt-1">{currencySymbol}{(6.5 * currencyRate).toFixed(2)}</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">51.7% margin</div>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 cursor-pointer hover:border-amber-500 transition">
                      <div className="text-xs font-semibold text-white">Country Sourdough Boule</div>
                      <div className="text-amber-400 font-mono text-xs mt-1">{currencySymbol}{(9.5 * currencyRate).toFixed(2)}</div>
                      <div className="text-[10px] text-emerald-400 mt-0.5">63.8% margin</div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 bg-slate-950 p-5 rounded-2xl border border-slate-800">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
                    <span>Active Ticket</span>
                    <span className="text-amber-400 font-mono">#ORD-8942</span>
                  </div>
                  <div className="space-y-2 text-xs border-b border-slate-800 pb-3 mb-3">
                    <div className="flex justify-between">
                      <span>2x Chocolate Fudge Cake</span>
                      <span className="font-mono">{currencySymbol}{(68 * currencyRate).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>12x French Butter Croissant</span>
                      <span className="font-mono">{currencySymbol}{(78 * currencyRate).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-white mb-4">
                    <span>Total Due</span>
                    <span className="text-amber-300 font-mono">{currencySymbol}{(146 * currencyRate).toFixed(2)}</span>
                  </div>
                  <Link
                    href="/app"
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center justify-center space-x-1"
                  >
                    <span>Try POS Register</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Analytics */}
          {activeTab === "analytics" && (
            <div className="p-6 sm:p-8 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Total Month Sales</span>
                  <div className="text-2xl font-extrabold font-mono text-white mt-1">
                    {currencySymbol}{(14820 * currencyRate).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">↑ +22.4% vs last mo</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Average Net Margin</span>
                  <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                    68.4%
                  </div>
                  <span className="text-[11px] text-slate-400">Target baseline: 65%</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-xs text-slate-400">Total Net Profit</span>
                  <div className="text-2xl font-extrabold font-mono text-amber-400 mt-1">
                    {currencySymbol}{(10136 * currencyRate).toLocaleString()}
                  </div>
                  <span className="text-[11px] text-slate-400">Pure bakery take-home</span>
                </div>
              </div>
              <div className="text-center pt-2">
                <Link
                  href="/app"
                  className="inline-flex items-center space-x-2 text-xs font-semibold text-amber-400 hover:text-amber-300"
                >
                  <span>Explore full sales & tax reports in the app</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
