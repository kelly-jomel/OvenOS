'use client';

import React, { useEffect, useState, Suspense } from 'react';
import SideNav from '@/components/SideNav';
import { useSearchParams, useRouter } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { ArrowLeft, Edit, Mail, Phone, MapPin, FileText, User } from 'lucide-react';
import Link from 'next/link';

function ClientProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  
  const [client, setClient] = useState<any>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    
    async function fetchData() {
      try {
        const docRef = doc(db, 'clients', id as string);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setClient({ id: docSnap.id, ...docSnap.data() });
        }
        
        // Fetch invoices for this client
        const invQuery = query(collection(db, 'invoices'), where('client_id', '==', id));
        const invSnap = await getDocs(invQuery);
        const invData = invSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setInvoices(invData);
        
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen lg:pl-64 flex items-center justify-center text-slate-500">Loading profile...</div>;
  if (!client) return <div className="min-h-screen lg:pl-64 flex items-center justify-center text-red-500">Customer not found.</div>;

  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Customer Profile" />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push('/clients')} className="p-2 hover:bg-slate-200 rounded-full text-slate-600 transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">{client.displayName || client.name || `${client.firstName} ${client.lastName}`}</h1>
            <p className="text-slate-500 text-sm">{client.companyName || 'No Company'}</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 flex items-center gap-2 rounded-md shadow-sm transition-colors text-sm font-medium">
            <Edit size={16} /> Edit Customer
          </button>
        </div>

        {/* Profile Details Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2">Overview</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex items-start gap-3 text-slate-700">
                <Mail className="text-slate-400 mt-1" size={18} />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Email</div>
                  <div>{client.email || '-'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-slate-700">
                <Phone className="text-slate-400 mt-1" size={18} />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Phone</div>
                  <div>{client.mobilePhone || client.workPhone || '-'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-slate-700">
                <MapPin className="text-slate-400 mt-1" size={18} />
                <div>
                  <div className="text-xs text-slate-500 font-medium">Billing Address</div>
                  <div className="whitespace-pre-wrap">{client.address || '-'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3 text-slate-700">
                <FileText className="text-slate-400 mt-1" size={18} />
                <div>
                  <div className="text-xs text-slate-500 font-medium">GSTIN</div>
                  <div>{client.gstin || 'Not Registered'}</div>
                </div>
              </div>
            </div>
            
            {(client.remarks || client.reportingTags) && (
              <div className="pt-4 border-t border-slate-100">
                {client.reportingTags && (
                  <div className="mb-3">
                    <span className="text-xs font-bold text-slate-500 uppercase">Tags:</span> 
                    <span className="ml-2 inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded">{client.reportingTags}</span>
                  </div>
                )}
                {client.remarks && (
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase">Remarks:</span>
                    <p className="mt-1 text-sm text-slate-700">{client.remarks}</p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Financials</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-slate-500 font-medium">Currency</div>
                <div className="text-slate-900 font-medium">{client.currency || 'INR'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 font-medium">Payment Terms</div>
                <div className="text-slate-900">{client.paymentTerms || 'Due on Receipt'}</div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <div className="text-sm text-slate-500 font-medium">Total Invoices</div>
                <div className="text-2xl font-bold text-slate-900">{invoices.length}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoices List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mt-6">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center">
            <h3 className="font-bold text-slate-800">Recent Invoices</h3>
            <Link href="/invoices" className="text-sm text-blue-600 font-medium hover:underline">View All</Link>
          </div>
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Invoice #</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Amount</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500 text-sm">No invoices found for this customer.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{new Date(inv.date || inv.created_at?.toDate()).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 cursor-pointer">{inv.invoice_number || `#INV-${inv.id.substring(0,6)}`}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${inv.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {inv.status || 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-slate-900">
                      ₹{parseFloat(inv.total || inv.amount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
      </main>
    </div>
  );
}

export default function ClientProfile() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ClientProfileContent />
    </Suspense>
  );
}
