'use client';

import React, { useEffect, useState, Suspense } from 'react';
import SideNav from '@/components/SideNav';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Printer, Download, Send, CreditCard } from 'lucide-react';

function ProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        const docRef = doc(db, 'invoices', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setData({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen lg:pl-64 flex items-center justify-center text-slate-500">Loading details...</div>;
  if (!data) return <div className="min-h-screen lg:pl-64 flex items-center justify-center text-red-500">Record not found.</div>;

  const displayId = data.invoice_number || data.order_number || data.estimate_number || `#${data.id.substring(0, 8).toUpperCase()}`;

  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Invoice Details" />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{displayId}</h1>
              <p className="text-slate-500 text-sm">{data.clientName || data.vendorName || 'Unknown Entity'}</p>
            </div>
            <span className={`ml-4 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-800 uppercase`}>
              {data.status || 'Draft'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-md" title="Print"><Printer size={18} /></button>
            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-md" title="Download PDF"><Download size={18} /></button>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center gap-2 rounded-md shadow-sm transition-colors text-sm font-medium">
              <Send size={16} /> Send Email
            </button>
          </div>
        </div>

        {/* Document Preview (Zoho Style) */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 max-w-4xl mx-auto min-h-[800px]">
          <div className="flex justify-between items-start border-b border-slate-200 pb-8 mb-8">
            <div>
              <h2 className="text-3xl font-light text-slate-800 uppercase tracking-wider mb-2">Invoice</h2>
              <p className="text-slate-500 font-medium">{displayId}</p>
            </div>
            <div className="text-right text-sm text-slate-600">
              <p className="font-bold text-slate-900 mb-1">Bill To:</p>
              <p>{data.clientName || data.vendorName}</p>
              <p>{data.email}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Date:</p>
              <p className="font-medium text-slate-900">{data.date ? new Date(data.date).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 mb-1">Total Amount:</p>
              <p className="font-bold text-xl text-slate-900">{data.currency || '₹'} {parseFloat(data.total || data.amount || 0).toFixed(2)}</p>
            </div>
          </div>

          <table className="w-full text-sm text-left mb-8">
            <thead className="bg-slate-50 border-y border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold text-slate-700">Item</th>
                <th className="py-3 px-4 font-semibold text-slate-700 text-right">Qty</th>
                <th className="py-3 px-4 font-semibold text-slate-700 text-right">Rate</th>
                <th className="py-3 px-4 font-semibold text-slate-700 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items && data.items.map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-3 px-4">{item.name || item.description || 'Item'}</td>
                  <td className="py-3 px-4 text-right">{item.quantity || 1}</td>
                  <td className="py-3 px-4 text-right">{parseFloat(item.rate || item.price || 0).toFixed(2)}</td>
                  <td className="py-3 px-4 text-right font-medium">{parseFloat(item.amount || item.total || 0).toFixed(2)}</td>
                </tr>
              ))}
              {(!data.items || data.items.length === 0) && (
                <tr><td colSpan={4} className="py-4 text-center text-slate-400">No line items detailed.</td></tr>
              )}
            </tbody>
          </table>
          
          <div className="flex justify-end border-t border-slate-200 pt-4">
            <div className="w-64 space-y-2 text-sm">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>{parseFloat(data.subTotal || data.total || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-900 font-bold text-base pt-2 border-t border-slate-200">
                <span>Total</span>
                <span>{data.currency || '₹'} {parseFloat(data.total || data.amount || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default function GenericProfile() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
