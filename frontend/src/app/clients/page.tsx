"use client";

import { useState, useEffect } from 'react';
import { useBakery } from "@/context/BakeryContext";
import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, deleteDoc, doc, serverTimestamp , query, where, orderBy, limit } from 'firebase/firestore';
import { ChevronDown, Search, Info, Upload, Mail, X } from 'lucide-react';
import SideNav from '@/components/SideNav';

interface Client {
  id?: string;
  salutation: string;
  firstName: string;
  lastName: string;
  companyName: string;
  displayName: string;
  email: string;
  workPhone: string;
  mobilePhone: string;
  language: string;
  gstTreatment: string;
  placeOfSupply: string;
  pan: string;
  taxPreference: string;
  currency: string;
  openingBalance: string;
  paymentTerms: string;
  enablePortal: boolean;
  isGstRegistered?: boolean;
  name?: string;
  gstin?: string; // Keep for backward compatibility with existing data
  address?: string;
}

export default function ClientsPage() {
  const { profile } = useBakery();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('Other Details');
  
  const [formData, setFormData] = useState<any>({
    salutation: 'Mr.', firstName: '', lastName: '', companyName: '', displayName: '', email: '', workPhone: '', mobilePhone: '', language: 'English', gstTreatment: '', placeOfSupply: '', pan: '', taxPreference: 'Taxable', currency: 'INR- Indian Rupee', openingBalance: '', paymentTerms: 'Due on Receipt', enablePortal: false, isGstRegistered: false, gstin: '', address: '',
    // New fields
    contactPersons: [],
    customFields: '',
    reportingTags: '',
    remarks: ''
  });

  async function fetchClients() {
    try {
      const querySnapshot = await getDocs(query(collection(db, "clients"), where("bakery_id", "==", profile?.id), orderBy("created_at", "desc"), limit(100)));
      const clientsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Client[];
      setClients(clientsData);
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "clients"), { bakery_id: profile?.id,
        ...formData,
        name: formData.displayName || `${formData.firstName} ${formData.lastName}`, // Backwards compatibility
        createdAt: serverTimestamp()
      });
      setShowForm(false);
      fetchClients();
      // Reset form
      setFormData({
        salutation: 'Mr.', firstName: '', lastName: '', companyName: '', displayName: '', email: '', workPhone: '', mobilePhone: '', language: 'English', gstTreatment: '', placeOfSupply: '', pan: '', taxPreference: 'Taxable', currency: 'INR- Indian Rupee', openingBalance: '', paymentTerms: 'Due on Receipt', enablePortal: false, isGstRegistered: false
      });
    } catch (error) {
      console.error("Error adding client:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this client?')) {
      try {
        await deleteDoc(doc(db, "clients", id));
        fetchClients();
      } catch (error) {
        console.error("Error deleting client:", error);
      }
    }
  };

  // Sync Display Name if empty
  useEffect(() => {
    if (!formData.displayName && (formData.firstName || formData.lastName)) {
      setFormData(prev => ({ ...prev, displayName: `${prev.firstName} ${prev.lastName}`.trim() }));
    }
  }, [formData.firstName, formData.lastName]);

  if (loading) return <div className="flex h-screen items-center justify-center text-slate-500">Loading customers...</div>;

  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Clients" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <header className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h1>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors shadow-sm"
          >
            + New
          </button>
        )}
      </header>

      {showForm ? (
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center p-4 border-b border-slate-200">
            <h2 className="text-xl font-medium text-slate-800">New Customer</h2>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
          </div>

          <div className="p-8 max-w-4xl space-y-6">
            
            {/* Primary Contact */}
            <div className="grid grid-cols-[200px_1fr] items-start gap-4">
              <label className="text-slate-800 text-sm font-medium pt-2 flex items-center gap-1">
                Primary Contact <Info size={14} className="text-slate-400"/>
              </label>
              <div className="flex gap-2">
                <select 
                  value={formData.salutation} 
                  onChange={e => setFormData({...formData, salutation: e.target.value})}
                  className="w-32 p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 bg-white"
                >
                  <option>Salutation</option>
                  <option>Mr.</option>
                  <option>Mrs.</option>
                  <option>Ms.</option>
                  <option>Dr.</option>
                </select>
                <div className="flex-1 relative">
                  <input 
                    type="text" placeholder="First Name" 
                    value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})}
                    className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                  />
                </div>
                <input 
                  type="text" placeholder="Last Name" 
                  value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})}
                  className="flex-1 p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500" 
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="grid grid-cols-[200px_1fr] items-center gap-4">
              <label className="text-slate-800 text-sm font-medium">Company Name</label>
              <input 
                type="text" 
                value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})}
                className="w-full max-w-xl p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500" 
              />
            </div>

            {/* Display Name */}
            <div className="grid grid-cols-[200px_1fr] items-center gap-4">
              <label className="text-red-500 text-sm font-medium flex items-center gap-1">
                Display Name* <Info size={14} className="text-slate-400"/>
              </label>
              <div className="relative max-w-xl">
                <input 
                  type="text" required
                  value={formData.displayName} onChange={e => setFormData({...formData, displayName: e.target.value})}
                  className="w-full p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500" 
                  placeholder="Select or type to add"
                />
                <ChevronDown size={16} className="absolute right-3 top-2.5 text-slate-400" />
              </div>
            </div>

            {/* Email Address */}
            <div className="grid grid-cols-[200px_1fr] items-center gap-4">
              <label className="text-slate-800 text-sm font-medium flex items-center gap-1">
                Email Address <Info size={14} className="text-slate-400"/>
              </label>
              <div className="relative max-w-xl flex">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">
                  <Mail size={14}/>
                </span>
                <input 
                  type="email" 
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                  className="flex-1 p-2 border border-slate-300 rounded-r-md text-sm outline-none focus:border-blue-500 min-w-0" 
                />
              </div>
            </div>

            {/* Phone */}
            <div className="grid grid-cols-[200px_1fr] items-center gap-4">
              <label className="text-slate-800 text-sm font-medium flex items-center gap-1">
                Phone <Info size={14} className="text-slate-400"/>
              </label>
              <div className="flex gap-4 max-w-xl">
                <div className="flex flex-1">
                  <select className="p-2 border border-slate-300 rounded-l-md text-sm outline-none focus:border-blue-500 bg-slate-50 text-slate-700 border-r-0 w-20">
                    <option>+91</option>
                  </select>
                  <input 
                    type="text" placeholder="Work Phone"
                    value={formData.workPhone} onChange={e => setFormData({...formData, workPhone: e.target.value})}
                    className="flex-1 p-2 border border-slate-300 rounded-r-md text-sm outline-none focus:border-blue-500 min-w-0" 
                  />
                </div>
                <div className="flex flex-1">
                  <select className="p-2 border border-slate-300 rounded-l-md text-sm outline-none focus:border-blue-500 bg-slate-50 text-slate-700 border-r-0 w-20">
                    <option>+91</option>
                  </select>
                  <input 
                    type="text" placeholder="Mobile"
                    value={formData.mobilePhone} onChange={e => setFormData({...formData, mobilePhone: e.target.value})}
                    className="flex-1 p-2 border border-slate-300 rounded-r-md text-sm outline-none focus:border-blue-500 min-w-0" 
                  />
                </div>
              </div>
            </div>

            {/* Customer Language */}
            <div className="grid grid-cols-[200px_1fr] items-center gap-4 pb-4">
              <label className="text-slate-800 text-sm font-medium flex items-center gap-1">
                Customer Language <Info size={14} className="text-slate-400"/>
              </label>
              <select 
                value={formData.language} onChange={e => setFormData({...formData, language: e.target.value})}
                className="w-full max-w-xl p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 bg-white"
              >
                <option>English</option>
                <option>Hindi</option>
                <option>Spanish</option>
              </select>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mt-8">
              <nav className="flex space-x-8">
                {['Other Details', 'Address', 'Contact Persons', 'Custom Fields', 'Reporting Tags', 'Remarks'].map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content: Other Details */}
            {activeTab === 'Other Details' && (
              <div className="space-y-6 pt-4">
                                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                  <label className="text-slate-800 text-sm font-medium pt-1 flex items-center gap-1">GST Setting</label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer pt-1">
                    <input 
                      type="checkbox" 
                      checked={formData.isGstRegistered} onChange={e => setFormData({...formData, isGstRegistered: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300" 
                    />
                    Enable GST for this customer
                  </label>
                </div>

                {formData.isGstRegistered && (
                  <>
                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                  <label className="text-red-500 text-sm font-medium">GST Treatment*</label>
                  <select 
                    required
                    value={formData.gstTreatment} onChange={e => setFormData({...formData, gstTreatment: e.target.value})}
                    className="w-full max-w-md p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">Select a GST treatment</option>
                    <option value="Registered Business">Registered Business - Regular</option>
                    <option value="Unregistered Business">Unregistered Business</option>
                    <option value="Consumer">Consumer</option>
                    <option value="Overseas">Overseas</option>
                  </select>
                </div>

                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                  <label className="text-red-500 text-sm font-medium">Place of Supply*</label>
                  <select 
                    required
                    value={formData.placeOfSupply} onChange={e => setFormData({...formData, placeOfSupply: e.target.value})}
                    className="w-full max-w-md p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 bg-white"
                  >
                    <option value="">Select a place of supply</option>
                    <option value="MH">MH-Maharashtra</option>
                    <option value="DL">DL-Delhi</option>
                    <option value="KA">KA-Karnataka</option>
                  </select>
                </div>

                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                  <label className="text-slate-800 text-sm font-medium flex items-center gap-1">
                    PAN <Info size={14} className="text-slate-400"/>
                  </label>
                  <input 
                    type="text" 
                    value={formData.pan} onChange={e => setFormData({...formData, pan: e.target.value})}
                    className="w-full max-w-md p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500" 
                  />
                </div>
                </>
                )}

                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                  <label className="text-red-500 text-sm font-medium">Tax Preference*</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input 
                        type="radio" name="taxPref" value="Taxable" 
                        checked={formData.taxPreference === 'Taxable'}
                        onChange={e => setFormData({...formData, taxPreference: e.target.value})}
                        className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                      />
                      Taxable
                    </label>
                    <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input 
                        type="radio" name="taxPref" value="Tax Exempt" 
                        checked={formData.taxPreference === 'Tax Exempt'}
                        onChange={e => setFormData({...formData, taxPreference: e.target.value})}
                        className="text-blue-600 focus:ring-blue-500 w-4 h-4" 
                      />
                      Tax Exempt
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                  <label className="text-slate-800 text-sm font-medium">Currency</label>
                  <select 
                    value={formData.currency} onChange={e => setFormData({...formData, currency: e.target.value})}
                    className="w-full max-w-md p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 bg-white"
                  >
                    <option>INR- Indian Rupee</option>
                    <option>USD- US Dollar</option>
                    <option>EUR- Euro</option>
                  </select>
                </div>

                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                  <label className="text-slate-800 text-sm font-medium">Opening Balance</label>
                  <div className="flex w-full max-w-md">
                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-300 bg-slate-50 text-slate-500 sm:text-sm">INR</span>
                    <input 
                      type="number" 
                      value={formData.openingBalance} onChange={e => setFormData({...formData, openingBalance: e.target.value})}
                      className="flex-1 p-2 border border-slate-300 rounded-r-md text-sm outline-none focus:border-blue-500 min-w-0" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-[200px_1fr] items-center gap-4">
                  <label className="text-slate-800 text-sm font-medium">Payment Terms</label>
                  <select 
                    value={formData.paymentTerms} onChange={e => setFormData({...formData, paymentTerms: e.target.value})}
                    className="w-full max-w-md p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 bg-white"
                  >
                    <option>Due on Receipt</option>
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 45</option>
                    <option>Net 60</option>
                  </select>
                </div>

                <div className="grid grid-cols-[200px_1fr] items-start gap-4">
                  <label className="text-slate-800 text-sm font-medium pt-1 flex items-center gap-1">
                    Enable Portal? <Info size={14} className="text-slate-400"/>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer pt-1">
                    <input 
                      type="checkbox" 
                      checked={formData.enablePortal} onChange={e => setFormData({...formData, enablePortal: e.target.checked})}
                      className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 border-slate-300" 
                    />
                    Allow portal access for this customer
                  </label>
                </div>

                <div className="grid grid-cols-[200px_1fr] items-start gap-4 pt-2">
                  <label className="text-slate-800 text-sm font-medium pt-2">Documents</label>
                  <div>
                    <button type="button" className="border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors">
                      <Upload size={16} /> Upload File <ChevronDown size={14} />
                    </button>
                    <p className="text-xs text-slate-400 mt-2">You can upload a maximum of 10 files, 10MB each</p>
                  </div>
                </div>
              </div>
            )}
            
            {/* Address Tab */}
            {activeTab === 'Address' && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-[200px_1fr] items-start gap-4">
                  <label className="text-slate-800 text-sm font-medium pt-2">Billing Address</label>
                  <textarea 
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                    className="w-full max-w-md p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 h-24" 
                    placeholder="Enter full address"
                  />
                </div>
                {formData.isGstRegistered && (
                <div className="grid grid-cols-[200px_1fr] items-start gap-4">
                  <label className="text-slate-800 text-sm font-medium pt-2">GSTIN</label>
                  <input 
                    type="text" 
                    value={formData.gstin} onChange={e => setFormData({...formData, gstin: e.target.value})}
                    className="w-full max-w-md p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500" 
                    placeholder="GST Number"
                  />
                </div>
                )}
              </div>
            )}
            
            {activeTab === 'Contact Persons' && (
              <div className="space-y-6 pt-4">
                <div className="text-sm text-slate-500 mb-4">Add additional contacts for this customer.</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-slate-800 text-sm font-medium">First Name</label>
                    <input type="text" className="w-full mt-1 p-2 border border-slate-300 rounded-md" placeholder="Contact First Name" />
                  </div>
                  <div>
                    <label className="text-slate-800 text-sm font-medium">Last Name</label>
                    <input type="text" className="w-full mt-1 p-2 border border-slate-300 rounded-md" placeholder="Contact Last Name" />
                  </div>
                  <div className="col-span-2">
                    <label className="text-slate-800 text-sm font-medium">Email Address</label>
                    <input type="email" className="w-full mt-1 p-2 border border-slate-300 rounded-md" placeholder="Contact Email" />
                  </div>
                </div>
                <button type="button" className="text-blue-600 text-sm font-medium mt-2">+ Add Contact Person</button>
              </div>
            )}
            
            {activeTab === 'Custom Fields' && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-[200px_1fr] items-start gap-4">
                  <label className="text-slate-800 text-sm font-medium pt-2">Additional Info</label>
                  <textarea 
                    value={formData.customFields || ''} onChange={e => setFormData({...formData, customFields: e.target.value})}
                    className="w-full max-w-md p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 h-24" 
                    placeholder="Enter custom fields or JSON data"
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'Reporting Tags' && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-[200px_1fr] items-start gap-4">
                  <label className="text-slate-800 text-sm font-medium pt-2">Tags</label>
                  <input 
                    type="text" 
                    value={formData.reportingTags || ''} onChange={e => setFormData({...formData, reportingTags: e.target.value})}
                    className="w-full max-w-md p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500" 
                    placeholder="e.g. VIP, Wholesale, Region-North"
                  />
                </div>
              </div>
            )}
            
            {activeTab === 'Remarks' && (
              <div className="space-y-6 pt-4">
                <div className="grid grid-cols-[200px_1fr] items-start gap-4">
                  <label className="text-slate-800 text-sm font-medium pt-2">Internal Notes</label>
                  <textarea 
                    value={formData.remarks || ''} onChange={e => setFormData({...formData, remarks: e.target.value})}
                    className="w-full max-w-md p-2 border border-slate-300 rounded-md text-sm outline-none focus:border-blue-500 h-24" 
                    placeholder="Internal remarks for your team"
                  />
                </div>
              </div>
            )}

          </div>

          <div className="p-4 border-t border-slate-200 bg-slate-50 flex gap-3 sticky bottom-0 z-10">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors shadow-sm">
              Save
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="bg-white hover:bg-slate-50 text-slate-700 font-medium py-2 px-6 rounded-md border border-slate-300 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Company Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline cursor-pointer">
                    <Link href={`/clients/profile?id=${client.id}`}>
                      {client.displayName || client.name || `${client.firstName} ${client.lastName}`}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{client.companyName || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{client.email || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{client.mobilePhone || client.workPhone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => handleDelete(client.id!)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
              {clients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-500">No customers found. Add one to get started!</td>
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
