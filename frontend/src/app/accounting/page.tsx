'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import SideNav from '@/components/SideNav';
import { useBakery } from '@/context/BakeryContext';

type AccountingData = {
  profit_and_loss: {
    total_sales: number;
    total_expenses: number;
    total_waste: number;
    net_profit: number;
  };
  balance_sheet: {
    accounts_receivable: number;
    accounts_payable: number;
  };
};

export default function AccountingPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AccountingData | null>(null);
  const { currencySymbol } = useBakery();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        fetchAccounting();
      }
    });

    return () => unsubscribe();
  }, [router]);

  async function fetchAccounting() {
    try {
      const response = await api.get('/accounting/dashboard');
      setData(response.data);
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert("Admin privileges required to view accounting data.");
        router.push('/dashboard');
      }
      console.error('Failed to fetch accounting', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen lg:pl-64 flex items-center justify-center bg-[#F9F9FA]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FDB813]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:pl-64 bg-[#F9F9FA] font-sans">
      <SideNav title="Accounting" />

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1C2833]">Accounting Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time Profit & Loss and Balance Sheet overview.</p>
        </div>

        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Profit & Loss */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1C2833] mb-4">Profit & Loss</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Sales</span>
                  <span className="font-medium text-green-600">{currencySymbol}{data.profit_and_loss.total_sales.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Expenses</span>
                  <span className="font-medium text-red-600">-{currencySymbol}{data.profit_and_loss.total_expenses.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <span className="text-gray-600">Total Waste</span>
                  <span className="font-medium text-orange-600">-{currencySymbol}{data.profit_and_loss.total_waste.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="font-bold text-[#1C2833]">Net Profit</span>
                  <span className={`font-bold text-xl ${data.profit_and_loss.net_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {currencySymbol}{data.profit_and_loss.net_profit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Balance Sheet Highlights */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-[#1C2833] mb-4">Balance Sheet Highlights</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div>
                    <span className="block text-gray-600 font-medium">Accounts Receivable</span>
                    <span className="block text-xs text-gray-400">Money owed to you</span>
                  </div>
                  <span className="font-bold text-blue-600">{currencySymbol}{data.balance_sheet.accounts_receivable.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                  <div>
                    <span className="block text-gray-600 font-medium">Accounts Payable</span>
                    <span className="block text-xs text-gray-400">Money you owe</span>
                  </div>
                  <span className="font-bold text-red-600">{currencySymbol}{data.balance_sheet.accounts_payable.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
