"use client";
import { useState, useEffect } from 'react';
import { useBakery } from "@/context/BakeryContext";
import { Plus, X, Save } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp , query, where} from 'firebase/firestore';

export default function AccountsPage() {
  const { profile } = useBakery();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', industry: '', website: '', phone: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const snap = await getDocs(query(collection(db, "accounts"), where("bakery_id", "==", profile?.id)));
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "accounts"), { bakery_id: profile?.id, ...formData, createdAt: serverTimestamp() });
      setIsModalOpen(false);
      setFormData({ name: '', industry: '', website: '', phone: '' });
      fetchItems();
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Accounts</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your accounts.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
          <Plus size={18} /> Create New
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr><th className="px-6 py-4">Account Name</th><th className="px-6 py-4">Industry</th><th className="px-6 py-4">Website</th><th className="px-6 py-4">Phone</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={10} className="p-6 text-center text-slate-500">Loading...</td></tr> : items.length === 0 ? <tr><td colSpan={10} className="p-12 text-center text-slate-500">No accounts found.</td></tr> : items.map(item => <tr key={item.id} className="hover:bg-slate-50"><td className="px-6 py-4">{item.name}</td><td className="px-6 py-4">{item.industry}</td><td className="px-6 py-4">{item.website}</td><td className="px-6 py-4">{item.phone}</td></tr>)}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Create Accounts</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">Account Name</label>
    <input required type="text" className="w-full border border-slate-200 rounded-lg p-2.5" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
  </div>
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">Industry</label>
    <input required type="text" className="w-full border border-slate-200 rounded-lg p-2.5" value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
  </div>
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
    <input required type="text" className="w-full border border-slate-200 rounded-lg p-2.5" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
  </div>
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
    <input required type="text" className="w-full border border-slate-200 rounded-lg p-2.5" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
  </div>
              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium">{isSubmitting ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}