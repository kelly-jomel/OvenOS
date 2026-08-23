"use client";

import { useState, useEffect } from 'react';
import { useBakery } from "@/context/BakeryContext";
import { db } from '@/lib/firebase';
import AddClientModal from '@/components/AddClientModal';
import { collection, getDocs, getDoc, doc, addDoc , query, where} from 'firebase/firestore';
import { format } from 'date-fns';
import { DownloadInvoiceButton } from '@/components/InvoicePDF'; // Reuse the PDF generator

interface Client {
  id: string;
  name: string;
  gstin: string;
  address: string;
}

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
}

export default function EstimatesPage() {
  const { profile } = useBakery();
  const [clients, setClients] = useState<Client[]>([]);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  
  // Estimate Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [gstType, setGstType] = useState('IGST'); // IGST (18%) or CGST+SGST (9% + 9%)
  const [items, setItems] = useState<LineItem[]>([{ description: '', quantity: 1, rate: 0 }]);

  async function fetchData() {
    try {
      const clientsSnap = await getDocs(query(collection(db, "clients"), where("bakery_id", "==", profile?.id)));
      setClients(clientsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
      
      const itemsSnap = await getDocs(query(collection(db, "items"), where("bakery_id", "==", profile?.id)));
      setCatalogItems(itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const estimatesSnap = await getDocs(query(collection(db, "estimates"), where("bakery_id", "==", profile?.id)));
      setEstimates(estimatesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const profileSnap = await getDoc(doc(db, "settings", "business_profile"));
      if (profileSnap.exists()) setBusinessProfile(profileSnap.data());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subtotal * 0.18;
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSaveEstimate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) return alert("Please select a client");
    
    const client = clients.find(c => c.id === selectedClientId);
    const totals = calculateTotals();
    
    const estimateData = {
      clientName: client?.name,
      clientId: client?.id,
      date: new Date().toISOString(),
      items,
      gstType,
      ...totals,
      status: 'Sent'
    };

    try {
      await addDoc(collection(db, "estimates"), { ...estimateData, bakery_id: profile?.id });
      setShowForm(false);
      setItems([{ description: '', quantity: 1, rate: 0 }]);
      fetchData();
    } catch (error) {
      console.error("Error saving estimate", error);
    }
  };

  const handleItemSelect = (index: number, catalogItemId: string) => {
    const selected = catalogItems.find(i => i.id === catalogItemId);
    if (selected) {
      const newItems = [...items];
      newItems[index].description = selected.name + (selected.description ? ` - ${selected.description}` : '');
      newItems[index].rate = selected.price;
      setItems(newItems);
    }
  };

  const convertToInvoice = async (estimate: any) => {
    if (confirm(`Convert Estimate for ${estimate.clientName} to an Invoice?`)) {
      try {
        const invoiceData = {
          ...estimate,
          date: new Date().toISOString(),
          status: 'Draft'
        };
        delete invoiceData.id;
        await addDoc(collection(db, "invoices"), { ...invoiceData, bakery_id: profile?.id });
        alert('Successfully converted to Invoice! Check the Invoices tab.');
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <AddClientModal 
        isOpen={isClientModalOpen} 
        onClose={() => setIsClientModalOpen(false)} 
        onClientAdded={(newClient: any) => {
          setClients(prev => [...prev, newClient]);
          setSelectedClientId(newClient.id);
        }}
      />
      <div className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Estimates & Quotes</h1>
          <p className="text-slate-500 mt-2">Send proposals and quotes to potential clients.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          {showForm ? 'Cancel' : '+ Create Estimate'}
        </button>
      </header>

      {showForm && (
        <form onSubmit={handleSaveEstimate} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6 border-t-4 border-t-purple-500">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Select Client</label>
              <select value={selectedClientId} onChange={e => { if (e.target.value === 'add_new') setIsClientModalOpen(true); else setSelectedClientId(e.target.value); }} className="w-full p-2 border rounded-md" required>
                <option value="">-- Select Client --</option>
                    <option value="add_new" className="text-blue-600 font-bold">+ New Customer</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">GST Type</label>
              <select value={gstType} onChange={e => setGstType(e.target.value)} className="w-full p-2 border rounded-md">
                <option value="IGST">IGST (18% - Inter-state)</option>
                <option value="CGST_SGST">CGST (9%) + SGST (9%) (Intra-state)</option>
              </select>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Line Items</h3>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex flex-col md:flex-row gap-3 items-end">
                  <div className="w-full md:w-1/4">
                    <label className="block text-xs text-slate-500 mb-1">Select from Catalog (Optional)</label>
                    <select onChange={e => handleItemSelect(index, e.target.value)} className="w-full p-2 border rounded-md bg-slate-50 text-sm">
                      <option value="">-- Custom Item --</option>
                      {catalogItems.map(cItem => (
                        <option key={cItem.id} value={cItem.id}>{cItem.name} (₹{cItem.price})</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs text-slate-500 mb-1">Description</label>
                    <input type="text" value={item.description} onChange={e => {
                      const newItems = [...items]; newItems[index].description = e.target.value; setItems(newItems);
                    }} className="w-full p-2 border rounded-md text-sm" required />
                  </div>
                  <div className="w-24">
                    <label className="block text-xs text-slate-500 mb-1">Qty</label>
                    <input type="number" min="1" value={item.quantity} onChange={e => {
                      const newItems = [...items]; newItems[index].quantity = Number(e.target.value); setItems(newItems);
                    }} className="w-full p-2 border rounded-md text-sm" required />
                  </div>
                  <div className="w-32">
                    <label className="block text-xs text-slate-500 mb-1">Rate (₹)</label>
                    <input type="number" min="0" step="0.01" value={item.rate} onChange={e => {
                      const newItems = [...items]; newItems[index].rate = Number(e.target.value); setItems(newItems);
                    }} className="w-full p-2 border rounded-md text-sm" required />
                  </div>
                  <button type="button" onClick={() => setItems(items.filter((_, i) => i !== index))} className="p-2 text-red-500 hover:bg-red-50 rounded-md">
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => setItems([...items, { description: '', quantity: 1, rate: 0 }])} className="mt-3 text-sm text-blue-600 font-medium">
              + Add Line Item
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg flex flex-col items-end space-y-2">
            <div className="text-sm text-slate-600">Subtotal: ₹{calculateTotals().subtotal.toFixed(2)}</div>
            <div className="text-sm text-slate-600">GST (18%): ₹{calculateTotals().tax.toFixed(2)}</div>
            <div className="text-lg font-bold text-slate-900 border-t pt-2 mt-2">Total: ₹{calculateTotals().total.toFixed(2)}</div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-6 rounded-lg">
              Save Estimate
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {estimates.map((est) => (
              <tr key={est.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{format(new Date(est.date), 'MMM dd, yyyy')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{est.clientName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">₹{est.total?.toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {est.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-4">
                  <button onClick={() => convertToInvoice(est)} className="text-green-600 hover:text-green-900">Make Invoice</button>
                  {typeof window !== 'undefined' && (
                    <DownloadInvoiceButton 
                      invoice={{...est, id: 'EST-' + est.id}} 
                      businessProfile={businessProfile} 
                      client={clients.find(c => c.name === est.clientName)} 
                    />
                  )}
                </td>
              </tr>
            ))}
            {estimates.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No estimates generated yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}
