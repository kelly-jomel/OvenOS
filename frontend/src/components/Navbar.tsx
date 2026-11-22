"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp, Currency } from "@/lib/AppContext";
import {
  Menu,
  X,
  ChefHat,
  Play,
  ArrowRight,
  Globe,
  Sparkles,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { currency, setCurrency, setIsDemoModalOpen } = useApp();

  const currencies: Currency[] = ["USD", "INR", "GBP", "EUR"];

  return (
    <nav className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#0f172a]/90 border-b border-slate-800 text-white transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <ChefHat className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-amber-200 via-white to-amber-100 bg-clip-text text-transparent">
                CrumbLedger
              </span>
              <span className="block text-[10px] uppercase tracking-widest text-amber-400/80 font-medium -mt-1">
                Bakery OS
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a
              href="#features"
              className="hover:text-amber-400 transition-colors py-1"
            >
              Features
            </a>
            <a
              href="#calculator"
              className="hover:text-amber-400 transition-colors py-1"
            >
              Cost Calculator
            </a>
            <a
              href="#product-preview"
              className="hover:text-amber-400 transition-colors py-1"
            >
              Platform Tour
            </a>
            <a
              href="#pricing"
              className="hover:text-amber-400 transition-colors py-1"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="hover:text-amber-400 transition-colors py-1"
            >
              FAQ
            </a>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Interactive Currency Selector (replaces intrusive entry modal) */}
            <div className="relative flex items-center bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 transition-colors">
              <Globe className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent border-none text-xs font-semibold focus:outline-none cursor-pointer pr-1"
                aria-label="Select Currency"
              >
                {currencies.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Watch Demo Modal Trigger */}
            <button
              onClick={() => setIsDemoModalOpen(true)}
              className="flex items-center space-x-1.5 text-xs font-medium text-slate-300 hover:text-amber-300 px-3 py-2 rounded-lg hover:bg-slate-800/60 transition-colors"
            >
              <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
              <span>Watch Demo</span>
            </button>

            {/* Launch App / Sign In */}
            <Link
              href="/app"
              className="text-xs font-medium text-slate-300 hover:text-white px-3 py-2 transition-colors"
            >
              Sign In
            </Link>

            {/* Live App Demo Button */}
            <Link
              href="/app"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-semibold px-4 py-2.5 rounded-lg text-xs shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 transition-all transform hover:-translate-y-0.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Open Live App</span>
            </Link>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center space-x-2">
            <div className="relative flex items-center bg-slate-800 border border-slate-700 rounded-md px-2 py-1 text-xs">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="bg-transparent border-none text-xs font-semibold text-white focus:outline-none"
                aria-label="Select Currency"
              >
                {currencies.map((c) => (
                  <option key={c} value={c} className="bg-slate-900 text-white">
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Hamburger Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-3 text-sm font-medium text-slate-200">
            <a
              href="#features"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-800 hover:text-amber-400 transition-colors"
            >
              Features
            </a>
            <a
              href="#calculator"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-800 hover:text-amber-400 transition-colors"
            >
              Cost Calculator
            </a>
            <a
              href="#product-preview"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-800 hover:text-amber-400 transition-colors"
            >
              Platform Tour
            </a>
            <a
              href="#pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-800 hover:text-amber-400 transition-colors"
            >
              Pricing
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md hover:bg-slate-800 hover:text-amber-400 transition-colors"
            >
              FAQ
            </a>
          </div>

          <div className="pt-3 border-t border-slate-800/80 flex flex-col space-y-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsDemoModalOpen(true);
              }}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 transition-colors"
            >
              <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
              <span>Watch 2-Min Walkthrough</span>
            </button>
            <Link
              href="/app"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-semibold shadow-md shadow-amber-500/20"
            >
              <span>Launch Web App (Free Trial)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
