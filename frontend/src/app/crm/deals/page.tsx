"use client";
import { useState, useEffect } from 'react';
import { useBakery } from "@/context/BakeryContext";
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp , query, where, orderBy, limit } from 'firebase/firestore';
import { Plus, Filter, LayoutGrid, X, Save } from 'lucide-react';

export default function DealsPage() {
  const { profile } = useBakery();
  
  const [deals, setDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ title: '', company: '', amount: '', stage: 'Qualification', closingDate: '' });

  useEffect(() => { fetchDeals(); }, []);

  async function fetchDeals() {
    try {
      const snap = await getDocs(query(collection(db, "deals"), where("bakery_id", "==", profile?.id), orderBy("created_at", "desc"), limit(100)));
      setDeals(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "deals"), { bakery_id: profile?.id, ...formData, createdAt: serverTimestamp() });
      setIsModalOpen(false);
      setFormData({ title: '', company: '', amount: '', stage: 'Qualification', closingDate: '' });
      fetchDeals();
    } catch (error) { console.error(error); } finally { setIsSubmitting(false); }
  };

  const stages: { name: string, color: string, total: string, deals: any[] }[] = [
    { name: "Qualification", color: "bg-slate-200", total: "₹0", deals: deals.filter(d => d.stage === 'Qualification') },
    { name: "Needs Analysis", color: "bg-blue-200", total: "₹0", deals: deals.filter(d => d.stage === 'Needs Analysis') },
    { name: "Proposal/Quote", color: "bg-amber-200", total: "₹0", deals: deals.filter(d => d.stage === 'Proposal/Quote') },
    { name: "Negotiation", color: "bg-purple-200", total: "₹0", deals: deals.filter(d => d.stage === 'Negotiation') },
    { name: "Closed Won", color: "bg-emerald-200", total: "₹0", deals: deals.filter(d => d.stage === 'Closed Won') }
  ];

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Deals Pipeline</h1>
          <p className="text-slate-500 text-sm mt-1">Track and manage your revenue opportunities across stages.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Filter size={18} /> Filter
          </button>
          <button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
            <Plus size={18} /> New Deal
          </button>
        </div>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 flex-1">
        {stages.map(stage => (
          <div key={stage.name} className="flex-shrink-0 w-80 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col h-full max-h-[70vh]">
            <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-2xl">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                <h3 className="font-semibold text-slate-800">{stage.name}</h3>
              </div>
              <span className="text-sm font-bold text-slate-500">{stage.total}</span>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {stage.deals.map(deal => (
                <div key={deal.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-400 transition-all cursor-pointer">
                  <h4 className="font-bold text-slate-900 mb-1">{deal.title}</h4>
                  <p className="text-sm text-blue-600 font-medium mb-3">{deal.company}</p>
                  <div className="flex justify-between items-center text-sm border-t border-slate-100 pt-3">
                    <span className="font-bold text-slate-800">{deal.amount}</span>
                    <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2 py-1 rounded">{deal.closingDate}</span>
                  </div>
                </div>
              ))}
              
              {stage.deals.length === 0 && (
                <div className="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-slate-400 text-sm font-medium">
                  Drop deals here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Create New Deal</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateDeal} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deal Title *</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-lg p-2.5" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company / Account *</label>
                  <input required type="text" className="w-full border border-slate-200 rounded-lg p-2.5" value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹) *</label>
                  <input required type="number" className="w-full border border-slate-200 rounded-lg p-2.5" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Closing Date</label>
                  <input required type="date" className="w-full border border-slate-200 rounded-lg p-2.5" value={formData.closingDate} onChange={e => setFormData({...formData, closingDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pipeline Stage</label>
                <select className="w-full border border-slate-200 rounded-lg p-2.5 bg-white" value={formData.stage} onChange={e => setFormData({...formData, stage: e.target.value})}>
                  <option>Qualification</option>
                  <option>Needs Analysis</option>
                  <option>Proposal/Quote</option>
                  <option>Negotiation</option>
                  <option>Closed Won</option>
                </select>
              </div>
              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium">{isSubmitting ? 'Saving...' : 'Save Deal'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}