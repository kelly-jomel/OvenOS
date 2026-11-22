"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import { Navbar } from "@/components/Navbar";
import { CostMarginCalculator } from "@/components/CostMarginCalculator";
import { ProductShowcase } from "@/components/ProductShowcase";
import { PricingSection } from "@/components/PricingSection";
import { FAQSection } from "@/components/FAQSection";
import { DemoModal } from "@/components/DemoModal";
import { Footer } from "@/components/Footer";
import {
  Sparkles,
  ArrowRight,
  Play,
  Scale,
  Package,
  Receipt,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  ChefHat,
  Star,
} from "lucide-react";

export function LandingPage() {
  const { setIsDemoModalOpen, currencyRate, currencySymbol } = useApp();

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-500 selection:text-slate-950">
      <Navbar />
      <DemoModal />

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 md:pt-20 md:pb-32 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-amber-500/20 via-amber-600/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            {/* Top Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wide mb-6 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Redesigned for 2026: The Complete Bakery Operating System</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
              Stop Guessing Margins. <br />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 bg-clip-text text-transparent">
                Master Your Bakery Ledger.
              </span>
            </h1>

            {/* Sub-headline */}
            <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              From raw gram ingredient costing and live pantry reorder alerts to fast counter POS and tax invoicing — keep your bakery running at 70%+ gross margins.
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/app"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition-all transform hover:-translate-y-0.5"
              >
                <span>Launch Free App Trial</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                onClick={() => setIsDemoModalOpen(true)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-white font-semibold text-sm transition"
              >
                <Play className="w-4 h-4 text-amber-400 fill-current" />
                <span>Watch 2-Min Demo</span>
              </button>
            </div>

            {/* Trust Markers */}
            <div className="mt-5 flex items-center justify-center space-x-6 text-xs text-slate-400">
              <span className="flex items-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mr-1.5" />
                No credit card required
              </span>
              <span className="flex items-center">
                <Clock className="w-3.5 h-3.5 text-amber-400 mr-1.5" />
                Setup in under 3 minutes
              </span>
            </div>
          </div>

          {/* Hero Visual Anchor: Interactive Recipe Costing Card Preview */}
          <div className="mt-14 max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  <ChefHat className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider text-amber-400 font-bold">Master Recipe #101</div>
                  <h3 className="text-xl font-bold text-white">Signature Chocolate Fudge Cake (10 Units)</h3>
                </div>
              </div>
              <div className="flex items-center space-x-4 bg-slate-950 px-4 py-2.5 rounded-2xl border border-slate-800">
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Suggested Retail</div>
                  <div className="text-lg font-bold text-white font-mono">
                    {currencySymbol}{(34 * currencyRate).toFixed(2)}
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-800" />
                <div>
                  <div className="text-[10px] uppercase text-emerald-400 font-semibold">Actual Margin</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono">71.2%</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Raw Ingredients</span>
                <span className="text-base font-bold font-mono text-slate-200">
                  {currencySymbol}{(59.27 * currencyRate).toFixed(2)}
                </span>
              </div>
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Baking Labor (1.5h)</span>
                <span className="text-base font-bold font-mono text-slate-200">
                  {currencySymbol}{(33.0 * currencyRate).toFixed(2)}
                </span>
              </div>
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
                <span className="text-[11px] text-slate-400 block">Packaging & Energy</span>
                <span className="text-base font-bold font-mono text-slate-200">
                  {currencySymbol}{(5.5 * currencyRate).toFixed(2)}
                </span>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl">
                <span className="text-[11px] text-amber-300 block font-semibold">Cost Per Unit</span>
                <span className="text-base font-bold font-mono text-amber-400">
                  {currencySymbol}{(9.78 * currencyRate).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>9 ingredients factored to the gram (Valrhona cocoa, butter, vanilla extract, flour)</span>
              <Link href="/app" className="text-amber-400 hover:text-amber-300 font-semibold flex items-center">
                <span>Edit in Live App</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Banner */}
      <section className="py-12 bg-slate-900 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-widest text-slate-400 font-semibold mb-6">
            Empowering 2,400+ Artisan Bakeries, Pastry Shops & Micro-Kitchens Globally
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 items-center justify-center text-sm font-semibold text-slate-400 tracking-wide">
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
              🥖 Atelier du Pain (Paris)
            </div>
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
              🧁 Velvet Crumb Bakery (NYC)
            </div>
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
              🥐 Golden Crust Patisserie (London)
            </div>
            <div className="p-3 bg-slate-950/50 rounded-xl border border-slate-800/80">
              🍰 Sugar & Sourdough (Melbourne)
            </div>
          </div>
        </div>
      </section>

      {/* Feature Matrix (6 Pillars) */}
      <section id="features" className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
              Full Spectrum Bakery Tools
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-3">
              Crafted Specifically for Culinary Math
            </h2>
            <p className="mt-4 text-base text-slate-400">
              Generic spreadsheets fail when supplier prices fluctuate and recipes yield varying batch counts. CrumbLedger solves it natively.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* 1 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-amber-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Gram-Precision Recipe Costing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Breakdown every bulk purchase down to the gram, milliliter, or unit. Update your butter price once, and every single recipe auto-recalculates.
              </p>
            </div>

            {/* 2 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-amber-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
                <Package className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Automated Inventory Depletion</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every sale completed at counter POS deducts exact flour, eggs, and boxes. Receive instant alerts before you run out of essential ingredients.
              </p>
            </div>

            {/* 3 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-amber-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
                <Receipt className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Fast Counter POS & Invoicing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Touch-optimized interface for cashiers, baristas, or counter staff. Support for cash, card, UPI, custom discounts, and printable tax receipts.
              </p>
            </div>

            {/* 4 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-amber-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Labor & Overhead Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Factor in prep time, baking time, baker hourly wages, and packaging costs. Never sell a labor-intensive cake at a hidden loss again.
              </p>
            </div>

            {/* 5 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-amber-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Dynamic Batch Scaler</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scale any formula from 6 cupcakes to a catering order of 300 with one click. Ingredient weights scale seamlessly without math errors.
              </p>
            </div>

            {/* 6 */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-7 hover:border-amber-500/40 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">P&L & Tax Compliance</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated monthly sales reports, ingredient expenditure records, and taxable sales breakdown ready for your accountant in 1 click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Margin Calculator Component */}
      <CostMarginCalculator />

      {/* Interactive Product Platform Showcase */}
      <ProductShowcase />

      {/* Verified Testimonials */}
      <section className="py-24 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">
              Loved by Pastry Chefs & Bakery Owners
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Here is how bakers protect their margins every morning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative">
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                “When butter prices soared 30% last year, CrumbLedger saved us. We updated our supplier cost and instantly knew exactly which 4 pastries needed price adjustments to stay above 68% margin.”
              </p>
              <div className="flex items-center space-x-3 border-t border-slate-900 pt-4">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  SC
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Sarah Chen</div>
                  <div className="text-[11px] text-slate-400">Founder, Sweet Heritage Patisserie (Seattle)</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative">
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                “Our bakers use iPads in the kitchen for batch scaling, and our counter staff uses the POS. Having ingredient inventory deduct automatically is pure magic.”
              </p>
              <div className="flex items-center space-x-3 border-t border-slate-900 pt-4">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  MR
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Marc Rossi</div>
                  <div className="text-[11px] text-slate-400">Head Baker, Rossi Artisan Sourdough (Chicago)</div>
                </div>
              </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 relative">
              <div className="flex text-amber-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6">
                “We replaced messy Excel files with CrumbLedger. We discovered our custom wedding cakes were running at only 38% margin due to uncounted labor. Fixed immediately!”
              </p>
              <div className="flex items-center space-x-3 border-t border-slate-900 pt-4">
                <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-xs">
                  EL
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Elena Larsson</div>
                  <div className="text-[11px] text-slate-400">Cake Artist, Nordic Crumb Co. (Austin)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Bottom CTA Banner */}
      <section className="py-20 bg-gradient-to-t from-slate-900 to-slate-950 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to Take Control of Your Bakery Profits?
          </h2>
          <p className="mt-4 text-base text-slate-300 max-w-xl mx-auto">
            Join thousands of smart bakers who protect their craft and bank accounts with CrumbLedger.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/app"
              className="inline-flex items-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/25 transition"
            >
              <span>Launch Your 14-Day Free Trial</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            Instant setup • No credit card required • Cancel anytime
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
