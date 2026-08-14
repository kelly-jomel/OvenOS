import Link from 'next/link';
import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper-white font-data text-ink-grey selection:bg-jupiter-gold selection:text-ledger-navy">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-paper-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1">
            <span className="font-brand font-bold tracking-tighter text-ledger-navy text-2xl">Crumb</span>
            <span className="font-data font-light tracking-[0.15em] text-ledger-navy text-2xl uppercase">Ledger</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-brand font-medium text-ledger-navy hover:opacity-80 transition-opacity">
              Log In
            </Link>
            <Link href="/signup" className="text-sm font-brand font-bold bg-jupiter-gold text-ledger-navy px-5 py-2 rounded-md hover:bg-yellow-400 transition-colors shadow-sm">
              Start Free
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="font-brand font-extrabold text-5xl md:text-7xl text-ledger-navy tracking-tight mb-6 max-w-4xl mx-auto leading-tight">
            Bake Your Passion. <br />
            <span className="text-jupiter-gold">We’ll Handle the Paperwork.</span>
          </h1>
          <p className="font-data text-lg md:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            The all-in-one financial, inventory, and order management app built exclusively for home bakers. Calculate recipe costs to the gram, track your pantry, and collect UPI payments via WhatsApp—all from your kitchen.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/signup" className="font-brand font-bold text-lg bg-ledger-navy text-paper-white px-8 py-4 rounded-md hover:bg-gray-800 transition-colors shadow-lg shadow-ledger-navy/20">
              Start Your Kitchen Ledger (Free)
            </Link>
            <a href="#features" className="font-brand font-bold text-lg bg-white text-ledger-navy border border-gray-200 px-8 py-4 rounded-md hover:bg-gray-50 transition-colors shadow-sm">
              See How It Works
            </a>
          </div>
          <p className="font-data text-sm text-gray-500 mt-6">
            Join hundreds of home bakers simplifying their business today. No credit card required.
          </p>
        </div>
        
        {/* Subtle Background Elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-jupiter-gold/10 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-brand font-bold text-3xl md:text-4xl text-ledger-navy tracking-tight">
              Everything you need. Nothing you don't.
            </h2>
            <p className="font-data mt-4 text-gray-600 max-w-2xl mx-auto text-lg">
              Punchy, action-oriented tools built to simplify your baking business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="bg-paper-white p-8 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="w-12 h-12 bg-jupiter-gold/20 rounded-md flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                ⚖️
              </div>
              <h3 className="font-brand font-bold text-xl text-ledger-navy mb-3">Never Guess Your Profits Again.</h3>
              <p className="font-data text-gray-600 text-sm mb-4 leading-relaxed flex-1">
                Input your ingredients in grams or liters, and CrumbLedger automatically calculates the exact cost per batch. Know your true profit margin on every single cupcake.
              </p>
              <p className="font-data text-xs font-semibold text-yield-green tracking-wide uppercase">
                Profitability, down to the last gram.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-paper-white p-8 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="w-12 h-12 bg-ledger-navy/10 rounded-md flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                📦
              </div>
              <h3 className="font-brand font-bold text-xl text-ledger-navy mb-3">Track Your Stock, Stop the Waste.</h3>
              <p className="font-data text-gray-600 text-sm mb-4 leading-relaxed flex-1">
                Keep a digital eye on your flour, butter, and fondant. Our smart inventory system deducts ingredients as you log orders and alerts you before you run out.
              </p>
              <p className="font-data text-xs font-semibold text-ledger-navy tracking-wide uppercase">
                Never run out of vanilla extract.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-paper-white p-8 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="w-12 h-12 bg-jupiter-gold/20 rounded-md flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                🧾
              </div>
              <h3 className="font-brand font-bold text-xl text-ledger-navy mb-3">Professional Invoices in Seconds.</h3>
              <p className="font-data text-gray-600 text-sm mb-4 leading-relaxed flex-1">
                Generate beautiful, GST-compliant invoices with just a few taps. Add your logo, apply custom discounts, and send them directly to your clients.
              </p>
              <p className="font-data text-xs font-semibold text-yield-green tracking-wide uppercase">
                Look professional. Get paid faster.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-paper-white p-8 rounded-md border border-gray-100 shadow-sm hover:shadow-md transition-shadow group flex flex-col">
              <div className="w-12 h-12 bg-ledger-navy/10 rounded-md flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform">
                🏪
              </div>
              <h3 className="font-brand font-bold text-xl text-ledger-navy mb-3">Your Own Bakery Website.</h3>
              <p className="font-data text-gray-600 text-sm mb-4 leading-relaxed flex-1">
                Stop taking orders via chaotic Instagram DMs. Launch a custom-branded digital storefront where customers can browse your menu, place orders, and pay instantly.
              </p>
              <p className="font-data text-xs font-semibold text-ledger-navy tracking-wide uppercase">
                Sell while you sleep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* NOTIFICATIONS SECTION */}
      <section className="py-24 bg-ledger-navy text-paper-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-brand font-bold text-3xl md:text-5xl tracking-tight mb-6 text-white">
                Seamless WhatsApp & <span className="text-jupiter-gold">UPI Integrations</span>
              </h2>
              <p className="font-data text-lg text-gray-300 mb-8 leading-relaxed">
                Keep your customers in the loop without the manual hassle. CrumbLedger automates your communication so you can focus on the oven.
              </p>
              <ul className="space-y-6">
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-md bg-jupiter-gold flex items-center justify-center shrink-0 mt-1 text-ledger-navy font-bold">✓</div>
                  <div>
                    <h4 className="font-brand font-bold text-xl text-white">Automated Order Confirmations</h4>
                    <p className="font-data text-gray-400 text-sm mt-1">Send beautiful WhatsApp messages confirming cake details and delivery times.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-md bg-jupiter-gold flex items-center justify-center shrink-0 mt-1 text-ledger-navy font-bold">✓</div>
                  <div>
                    <h4 className="font-brand font-bold text-xl text-white">One-Click UPI Reminders</h4>
                    <p className="font-data text-gray-400 text-sm mt-1">Stop chasing payments awkwardly. Send a gentle reminder with a direct UPI payment link.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Simulated Phone UI */}
            <div className="relative mx-auto w-full max-w-sm">
              <div className="absolute inset-0 bg-jupiter-gold/20 blur-3xl rounded-full"></div>
              <div className="relative bg-paper-white rounded-[2.5rem] border-[8px] border-gray-900 shadow-2xl p-4 overflow-hidden h-[600px] flex flex-col font-data text-ink-grey">
                {/* Phone Header */}
                <div className="bg-white -mx-4 -mt-4 px-4 pt-10 pb-4 border-b border-gray-200 flex items-center gap-3">
                  <div className="w-10 h-10 bg-yield-green rounded-full flex items-center justify-center text-white text-lg shadow-sm">
                    💬
                  </div>
                  <div>
                    <p className="font-brand font-bold text-ink-grey text-sm">CrumbLedger Bot</p>
                    <p className="text-xs text-gray-500">Online</p>
                  </div>
                </div>
                {/* Chat Bubbles */}
                <div className="flex-1 overflow-y-auto pt-6 space-y-4">
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm p-3 shadow-sm w-[85%]">
                    <p className="text-sm">
                      Hi Priya! 🧁 Your order for <strong>Chocolate Truffle (1kg)</strong> is confirmed. Total: ₹1,200. We’re excited to bake this for you! You can track your status here: crb.so/trk
                    </p>
                    <p className="text-[10px] text-gray-400 text-right mt-1">10:42 AM</p>
                  </div>
                  
                  <div className="bg-[#E8F8F5] border border-[#A2D9CE] rounded-2xl rounded-tl-sm p-3 shadow-sm w-[85%] mt-6">
                    <p className="text-sm text-ledger-navy">
                      Hi Priya, a gentle reminder that a balance of <strong>₹600</strong> is pending for your bakery order. You can pay instantly via UPI here: crb.so/pay. Thank you! 🎂
                    </p>
                    <p className="text-[10px] text-gray-400 text-right mt-1">11:15 AM</p>
                  </div>

                  <div className="bg-[#FDEDEC] border border-[#F5B7B1] rounded-2xl rounded-tr-sm p-3 shadow-sm w-[85%] self-end ml-auto mt-6">
                    <p className="text-sm text-red-900">
                      🚨 <strong>Heads up!</strong> You have less than 500g of Callebaut Dark Chocolate left. Tap here to reorder from your supplier.
                    </p>
                    <p className="text-[10px] text-gray-400 text-right mt-1">12:30 PM</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER (Empathy & Final CTA) */}
      <footer className="bg-paper-white pt-24 pb-12 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="font-brand font-bold text-3xl md:text-4xl text-ledger-navy mb-6">
            Built By Bakers, For Bakers.
          </h2>
          <p className="font-data text-lg text-gray-600 mb-10 leading-relaxed">
            We know that baking is a science, but running a business shouldn't feel like one. 
            Whether you're struggling to calculate baking shrinkage, confused about HSN codes for GST, or just tired of forgetting who owes you an advance payment—CrumbLedger is designed to feel like a helpful assistant sitting right on your kitchen counter.
          </p>
          <div className="bg-jupiter-gold/10 border border-jupiter-gold/30 rounded-md p-8 md:p-12 mb-16 shadow-inner">
            <h3 className="font-brand font-bold text-2xl text-ledger-navy mb-4">
              Ready to turn your passion into a profitable business?
            </h3>
            <Link href="/signup" className="inline-block font-brand font-bold text-lg bg-ledger-navy text-paper-white px-8 py-4 rounded-md hover:bg-gray-800 transition-colors shadow-lg">
              Open My Ledger Today
            </Link>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-between border-t border-gray-200 pt-8 mt-8">
            <div className="flex items-center gap-1 mb-4 md:mb-0 opacity-80">
              <span className="font-brand font-bold tracking-tight text-ledger-navy text-xl">Crumb</span>
              <span className="font-data font-light tracking-[0.15em] text-ledger-navy text-xl uppercase">Ledger</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500 font-data">
              <Link href="/terms" className="hover:text-ledger-navy transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="hover:text-ledger-navy transition-colors">Privacy Policy</Link>
              <a href="#" className="hover:text-ledger-navy transition-colors">Contact Support</a>
            </div>
          </div>
          <p className="text-gray-400 text-xs mt-6 font-data">
            &copy; {new Date().getFullYear()} CrumbLedger. All rights reserved. Made with ❤️ for bakers everywhere.
          </p>
        </div>
      </footer>
    </div>
  );
}
