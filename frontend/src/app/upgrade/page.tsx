'use client';
import React, { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'next/navigation';
import { useBakery } from '@/context/BakeryContext';
import Script from 'next/script';

export default function UpgradePage() {
  const router = useRouter();
  const { profile, country, currencySymbol } = useBakery();
  const [isProcessing, setIsProcessing] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  const pricing = {
    IN: { monthly: 500, annual: 4800 },
    US: { monthly: 10, annual: 96 },
    GB: { monthly: 8, annual: 76.8 },
  };

  const currentCountry = (country || 'IN') as keyof typeof pricing;
  const currentPricing = pricing[currentCountry] || pricing['IN'];
  
  const price = billingCycle === 'monthly' ? currentPricing.monthly : (currentPricing.annual / 12);
  const totalAmount = billingCycle === 'monthly' ? currentPricing.monthly : currentPricing.annual;

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = () => {
    setIsProcessing(true);
    
    setTimeout(() => {
      setIsProcessing(false);
      
      if (!(window as any).Razorpay) {
        alert("Payment gateway failed to load. Please try again.");
        return;
      }
      
      const options = {
        key: "rzp_test_dummykey",
        amount: Math.round(totalAmount * 100), // sub-units
        currency: currentCountry === 'US' ? 'USD' : currentCountry === 'GB' ? 'GBP' : 'INR',
        name: "CrumbLedger",
        description: `CrumbLedger Pro - ${billingCycle.toUpperCase()}`,
        image: "https://www.crumbledger.com/logo.png",
        handler: function (response: any) {
          alert(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
          router.push('/dashboard');
        },
        prefill: {
          name: profile?.bakery_name || "Bakery Owner",
          email: "owner@bakery.com",
          contact: profile?.phone || "9999999999"
        },
        theme: {
          color: "#fbbf24" // jupiter-gold
        }
      };
      
      const rzp1 = new (window as any).Razorpay(options);
      rzp1.on('payment.failed', function (response: any){
        alert(response.error.description);
      });
      rzp1.open();
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-data">
      <TopNav title="Upgrade" />
      
      <main className="max-w-4xl mx-auto px-4 py-16">
        {/* Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-200 p-1 rounded-full inline-flex items-center">
            <button 
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition ${billingCycle === 'monthly' ? 'bg-white text-ledger-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2 rounded-full text-sm font-bold transition flex items-center gap-2 ${billingCycle === 'annual' ? 'bg-white text-ledger-navy shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Annual <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Pricing Card */}
        <div className="relative bg-ledger-navy rounded-xl shadow-2xl p-1 border-2 border-jupiter-gold max-w-3xl mx-auto">
          {/* Badge */}
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-jupiter-gold text-ledger-navy font-bold text-xs tracking-widest px-4 py-1.5 rounded-md shadow-md uppercase">
            All-in-one Plan
          </div>
          
          <div className="p-8 md:p-12 text-center">
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">CrumbLedger Pro</h1>
            <p className="text-gray-400 mb-8">Everything you need to run your business profitably.</p>
            
            <div className="flex items-center justify-center gap-1 mb-12">
              <span className="text-5xl md:text-6xl font-bold text-white">{currencySymbol}{price}</span>
              <span className="text-gray-400 text-lg">/month</span>
            </div>
            
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-left max-w-2xl mx-auto mb-12">
              <div className="flex items-start gap-3">
                <span className="text-jupiter-gold font-bold">✓</span>
                <span className="text-gray-300">Advanced Dynamic Recipe Costing</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-jupiter-gold font-bold">✓</span>
                <span className="text-gray-300">B2B Invoicing & Tax Calculation</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-jupiter-gold font-bold">✓</span>
                <span className="text-gray-300">Unlimited Recipes & Ingredients</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-jupiter-gold font-bold">✓</span>
                <span className="text-gray-300">Custom Order Pipeline & CRM</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-jupiter-gold font-bold">✓</span>
                <span className="text-gray-300">Standard POS & Cart System</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-jupiter-gold font-bold">✓</span>
                <span className="text-gray-300">Advanced Financial Accounting Reports</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-jupiter-gold font-bold">✓</span>
                <span className="text-gray-300">Multi-Location Inventory Sync</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-jupiter-gold font-bold">✓</span>
                <span className="text-gray-300">Priority Live Chat Support</span>
              </div>
            </div>
            
            <button 
              onClick={handleSubscribe}
              disabled={isProcessing}
              className="w-full md:w-3/4 mx-auto py-4 px-6 rounded-lg font-bold text-lg text-ledger-navy bg-jupiter-gold hover:bg-yellow-400 transition flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-ledger-navy border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Start Free Trial'
              )}
            </button>
            <p className="text-xs text-gray-500 mt-4">
              {billingCycle === 'annual' ? `Billed ${currencySymbol}${totalAmount} annually.` : 'Billed monthly.'} 
              Cancel anytime.
            </p>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
