'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
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
            Stop Chasing Payments. <span className="text-orange-600">Start Baking More.</span>
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto mb-10">
            Meet <strong>OvenOS</strong>—the only billing and order management platform built exclusively for home bakers. Send beautiful invoices, secure advance deposits, and organize your custom orders in one place.
          </p>
          <div className="flex justify-center space-x-4">
            <Link href="/signup" className="bg-orange-600 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-orange-700 shadow-lg transition">
              Start Your Free 14-Day Trial
            </Link>
            <Link href="#features" className="bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-50 transition">
              See How OvenOS Works
            </Link>
          </div>
        </div>
      </div>

      {/* The Problem (Agitation) */}
      <div className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Ditch the Messy DMs and Sticky Notes</h2>
          <p className="text-xl text-gray-600 leading-relaxed mb-4">
            You started your business to bake, not to spend hours scrolling through Instagram messages trying to remember if a client paid their deposit for Saturday's tiered fondant cake.
          </p>
          <p className="text-xl text-gray-600 leading-relaxed font-medium">
            Running a home bakery is hard enough. Your billing shouldn't be a recipe for disaster.
          </p>
        </div>
      </div>

      {/* Core Features */}
      <div id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">The Perfect Recipe for Your Business</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We didn't just build a billing tool; we built a bakery assistant. OvenOS gives you everything you need to look professional and get paid faster.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">🍰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Bake-Specific Invoicing</h3>
              <p className="text-gray-600">Easily add custom fields for flavors, tiers, allergies, and delivery dates right on the invoice.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Automated Deposits</h3>
              <p className="text-gray-600">Never bake out of pocket again. Automatically require a 50% (or custom) deposit before an order is confirmed.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">🗓️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Delivery & Pickup Calendar</h3>
              <p className="text-gray-600">Your paid invoices automatically sync to a visual calendar, so you know exactly what needs to go in the oven and when.</p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Professional Checkout</h3>
              <p className="text-gray-600">Give your clients a seamless, mobile-friendly payment experience that makes your home business look like a premium boutique.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-24 bg-orange-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-12">Loved by Home Bakers Everywhere</h2>
          <blockquote className="text-2xl font-medium italic leading-relaxed mb-8">
            "Before OvenOS, I was tracking orders in a notebook and constantly feeling awkward asking for deposits. Now, I send a link, my clients pay immediately, and my baking schedule is automatically updated. It changed my business overnight!"
          </blockquote>
          <p className="text-lg font-bold opacity-90">— Sarah J., Owner of Sweet Eats Custom Cakes</p>
        </div>
      </div>

      {/* Final Call-to-Action */}
      <div className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Ready to Whisk Away Your Billing Stress?</h2>
          <p className="text-xl text-gray-600 mb-10">
            Join thousands of home bakers who are saving time, looking professional, and focusing on what they love: baking. Let OvenOS handle the math.
          </p>
          <Link href="/signup" className="inline-block bg-orange-600 text-white px-10 py-5 rounded-full text-xl font-bold hover:bg-orange-700 shadow-lg transition mb-4">
            Get Started for Free
          </Link>
          <p className="text-sm text-gray-500 italic">No credit card required. Setup takes less than 2 minutes.</p>
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
