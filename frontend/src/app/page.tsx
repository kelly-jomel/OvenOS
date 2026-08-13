'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'GBP'>('INR');

  const pricing = {
    INR: { monthly: 499, annual: 399, symbol: '₹' },
    USD: { monthly: 15, annual: 12, symbol: '$' },
    GBP: { monthly: 15, annual: 12, symbol: '£' },
  };

  const currentPrice = pricing[currency][billingCycle];

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="OvenOS Logo" className="h-8 w-auto object-contain" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-500">
              OvenOS
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-500 hover:text-gray-900 font-medium">Log in</Link>
            <Link href="/signup" className="bg-orange-600 text-white px-5 py-2 rounded-full font-medium hover:bg-orange-700 transition">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-orange-50/50 py-24 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
            The Operating System for <span className="text-orange-600">Modern Home Bakeries</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Automate costing, manage omnichannel orders from WhatsApp and Instagram, and scale your baking business effortlessly.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup" className="bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-orange-700 shadow-lg transition">
              Start your 7-Day Free Trial
            </Link>
            <Link href="#features" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition">
              See Features
            </Link>
          </div>
          <p className="mt-4 text-sm text-gray-500">No credit card required to start.</p>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to bake for profit</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <span className="text-orange-600 text-xl font-bold">₹</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Smart Recipe Costing</h3>
              <p className="text-gray-600">Automatically calculate true ingredient costs factoring in shrinkage, waste, and real-time prices to guarantee your margins.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="bg-rose-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <span className="text-rose-600 text-xl font-bold">📱</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Omnichannel Unified Inbox</h3>
              <p className="text-gray-600">Manage orders from Instagram DMs, WhatsApp, and your website in one single, draggable Kanban dashboard.</p>
            </div>
            <div className="bg-gray-50 p-8 rounded-2xl">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
                <span className="text-green-600 text-xl font-bold">⚙️</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Auto Production Planning</h3>
              <p className="text-gray-600">Let OvenOS automatically group daily bake orders by oven temperature to save energy and optimize your prep time.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div id="pricing" className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-400 mb-10">Start with a 7-day free trial. Then, one flat rate to run your entire bakery.</p>
          
          <div className="flex flex-col items-center justify-center space-y-6 mb-12">
            {/* Currency Selector */}
            <div className="flex space-x-2 bg-gray-800 p-1 rounded-full">
              {['INR', 'USD', 'GBP'].map(curr => (
                <button 
                  key={curr}
                  onClick={() => setCurrency(curr as any)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition ${currency === curr ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                  {curr}
                </button>
              ))}
            </div>

            {/* Toggle */}
            <div className="flex items-center space-x-4">
              <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-gray-400'}`}>Monthly</span>
              <button 
                onClick={() => setBillingCycle(prev => prev === 'monthly' ? 'annual' : 'monthly')}
                className="relative inline-flex h-6 w-11 items-center rounded-full bg-orange-600 transition-colors focus:outline-none"
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-medium flex items-center ${billingCycle === 'annual' ? 'text-white' : 'text-gray-400'}`}>
                Annually <span className="ml-2 bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded-full">Save 20%</span>
              </span>
            </div>
          </div>

          {/* Pricing Card */}
          <div className="max-w-lg mx-auto bg-gray-800 rounded-3xl p-8 border border-gray-700">
            <h3 className="text-2xl font-bold mb-2">OvenOS Pro</h3>
            <p className="text-gray-400 mb-6">Everything you need to grow.</p>
            <div className="text-5xl font-extrabold mb-6 flex items-baseline justify-center">
              <span>{pricing[currency].symbol}{currentPrice}</span>
              <span className="text-xl font-normal text-gray-500 ml-2">/mo</span>
            </div>
            <Link href="/signup" className="block w-full bg-orange-600 text-white px-6 py-4 rounded-xl text-lg font-bold hover:bg-orange-700 transition mb-6">
              Start 7-Day Free Trial
            </Link>
            <ul className="text-left space-y-4 text-gray-300">
              <li className="flex items-center">✅ Smart Recipe Costing</li>
              <li className="flex items-center">✅ WhatsApp & IG Integration</li>
              <li className="flex items-center">✅ Custom Cake Builder Module</li>
              <li className="flex items-center">✅ Automated Production Scheduling</li>
              <li className="flex items-center">✅ Tally & ClearTax Exports</li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500">
          <p>© {new Date().getFullYear()} OvenOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
