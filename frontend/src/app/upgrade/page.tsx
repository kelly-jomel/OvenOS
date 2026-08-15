'use client';
import React, { useState, useEffect } from 'react';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import { useRouter } from 'next/navigation';
import { useBakery } from '@/context/BakeryContext';
import Script from 'next/Script';

export default function UpgradePage() {
  const router = useRouter();
  const { profile } = useBakery();
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = (planId: string) => {
    setIsProcessing(true);
    
    // This is a dummy implementation since we don't have a backend Razorpay order creation setup yet
    // In production, this would call your FastAPI backend to generate an order ID
    setTimeout(() => {
      setIsProcessing(false);
      
      if (!(window as any).Razorpay) {
        alert("Payment gateway failed to load. Please try again.");
        return;
      }
      
      const options = {
        key: "rzp_test_dummykey", // Enter the Key ID generated from the Dashboard
        amount: planId === 'pro' ? 2900 * 100 : 9900 * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "CrumbLedger",
        description: `${planId.toUpperCase()} Subscription`,
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
          color: "#ea580c" // orange-600
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <TopNav title="Upgrade" />
      
      <main className="max-w-5xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upgrade Your Bakery</h1>
          <p className="text-gray-500 max-w-xl mx-auto">Get access to advanced analytics, unlimited recipes, and AI-powered imports with CrumbLedger Pro.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 flex flex-col relative opacity-70">
            <div className="absolute top-0 right-0 bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
              CURRENT PLAN
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Basic</h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-gray-900">₹0</span>
              <span className="text-gray-500">/mo</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-gray-600">
                <span className="text-emerald-500">✓</span> Basic order tracking
              </li>
              <li className="flex gap-3 text-gray-600">
                <span className="text-emerald-500">✓</span> Up to 10 recipes
              </li>
              <li className="flex gap-3 text-gray-600">
                <span className="text-emerald-500">✓</span> Standard cost calculations
              </li>
            </ul>
            
            <button disabled className="w-full py-3 px-4 rounded-xl font-medium text-gray-500 bg-gray-100 cursor-not-allowed">
              Active
            </button>
          </div>

          {/* Pro Plan */}
          <div className="bg-white rounded-2xl shadow-xl border-2 border-orange-500 p-8 flex flex-col relative transform scale-105">
            <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">
              RECOMMENDED
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Pro</h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-gray-900">₹2,900</span>
              <span className="text-gray-500">/year</span>
            </div>
            
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex gap-3 text-gray-800">
                <span className="text-orange-500 font-bold">✓</span> <span className="font-medium">Unlimited</span> recipes & products
              </li>
              <li className="flex gap-3 text-gray-800">
                <span className="text-orange-500 font-bold">✓</span> <span className="font-medium">AI Recipe Import</span> via Photo/URL
              </li>
              <li className="flex gap-3 text-gray-800">
                <span className="text-orange-500 font-bold">✓</span> Advanced dashboard analytics
              </li>
              <li className="flex gap-3 text-gray-800">
                <span className="text-orange-500 font-bold">✓</span> Invoicing & Quotation generation
              </li>
              <li className="flex gap-3 text-gray-800">
                <span className="text-orange-500 font-bold">✓</span> Priority support
              </li>
            </ul>
            
            <button 
              onClick={() => handleSubscribe('pro')}
              disabled={isProcessing}
              className="w-full py-3 px-4 rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-200 transition flex justify-center items-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : (
                'Upgrade to Pro'
              )}
            </button>
            <p className="text-center text-xs text-gray-400 mt-4">Secure payment powered by Razorpay</p>
          </div>
        </div>
      </main>
      
      <BottomNav />
    </div>
  );
}
