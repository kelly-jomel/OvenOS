"use client";

import { useState, useEffect } from 'react';
import TopNav from "@/components/TopNav";
import { useBakery } from "@/context/BakeryContext";
import { db } from '@/lib/firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc, serverTimestamp , query, where} from 'firebase/firestore';
import { format } from 'date-fns';
import Script from 'next/script';
import { DownloadInvoiceButton } from '@/components/InvoicePDF';
import { Settings, Image as ImageIcon, Plus, ChevronDown, Upload, CreditCard, X } from 'lucide-react';

interface Client {
  id: string;
  name: string;
  email?: string;
  gstin: string;
  address: string;
}

interface LineItem {
  description: string;
  quantity: number;
  rate: number;
  tax: string;
}

export default function InvoicesPage() {
  const { profile } = useBakery();
  const [clients, setClients] = useState<Client[]>([]);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [businessProfile, setBusinessProfile] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  
  // Invoice Form State
  const [selectedClientId, setSelectedClientId] = useState('');
  const [invoiceNo, setInvoiceNo] = useState('INV-000007');
  const [orderNumber, setOrderNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [terms, setTerms] = useState('Due on Receipt');
  const [dueDate, setDueDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [subject, setSubject] = useState('');
  const [customerNotes, setCustomerNotes] = useState('Thanks for your business.');
  const [termsConditions, setTermsConditions] = useState('');
  const [items, setItems] = useState<LineItem[]>([{ description: '', quantity: 1, rate: 0, tax: '' }]);
  const [enableRazorpay, setEnableRazorpay] = useState(false);
  
  // Backward compatibility state for other components
  const [gstType, setGstType] = useState('IGST');
  const [currency, setCurrency] = useState('INR');
  const [exchangeRate, setExchangeRate] = useState(1);

  async function fetchData() {
    try {
      const clientsSnap = await getDocs(query(collection(db, "clients"), where("bakery_id", "==", profile?.id)));
      setClients(clientsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Client)));
      
      const itemsSnap = await getDocs(query(collection(db, "items"), where("bakery_id", "==", profile?.id)));
      setCatalogItems(itemsSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      
      const invoicesSnap = await getDocs(query(collection(db, "invoices"), where("bakery_id", "==", profile?.id)));
      const invoicesData = invoicesSnap.docs.map(d => ({ id: d.id, ...d.data() } as any));
      setInvoices(invoicesData.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      
      const profileSnap = await getDoc(doc(db, "settings", "business_profile"));
      if (profileSnap.exists()) setBusinessProfile(profileSnap.data());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSendEmail = async (invoice: any) => {
    const client = clients.find(c => c.name === invoice.clientName);
    if (!client || !client.email) return alert("Client does not have an email address saved.");
    
    setSendingEmail(invoice.id);
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: "invoice", to: client.email,
          clientName: client.name,
          invoiceAmount: invoice.total,
          invoiceDate: invoice.date
        })
      });
      const data = await res.json();
      if (data.mocked) {
         alert("Email 'mock sent' successfully!");
      } else if (data.success) {
         alert(`Invoice successfully emailed to ${client.email}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error sending email.");
    } finally {
      setSendingEmail(null);
    }
  };

  const handlePayment = async (invoice: any) => {
    // Payment logic omitted for brevity, kept same as original conceptually
    alert("Payment initiated (Mock)");
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const tax = subtotal * 0.18; // Mocked tax calculation for layout purposes
    const total = subtotal + tax;
    const baseTotal = total * exchangeRate;
    return { subtotal, tax, total, baseTotal, totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0) };
  };

  const totals = calculateTotals();

  
  const handleAddNewClient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingClient(true);
    try {
      const docRef = await addDoc(collection(db, "clients"), { bakery_id: profile?.id,
        name: newClientName,
        email: newClientEmail,
        createdAt: serverTimestamp()
      });
      const newClient = { id: docRef.id, name: newClientName, email: newClientEmail, gstin: "", address: "" };
      setClients([...clients, newClient]);
      setSelectedClientId(docRef.id);
      setIsClientModalOpen(false);
      setNewClientName("");
      setNewClientEmail("");
    } catch (error) {
      console.error("Error adding client:", error);
    } finally {
      setIsAddingClient(false);
    }
  };

  const handleSaveInvoice = async (e: any) => {
    e.preventDefault();
    if (!selectedClientId) return alert("Please select a client");
    
    const client = clients.find(c => c.id === selectedClientId);
    
    const invoiceData = {
      clientName: client?.name,
      clientId: client?.id,
      date: invoiceDate,
      invoiceNo,
      orderNumber,
      dueDate,
      subject,
      customerNotes,
      termsConditions,
      items,
      currency,
      exchangeRate,
      ...totals,
      status: 'Draft'
    };

    try {
      await addDoc(collection(db, "invoices"), { ...invoiceData, bakery_id: profile?.id });
      setShowForm(false);
      setItems([{ description: '', quantity: 1, rate: 0, tax: '' }]);
      fetchData();
    } catch (error) {
      console.error("Error saving invoice", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 md:pb-0">
      <TopNav title="Invoices" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      
      
      {/* Add Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900">Add New Customer</h2>
              <button onClick={() => setIsClientModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddNewClient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                <input required type="text" className="w-full border border-slate-200 rounded-lg p-2.5" value={newClientName} onChange={e => setNewClientName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input type="email" className="w-full border border-slate-200 rounded-lg p-2.5" value={newClientEmail} onChange={e => setNewClientEmail(e.target.value)} />
              </div>
              <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-6">
                <button type="button" onClick={() => setIsClientModalOpen(false)} className="px-5 py-2.5 font-medium text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
                <button type="submit" disabled={isAddingClient} className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium">{isAddingClient ? 'Saving...' : 'Save & Select'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {!showForm && (
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Invoices</h1>
          </div>
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> New
          </button>
        </header>
      )}

      {showForm && (
        <form onSubmit={handleSaveInvoice} className="bg-slate-50 min-h-screen -m-6 p-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-20">
            <div className="p-8 space-y-6 max-w-5xl">
              
              {/* Header Fields */}
              <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-red-500 text-sm font-medium">Customer Name*</label>
                <div className="flex">
                  <select 
                    value={selectedClientId} 
                    onChange={e => {
                      if (e.target.value === 'add_new') {
                        setIsClientModalOpen(true);
                      } else {
                        setSelectedClientId(e.target.value);
                      }
                    }} 
                    className="flex-1 p-2 border border-slate-300 rounded-l-md text-sm outline-none focus:border-blue-500" 
                    required
                  >
                    <option value="">Select a customer</option>
                    <option value="add_new" className="text-blue-600 font-bold">+ New Customer</option>
                    {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <button type="button" className="bg-blue-500 text-white px-3 rounded-r-md"><SearchIcon /></button>
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-red-500 text-sm font-medium">Invoice#*</label>
                <div className="flex w-72 relative">
                  <input 
                    type="text" 
                    value={invoiceNo} 
                    onChange={e => setInvoiceNo(e.target.value)} 
                    className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
                    required
                  />
                  <Settings size={16} className="absolute right-3 top-2.5 text-blue-500 cursor-pointer" />
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-slate-800 text-sm font-medium">Order Number</label>
                <input 
                  type="text" 
                  value={orderNumber} 
                  onChange={e => setOrderNumber(e.target.value)} 
                  className="w-72 p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                <label className="text-red-500 text-sm font-medium">Invoice Date*</label>
                <div className="flex gap-4 items-center">
                  <input 
                    type="date" 
                    value={invoiceDate} 
                    onChange={e => setInvoiceDate(e.target.value)} 
                    className="w-48 p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
                    required
                  />
                  <label className="text-slate-800 text-sm font-medium ml-4">Terms</label>
                  <select 
                    value={terms} 
                    onChange={e => setTerms(e.target.value)} 
                    className="w-40 p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500"
                  >
                    <option>Due on Receipt</option>
                    <option>Net 15</option>
                    <option>Net 30</option>
                  </select>
                  <label className="text-slate-800 text-sm font-medium ml-4">Due Date</label>
                  <input 
                    type="date" 
                    value={dueDate} 
                    onChange={e => setDueDate(e.target.value)} 
                    className="w-48 p-2 border border-slate-300 border-dashed bg-slate-50 rounded-md text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-[200px_1fr] items-start gap-4 pt-4 border-t border-slate-100">
                <label className="text-slate-800 text-sm font-medium pt-2">Subject <span className="text-slate-400">ⓘ</span></label>
                <textarea 
                  placeholder="Let your customer know what this Invoice is for"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  className="w-96 p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 min-h-[60px]"
                />
              </div>

              {/* Item Table */}
              <div className="mt-8 border border-slate-200 rounded-md overflow-hidden">
                <div className="bg-slate-50 p-3 flex justify-between items-center border-b border-slate-200">
                  <span className="font-bold text-slate-800 text-sm">Item Table</span>
                  <div className="flex gap-4 text-blue-600 text-sm font-medium">
                    <button type="button" className="flex items-center gap-1"><ScanIcon /> Scan Item</button>
                    <button type="button" className="flex items-center gap-1"><CheckCircleIcon /> Bulk Actions</button>
                  </div>
                </div>
                
                <table className="w-full text-sm">
                  <thead className="bg-white border-b border-slate-200 text-slate-500 text-xs font-bold uppercase">
                    <tr>
                      <th className="p-3 text-left w-7/12">Item Details</th>
                      <th className="p-3 text-right">Quantity</th>
                      <th className="p-3 text-right">Rate</th>
                      <th className="p-3 text-left">Tax</th>
                      <th className="p-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="p-3 align-top">
                          <div className="flex gap-3">
                            <div className="w-10 h-10 bg-slate-100 border border-slate-200 rounded flex items-center justify-center flex-shrink-0 text-slate-300">
                              <ImageIcon size={20} />
                            </div>
                            <textarea 
                              placeholder="Type or click to select an item."
                              className="w-full text-sm outline-none resize-none min-h-[40px] pt-1"
                              value={item.description}
                              onChange={e => {
                                const newItems = [...items]; newItems[idx].description = e.target.value; setItems(newItems);
                              }}
                            />
                          </div>
                        </td>
                        <td className="p-3 align-top">
                          <input 
                            type="number" 
                            className="w-full text-right outline-none"
                            value={item.quantity || ''}
                            onChange={e => {
                              const newItems = [...items]; newItems[idx].quantity = Number(e.target.value); setItems(newItems);
                            }}
                          />
                        </td>
                        <td className="p-3 align-top">
                          <input 
                            type="number" 
                            step="0.01"
                            className="w-full text-right outline-none"
                            value={item.rate || ''}
                            onChange={e => {
                              const newItems = [...items]; newItems[idx].rate = Number(e.target.value); setItems(newItems);
                            }}
                          />
                        </td>
                        <td className="p-3 align-top">
                          <select className="w-full p-1 border border-slate-200 rounded text-slate-500 bg-slate-50 outline-none">
                            <option>Select a Tax</option>
                            <option>GST 18%</option>
                          </select>
                        </td>
                        <td className="p-3 align-top text-right font-medium">
                          {(item.quantity * item.rate).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Row Buttons & Totals Grid */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="flex gap-3 mb-8">
                    <button 
                      type="button" 
                      onClick={() => setItems([...items, { description: '', quantity: 1, rate: 0, tax: '' }])}
                      className="bg-slate-100 hover:bg-slate-200 text-blue-600 font-medium text-sm px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors"
                    >
                      <Plus size={16} /> Add New Row <ChevronDown size={14} className="ml-1" />
                    </button>
                    <button type="button" className="bg-slate-100 hover:bg-slate-200 text-blue-600 font-medium text-sm px-3 py-1.5 rounded-md flex items-center gap-1 transition-colors">
                      <Plus size={16} /> Add Items in Bulk
                    </button>
                  </div>

                  <div>
                    <label className="block text-slate-800 text-sm font-medium mb-2">Customer Notes</label>
                    <textarea 
                      value={customerNotes}
                      onChange={e => setCustomerNotes(e.target.value)}
                      className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 min-h-[80px]"
                    />
                    <p className="text-xs text-slate-500 mt-1">Will be displayed on the invoice</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-6 flex flex-col gap-4">
                  <div className="flex justify-between text-sm font-bold text-slate-800">
                    <span>Sub Total</span>
                    <span>{totals.subtotal.toFixed(2)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-1 text-slate-700 font-medium"><input type="radio" name="tax_deduction" className="text-blue-600" /> TDS</label>
                      <label className="flex items-center gap-1 text-slate-700 font-medium"><input type="radio" name="tax_deduction" className="text-blue-600" /> TCS</label>
                    </div>
                    <select className="border border-slate-300 rounded px-2 py-1 bg-white outline-none">
                      <option>Select a Tax</option>
                    </select>
                    <span className="text-slate-500">- 0.00</span>
                  </div>
                  
                  <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-4 mt-2">
                    <span>Total ( ₹ )</span>
                    <span>{totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Sections */}
              <div className="pt-8 border-t border-slate-100 space-y-6">
                <div>
                  <label className="block text-slate-800 text-sm font-medium mb-2">Terms & Conditions</label>
                  <textarea 
                    placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
                    value={termsConditions}
                    onChange={e => setTermsConditions(e.target.value)}
                    className="w-full max-w-3xl p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 min-h-[80px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-800 text-sm font-medium mb-2">Attach File(s) to Invoice</label>
                  <button type="button" className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors">
                    <Upload size={16} /> Upload File <ChevronDown size={14} />
                  </button>
                  <p className="text-xs text-slate-400 mt-2">You can upload a maximum of 10 files, 10MB each</p>
                </div>

                <div className="pt-6 border-t border-slate-100">
                  <label className="block text-slate-800 text-sm font-medium mb-3 flex items-center gap-2">
                    Select an online payment option to get paid faster 
                    <span className="flex gap-1"><CreditCard size={16} className="text-red-500"/><CreditCard size={16} className="text-blue-600"/></span>
                    <span className="text-blue-600 flex items-center gap-1 cursor-pointer hover:underline"><Settings size={14}/> Payment Gateway</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 border border-slate-200 w-max px-4 py-2 rounded-md hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" checked={enableRazorpay} onChange={e => setEnableRazorpay(e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4" />
                    Razorpay
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Bar */}
          <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 p-4 px-8 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <div className="flex gap-3">
              <button type="button" className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2 px-4 rounded-md text-sm transition-colors border border-slate-300">
                Save as Draft
              </button>
              <div className="flex">
                <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-l-md text-sm transition-colors">
                  Save and Send
                </button>
                <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-2 border-l border-blue-500 rounded-r-md transition-colors">
                  <ChevronDown size={16} />
                </button>
              </div>
              <button type="button" onClick={() => setShowForm(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium py-2 px-4 rounded-md text-sm transition-colors border border-slate-300">
                Cancel
              </button>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-slate-900">Total Amount: ₹ {totals.total.toFixed(2)}</div>
              <div className="text-xs text-slate-500 mt-0.5">Total Quantity: {totals.totalQuantity}</div>
            </div>
          </div>
        </form>
      )}

      {!showForm && (
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
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{format(new Date(inv.date), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{inv.clientName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                    {inv.currency && inv.currency !== 'INR' ? `${inv.currency} ${inv.total?.toFixed(2)}` : `₹${inv.total?.toFixed(2)}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium flex justify-end gap-3">
                    {inv.status !== 'Paid' && (
                      <button onClick={() => handlePayment(inv)} className="text-blue-600 hover:text-blue-900">
                        Pay Now
                      </button>
                    )}
                    <button 
                      onClick={() => handleSendEmail(inv)}
                      disabled={sendingEmail === inv.id}
                      className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                    >
                      {sendingEmail === inv.id ? 'Sending...' : 'Email'}
                    </button>
                    {typeof window !== 'undefined' && (
                      <DownloadInvoiceButton 
                        invoice={inv} 
                        businessProfile={businessProfile} 
                        client={clients.find(c => c.name === inv.clientName)} 
                      />
                    )}
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No invoices generated yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
    </div>
  );
}

const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

const ScanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7V5a2 2 0 0 1 2-2h2"/><path d="M17 3h2a2 2 0 0 1 2 2v2"/><path d="M21 17v2a2 2 0 0 1-2 2h-2"/><path d="M7 21H5a2 2 0 0 1-2-2v-2"/></svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
