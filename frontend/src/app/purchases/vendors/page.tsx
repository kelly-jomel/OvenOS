"use client";
import React, { useState, useEffect } from 'react';
import SideNav from "@/components/SideNav";
import { useBakery } from "@/context/BakeryContext";
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, where, orderBy, limit } from 'firebase/firestore';
import { Plus, Search, Trash2, X, MessageCircle, Eye } from 'lucide-react';
import Link from 'next/link';

export default function VendorsPage() {
  const { profile } = useBakery();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.id) fetchVendors();
  }, [profile?.id]);

  const fetchVendors = async () => {
    try {
      const q = query(collection(db, 'vendors'), where("bakery_id", "==", profile?.id));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      data.sort((a: any, b: any) => (b.created_at?.toMillis?.() || 0) - (a.created_at?.toMillis?.() || 0));
      setVendors(data);
    } catch (err) {
      console.error("Error fetching vendors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

    const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    
    setSubmitting(true);
    const payload = {
      ...formData,
      bakery_id: profile.id,
      created_at: serverTimestamp()
    };

    // Optimistically close modal and fetch
    addDoc(collection(db, 'vendors'), payload).catch(err => {
      console.error("Background save error:", err);
      alert("Error saving in background: " + (err.message || String(err)));
    });

    setTimeout(() => {
      setFormData({});
      setIsModalOpen(false);
      setSubmitting(false);
      fetchVendors();
    }, 300);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this vendor?")) {
      try {
        await deleteDoc(doc(db, 'vendors', id));
        fetchVendors();
      } catch (err) {
        console.error("Error deleting doc:", err);
      }
    }
  };

  const openWhatsApp = (phone: string, company: string) => {
    if (!phone) {
      alert("This vendor does not have a phone number saved.");
      return;
    }
    // Remove non-numeric characters
    const cleanPhone = phone.replace(/\D/g, '');
    const text = encodeURIComponent(`Hi ${company}, `);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  const filteredVendors = vendors.filter(v => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (v.companyName?.toLowerCase().includes(searchLower) || v.contactName?.toLowerCase().includes(searchLower));
  });

  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Vendors" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        <div className="flex justify-between items-center bg-white p-6 rounded-t-2xl shadow-sm border border-slate-100">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Vendors</h1>
            <p className="text-slate-500 text-sm mt-1">Manage your supplier records and orders.</p>
          </div>
          <button 
            onClick={() => { setFormData({}); setIsModalOpen(true); }}
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors"
          >
            <Plus size={18} /> New Vendor
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search vendors..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-medium">Company Name</th>
                  <th className="px-6 py-3 font-medium">Primary Contact</th>
                  <th className="px-6 py-3 font-medium">Phone</th>
                  <th className="px-6 py-3 font-medium">Payable Balance</th>
                  <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">Loading...</td></tr>
                ) : filteredVendors.length > 0 ? (
                  filteredVendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700 font-medium">
                        <Link href={`/purchases/vendors/${vendor.id}`} className="text-blue-600 hover:underline">
                          {vendor.companyName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700">{vendor.contactName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700">{vendor.phone || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-700">₹{parseFloat(vendor.payable || 0).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openWhatsApp(vendor.phone, vendor.companyName)} className="text-green-600 hover:text-green-800 p-1" title="WhatsApp Vendor">
                            <MessageCircle size={18} />
                          </button>
                          <Link href={`/purchases/vendors/${vendor.id}`} className="text-blue-500 hover:text-blue-700 p-1" title="View Profile">
                            <Eye size={18} />
                          </Link>
                          <button onClick={() => handleDelete(vendor.id)} className="text-red-500 hover:text-red-700 p-1" title="Delete Vendor">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-500">No vendors found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add New Vendor</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                <input required type="text" value={formData.companyName || ''} onChange={e => handleInputChange('companyName', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Contact</label>
                <input required type="text" value={formData.contactName || ''} onChange={e => handleInputChange('contactName', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={formData.email || ''} onChange={e => handleInputChange('email', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone (WhatsApp)</label>
                <input required type="text" value={formData.phone || ''} onChange={e => handleInputChange('phone', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Payable Balance (₹)</label>
                <input required type="number" step="0.01" value={formData.payable !== undefined ? formData.payable : ''} onChange={e => handleInputChange('payable', e.target.value !== '' ? Number(e.target.value) : e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium">
                  {submitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
