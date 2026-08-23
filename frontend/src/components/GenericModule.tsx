import React, { useState, useEffect } from 'react';
import { useBakery } from "@/context/BakeryContext";
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp, query, where, orderBy } from 'firebase/firestore';
import { Plus, Search, Trash2, X } from 'lucide-react';

export interface ModuleField {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

interface GenericModuleProps {
  title: string;
  collectionName: string;
  fields: ModuleField[];
}

export default function GenericModule({ title, collectionName, fields }: GenericModuleProps) {
  const { profile } = useBakery();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchItems();
    }
  }, [profile?.id, collectionName]);

  const fetchItems = async () => {
    try {
      const q = query(
        collection(db, collectionName),
        where("bakery_id", "==", profile?.id)
      );
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort in memory by created_at descending if available
      data.sort((a: any, b: any) => {
        const timeA = a.created_at?.toMillis ? a.created_at.toMillis() : 0;
        const timeB = b.created_at?.toMillis ? b.created_at.toMillis() : 0;
        return timeB - timeA;
      });
      setItems(data);
    } catch (err) {
      console.error(`Error fetching ${collectionName}:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.id) return;
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        bakery_id: profile.id,
        created_at: serverTimestamp()
      };
      await addDoc(collection(db, collectionName), payload);
      setFormData({});
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error("Error adding doc:", err);
      alert("Failed to save. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this record?")) {
      try {
        await deleteDoc(doc(db, collectionName, id));
        fetchItems();
      } catch (err) {
        console.error("Error deleting doc:", err);
      }
    }
  };

  const filteredItems = items.filter(item => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return fields.some(f => String(item[f.name] || '').toLowerCase().includes(searchLower));
  });

  return (
    <>
      <div className="flex justify-between items-center bg-white p-6 rounded-t-2xl shadow-sm border border-slate-100 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your {title.toLowerCase()} records.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors"
        >
          <Plus size={18} /> New {title.replace(/s$/, '')}
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder={`Search ${title.toLowerCase()}...`}
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
                {fields.map(f => (
                  <th key={f.name} className="px-6 py-3 font-medium">{f.label}</th>
                ))}
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr><td colSpan={fields.length + 1} className="p-8 text-center text-slate-500">Loading...</td></tr>
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    {fields.map(f => (
                      <td key={f.name} className="px-6 py-4 whitespace-nowrap text-slate-700">
                        {f.type === 'number' ? `$${parseFloat(item[f.name] || 0).toFixed(2)}` : String(item[f.name] || '-')}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700 p-1">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={fields.length + 1} className="p-8 text-center text-slate-500">
                    No {title.toLowerCase()} found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add New {title.replace(/s$/, '')}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              {fields.map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                  {f.type === 'select' ? (
                    <select
                      required
                      value={formData[f.name] || ''}
                      onChange={e => handleInputChange(f.name, e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                    >
                      <option value="" disabled>Select {f.label}</option>
                      {f.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input
                      required
                      type={f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : 'text'}
                      step={f.type === 'number' ? '0.01' : undefined}
                      value={formData[f.name] || ''}
                      onChange={e => handleInputChange(f.name, e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                    />
                  )}
                </div>
              ))}
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
    </>
  );
}
