"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { formatCurrency } from "@/lib/utils";
import { Calculator, ArrowRight, TrendingUp, Sparkles, AlertCircle } from "lucide-react";
import Link from "next/link";

export function CostMarginCalculator() {
  const { currency, currencyRate, currencySymbol } = useApp();

  // Baseline values in USD
  const [ingredientsCost, setIngredientsCost] = useState(14.5);
  const [laborHours, setLaborHours] = useState(1.2);
  const [laborRate, setLaborRate] = useState(20);
  const [packagingOverhead, setPackagingOverhead] = useState(3.5);
  const [targetMargin, setTargetMargin] = useState(70);
  const [yieldUnits, setYieldUnits] = useState(4); // e.g. 4 cakes or 24 cookies

  // Computations
  const totalLaborCost = laborHours * laborRate;
  const totalBatchCost = ingredientsCost + totalLaborCost + packagingOverhead;
  const costPerUnit = yieldUnits > 0 ? totalBatchCost / yieldUnits : 0;

  // Margin formula: Retail = Cost / (1 - (margin / 100))
  const marginDecimal = Math.min(0.95, targetMargin / 100);
  const suggestedRetailPerUnit = marginDecimal < 1 ? costPerUnit / (1 - marginDecimal) : costPerUnit * 2;
  const netProfitPerUnit = Math.max(0, suggestedRetailPerUnit - costPerUnit);
  const totalBatchProfit = netProfitPerUnit * yieldUnits;

  return (
    <section id="calculator" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>Interactive Profit Tool</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Calculate Your True Bakery Margins in Real Time
          </h2>
          <p className="mt-4 text-base text-slate-300">
            Most bakers underprice because they forget labor and micro-overheads. Enter your batch numbers below to uncover hidden costs and optimal selling prices.
          </p>
        </div>

        {/* Interactive Calculator Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/70 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-xl">
          {/* Controls Column (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Raw Ingredients Cost */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Batch Ingredients Cost</span>
                  <span className="text-amber-400 font-mono text-xs">
                    {currencySymbol}{(ingredientsCost * currencyRate).toFixed(2)}
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm">{currencySymbol}</span>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={(ingredientsCost * currencyRate).toFixed(1)}
                    onChange={(e) => setIngredientsCost(Math.max(0, (Number(e.target.value) || 0) / currencyRate))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-8 pr-4 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>

              {/* Units Yielded */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Batch Yield (Units/Servings)</span>
                  <span className="text-amber-400 font-mono text-xs">{yieldUnits} units</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={yieldUnits}
                  onChange={(e) => setYieldUnits(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                />
              </div>

              {/* Prep & Bake Labor Hours */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Prep/Bake Labor (Hours)</span>
                  <span className="text-amber-400 font-mono text-xs">{laborHours} hrs</span>
                </label>
                <input
                  type="range"
                  min="0.2"
                  max="6"
                  step="0.1"
                  value={laborHours}
                  onChange={(e) => setLaborHours(parseFloat(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>15 min</span>
                  <span>{laborHours} hrs</span>
                  <span>6 hrs</span>
                </div>
              </div>

              {/* Labor Hourly Rate */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Baker Hourly Wage</span>
                  <span className="text-amber-400 font-mono text-xs">
                    {currencySymbol}{(laborRate * currencyRate).toFixed(0)}/hr
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 text-sm">{currencySymbol}</span>
                  <input
                    type="number"
                    min="5"
                    value={(laborRate * currencyRate).toFixed(0)}
                    onChange={(e) => setLaborRate(Math.max(0, (Number(e.target.value) || 0) / currencyRate))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-8 pr-4 text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>
            </div>

            {/* Target Gross Margin Slider */}
            <div className="space-y-2 bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-white block">Target Gross Margin</span>
                  <span className="text-[11px] text-slate-400">Standard bakery target is 65% - 75%</span>
                </div>
                <span className="text-lg font-bold text-amber-400 font-mono">{targetMargin}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="85"
                step="1"
                value={targetMargin}
                onChange={(e) => setTargetMargin(parseInt(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Result Output Card (5 cols) */}
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 rounded-2xl border border-amber-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl" />

            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Unit Economics Breakdown
              </span>
              <span className="inline-flex items-center text-xs font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                <TrendingUp className="w-3 h-3 mr-1" />
                Profitable
              </span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-slate-400">Total Batch Cost:</span>
                <span className="font-mono font-medium text-slate-200">
                  {currencySymbol}{(totalBatchCost * currencyRate).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-sm">
                <span className="text-slate-400">Your Cost Per Unit:</span>
                <span className="font-mono font-bold text-amber-300 text-base">
                  {currencySymbol}{(costPerUnit * currencyRate).toFixed(2)}
                </span>
              </div>

              {/* Big Highlight: Suggested Price */}
              <div className="my-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-center">
                <div className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold mb-1">
                  Recommended Selling Price
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {currencySymbol}{(suggestedRetailPerUnit * currencyRate).toFixed(2)}
                  <span className="text-xs font-normal text-slate-400 ml-1">/ unit</span>
                </div>
                <div className="text-xs text-emerald-400 mt-1 font-medium">
                  Yields {currencySymbol}{(netProfitPerUnit * currencyRate).toFixed(2)} net profit per piece ({targetMargin}% margin)
                </div>
              </div>

              <div className="pt-2">
                <Link
                  href="/app"
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Lock In Profits in the Full App</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
                <p className="text-[11px] text-center text-slate-500 mt-2">
                  Store unlimited recipes, sync real inventory & generate instant tax invoices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
