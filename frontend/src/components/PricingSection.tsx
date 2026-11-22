"use client";

import React, { useState } from "react";
import { useApp } from "@/lib/AppContext";
import { Check, Sparkles, ShieldCheck, HelpCircle } from "lucide-react";
import Link from "next/link";

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);
  const { currencyRate, currencySymbol } = useApp();

  // Baseline prices in USD
  const monthlyRateUSD = 6;
  const annualRateUSD = 5; // $60/yr

  const currentPrice = isAnnual ? annualRateUSD * currencyRate : monthlyRateUSD * currencyRate;
  const billedPeriod = isAnnual ? "per month, billed annually" : "per month, billed monthly";

  return (
    <section id="pricing" className="py-24 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <span>Simple, Honest Pricing</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Less Than The Cost of a Single Cake Box
          </h2>
          <p className="mt-4 text-base text-slate-300">
            No tiered lockouts, no hidden transaction cuts. Everything included for one flat transparent price.
          </p>

          {/* Billing Interval Switcher */}
          <div className="mt-8 inline-flex items-center p-1 bg-slate-950 border border-slate-800 rounded-2xl">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                !isAnnual
                  ? "bg-slate-800 text-white shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                isAnnual
                  ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] bg-slate-950/80 text-amber-300 px-1.5 py-0.5 rounded-full font-bold">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="max-w-xl mx-auto bg-gradient-to-b from-slate-800 to-slate-950 border-2 border-amber-500/40 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-amber-600 text-slate-950 text-[10px] font-extrabold uppercase tracking-widest px-4 py-1.5 rounded-bl-xl shadow-md">
            All-Inclusive Pro Plan
          </div>

          <div className="text-center pb-8 border-b border-slate-800">
            <h3 className="text-xl font-bold text-white mb-2">CrumbLedger Pro</h3>
            <p className="text-xs text-slate-400">
              Complete recipe costing, real-time inventory, fast POS, and tax invoicing.
            </p>

            <div className="mt-6 flex items-baseline justify-center">
              <span className="text-5xl sm:text-6xl font-black text-white tracking-tight font-mono">
                {currencySymbol}{currentPrice.toFixed(0)}
              </span>
              <span className="text-slate-400 text-sm ml-2 font-medium">/ month</span>
            </div>
            <div className="text-xs text-amber-400/90 font-medium mt-1">
              {billedPeriod}
            </div>

            <div className="mt-6">
              <Link
                href="/app"
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start 14-Day Free Trial</span>
              </Link>
              <div className="flex items-center justify-center space-x-2 text-[11px] text-slate-400 mt-2.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>No credit card required • Instant setup</span>
              </div>
            </div>
          </div>

          {/* Features Included List */}
          <div className="pt-8 space-y-3.5 text-xs text-slate-300">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Everything Included:
            </div>
            {[
              "Unlimited Master Recipes with gram-level precision",
              "Real-time Raw Ingredient Inventory & Stock Depletion",
              "Labor & Energy Overhead Cost Calculation",
              "Interactive Counter POS with instant receipt printing",
              "Low Stock & Expiry Reorder Warning Alerts",
              "Multi-Currency Support (USD, INR, GBP, EUR)",
              "Automated Tax Ledgers & Exportable P&L Reports",
              "Priority Customer Support via Live Chat & Email",
            ].map((feat, i) => (
              <div key={i} className="flex items-start space-x-2.5">
                <div className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center mt-0.5 shrink-0">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
