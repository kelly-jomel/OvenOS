'use client';

import React from 'react';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 selection:bg-orange-200">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-orange-100 to-rose-100 p-2 rounded-xl">
              <img src="/logo.png" alt="OvenOS Logo" className="h-8 w-auto object-contain drop-shadow-sm" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-rose-600">
              OvenOS
            </span>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900 font-semibold transition-colors">Log in</Link>
            <Link href="/signup" className="bg-gray-900 text-white px-6 py-2.5 rounded-full font-semibold hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-50 via-white to-white"></div>
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3">
          <div className="w-96 h-96 bg-orange-200/40 rounded-full blur-3xl"></div>
        </div>
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3">
          <div className="w-96 h-96 bg-rose-200/40 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-orange-100/50 text-orange-700 font-medium text-sm mb-8 border border-orange-200/50 backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 mr-2 animate-pulse"></span>
            The #1 Platform for Home Bakers
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-[1.1]">
            Stop Chasing Payments.<br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-500">
              Start Baking More.
            </span>
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 font-light leading-relaxed">
            Meet <strong className="font-semibold text-gray-900">OvenOS</strong>—the only billing and order management platform built exclusively for home bakers. Send beautiful invoices, secure advance deposits, and organize your custom orders in one place.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link href="/signup" className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-rose-500 text-white px-8 py-4 rounded-full text-lg font-bold hover:shadow-xl hover:shadow-orange-500/20 hover:-translate-y-1 transition-all duration-300">
              Start Your Free 14-Day Trial
            </Link>
            <Link href="#features" className="w-full sm:w-auto bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-50 hover:border-gray-200 hover:shadow-md transition-all duration-300">
              See How OvenOS Works
            </Link>
          </div>
        </div>
      </div>

      {/* The Problem (Agitation) */}
      <div className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Ditch the Messy DMs and Sticky Notes</h2>
          <p className="text-xl md:text-2xl text-gray-300 leading-relaxed mb-6 font-light">
            You started your business to bake, not to spend hours scrolling through Instagram messages trying to remember if a client paid their deposit for Saturday's tiered fondant cake.
          </p>
          <p className="text-xl md:text-2xl text-orange-400 leading-relaxed font-medium">
            Running a home bakery is hard enough. Your billing shouldn't be a recipe for disaster.
          </p>
        </div>
      </div>

      {/* Core Features */}
      <div id="features" className="py-32 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6 tracking-tight">The Perfect Recipe for Your Business</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed">
              We didn't just build a billing tool; we built a bakery assistant. OvenOS gives you everything you need to look professional and get paid faster.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {[
              { icon: '🍰', title: 'Bake-Specific Invoicing', desc: 'Easily add custom fields for flavors, tiers, allergies, and delivery dates right on the invoice.', color: 'bg-pink-100 text-pink-600' },
              { icon: '💳', title: 'Automated Deposits', desc: 'Never bake out of pocket again. Automatically require a 50% (or custom) deposit before an order is confirmed.', color: 'bg-emerald-100 text-emerald-600' },
              { icon: '🗓️', title: 'Delivery & Pickup Calendar', desc: 'Your paid invoices automatically sync to a visual calendar, so you know exactly what needs to go in the oven and when.', color: 'bg-blue-100 text-blue-600' },
              { icon: '📱', title: 'Professional Checkout', desc: 'Give your clients a seamless, mobile-friendly payment experience that makes your home business look like a premium boutique.', color: 'bg-purple-100 text-purple-600' },
            ].map((feature, idx) => (
              <div key={idx} className="group bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-2 transition-all duration-300">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                <p className="text-lg text-gray-600 leading-relaxed font-light">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="py-32 bg-gradient-to-br from-orange-500 to-rose-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full translate-y-1/2 -translate-x-1/3 blur-2xl"></div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-sm font-bold tracking-widest uppercase text-orange-200 mb-8">Loved by Home Bakers Everywhere</h2>
          <blockquote className="text-3xl md:text-5xl font-medium leading-tight mb-12 text-white">
            "Before OvenOS, I was tracking orders in a notebook and constantly feeling awkward asking for deposits. Now, I send a link, my clients pay immediately, and my baking schedule is automatically updated. It changed my business overnight!"
          </blockquote>
          <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-2xl font-bold mb-4 backdrop-blur-md">SJ</div>
            <p className="text-xl font-bold">— Sarah J.</p>
            <p className="text-orange-200 mt-1">Owner of Sweet Eats Custom Cakes</p>
          </div>
        </div>
      </div>

      {/* Final Call-to-Action */}
      <div className="py-32 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-50/50 via-white to-white"></div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-8 tracking-tight">Ready to Whisk Away Your Billing Stress?</h2>
          <p className="text-xl md:text-2xl text-gray-600 mb-12 font-light leading-relaxed">
            Join thousands of home bakers who are saving time, looking professional, and focusing on what they love: baking. Let OvenOS handle the math.
          </p>
          <Link href="/signup" className="inline-block bg-gray-900 text-white px-12 py-5 rounded-full text-xl font-bold hover:bg-gray-800 hover:shadow-2xl hover:-translate-y-1 hover:shadow-gray-900/20 transition-all duration-300 mb-6">
            Get Started for Free
          </Link>
          <p className="text-base text-gray-500 font-medium flex items-center justify-center">
            <span className="text-green-500 mr-2">✓</span> No credit card required. Setup takes less than 2 minutes.
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-gray-50 py-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-gray-500">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <img src="/logo.png" alt="OvenOS Logo" className="h-6 w-auto grayscale opacity-50" />
            <span className="font-semibold text-gray-400">OvenOS</span>
          </div>
          <div className="flex flex-col items-center md:items-end space-y-2 text-sm font-medium">
            <p>© {new Date().getFullYear()} OvenOS. All rights reserved.</p>
            <p>Designed by <a href="https://xydris.in" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-orange-600 transition-colors font-bold border-b border-orange-200 hover:border-orange-600">Xydris.in</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
