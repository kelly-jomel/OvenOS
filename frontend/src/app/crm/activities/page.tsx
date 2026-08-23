"use client";
import { useState, useEffect } from 'react';
import { useBakery } from "@/context/BakeryContext";
import { Plus, X, Save } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp , query, where} from 'firebase/firestore';

export default function ActivitiesPage() {
  const { profile } = useBakery();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({ title: '', type: 'Task', status: 'Open', date: '' });

  useEffect(() => { fetchItems(); }, []);

  const fetchItems = async () => {
    try {
      const snap = await getDocs(query(collection(db, "activities"), where("bakery_id", "==", profile?.id)));
      setItems(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "activities"), { bakery_id: profile?.id, ...formData, createdAt: serverTimestamp() });
      setIsModalOpen(false);
      setFormData({ title: '', type: 'Task', status: 'Open', date: '' });
      fetchItems();
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Activities</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your activities.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
          <Plus size={18} /> Create New
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
        <table className="w-full min-w-[800px] text-sm text-left text-slate-600">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
            <tr><th className="px-6 py-4">Task / Subject</th><th className="px-6 py-4">Type</th><th className="px-6 py-4">Status</th><th className="px-6 py-4">Due Date</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={10} className="p-6 text-center text-slate-500">Loading...</td></tr> : items.length === 0 ? <tr><td colSpan={10} className="p-12 text-center text-slate-500">No activities found.</td></tr> : items.map(item => <tr key={item.id} className="hover:bg-slate-50"><td className="px-6 py-4">{item.title}</td><td className="px-6 py-4">{item.type}</td><td className="px-6 py-4">{item.status}</td><td className="px-6 py-4">{item.date}</td></tr>)}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Create Activities</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">Task / Subject</label>
    <input required type="text" className="w-full border border-slate-200 rounded-lg p-2.5" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
  </div>
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
    <select required className="w-full border border-slate-200 rounded-lg p-2.5 bg-white" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
           <option>Call</option><option>Meeting</option><option>Email</option><option>Task</option>
         </select>
  </div>
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
    <select required className="w-full border border-slate-200 rounded-lg p-2.5 bg-white" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
           <option>Open</option><option>In Progress</option><option>Completed</option>
         </select>
  </div>
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
    <input required type="date" className="w-full border border-slate-200 rounded-lg p-2.5" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
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