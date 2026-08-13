'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import api from '@/lib/api';

type BakeryProfile = {
  name: string;
  trading_name: string | null;
  gstin: string | null;
  fssai_license_number: string | null;
  msme_udyam_number: string | null;
  pan_number: string | null;
  address: string | null;
  pin_code: string | null;
  godown_locations: string | null;
  primary_upi_id: string | null;
  payment_links: string | null;
  bank_account_details: string | null;
  fiscal_year_start: string | null;
  primary_tax_scheme: string | null;
  inventory_valuation_method: string | null;
  default_kitchen_unit: string | null;
  kitchen_capacity_orders_per_day: number | null;
  standard_lead_time_hours: number | null;
  low_stock_alert_toggle: boolean;
  fefo_expiry_window_hours: number | null;
  business_logo_url: string | null;
  digital_signature_url: string | null;
  invoice_footer_text: string | null;
  brand_color_palette: string | null;
};

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('identity');
  const [profile, setProfile] = useState<BakeryProfile | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setUserEmail(user.email);
        await fetchProfile();
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile/');
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/profile/', profile);
      alert('Profile saved successfully!');
    } catch (err) {
      console.error('Failed to save profile', err);
      alert('Error saving profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const updateField = (field: keyof BakeryProfile, value: any) => {
    setProfile(prev => prev ? { ...prev, [field]: value } : null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <img src="/logo.png" alt="OvenOS Logo" className="h-8 w-auto object-contain" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-500">
                  OvenOS
                </span>
              </Link>
            </div>
            <Link href="/dashboard" className="text-sm font-medium text-gray-500 hover:text-gray-700">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-10 sm:px-6 lg:px-8 flex gap-8">
        {/* Sidebar Nav */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex items-center space-x-3">
               <img className="h-10 w-10 rounded-full" src={`https://ui-avatars.com/api/?name=${userEmail}&background=random`} alt="Profile" />
               <div>
                 <p className="text-sm font-medium text-gray-900 truncate w-40">{userEmail}</p>
                 <p className="text-xs text-gray-500">Admin</p>
               </div>
            </div>
            <nav className="flex flex-col py-2">
              <button onClick={() => setActiveTab('identity')} className={`px-4 py-3 text-sm font-medium text-left ${activeTab === 'identity' ? 'bg-orange-50 text-orange-700 border-r-4 border-orange-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                Business Identity
              </button>
              <button onClick={() => setActiveTab('regulatory')} className={`px-4 py-3 text-sm font-medium text-left ${activeTab === 'regulatory' ? 'bg-orange-50 text-orange-700 border-r-4 border-orange-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                Regulatory & Tax
              </button>
              <button onClick={() => setActiveTab('financial')} className={`px-4 py-3 text-sm font-medium text-left ${activeTab === 'financial' ? 'bg-orange-50 text-orange-700 border-r-4 border-orange-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                Banking & Fintech
              </button>
              <button onClick={() => setActiveTab('kitchen')} className={`px-4 py-3 text-sm font-medium text-left ${activeTab === 'kitchen' ? 'bg-orange-50 text-orange-700 border-r-4 border-orange-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                Kitchen Operations
              </button>
              <button onClick={() => setActiveTab('branding')} className={`px-4 py-3 text-sm font-medium text-left ${activeTab === 'branding' ? 'bg-orange-50 text-orange-700 border-r-4 border-orange-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                Branding & Templates
              </button>
            </nav>
            <div className="p-4 border-t border-gray-100">
              <button onClick={handleLogout} className="w-full py-2 px-4 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors">
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1">
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg leading-6 font-semibold text-gray-900">
                {activeTab === 'identity' && 'Core Business Identity'}
                {activeTab === 'regulatory' && 'Regulatory Compliance'}
                {activeTab === 'financial' && 'Banking & Fintech Settings'}
                {activeTab === 'kitchen' && 'Kitchen Operations'}
                {activeTab === 'branding' && 'Branding & Templates'}
              </h3>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-sm"
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'identity' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Legal Business Name</label>
                      <input type="text" value={profile?.name || ''} onChange={e => updateField('name', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                      <p className="mt-1 text-xs text-gray-500">Must match PAN/GST records.</p>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Trading Name (Store Name)</label>
                      <input type="text" value={profile?.trading_name || ''} onChange={e => updateField('trading_name', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Full Address</label>
                      <textarea rows={3} value={profile?.address || ''} onChange={e => updateField('address', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                      <p className="mt-1 text-xs text-gray-500">Critical for Place of Supply (POS) logic in invoicing.</p>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">PIN Code</label>
                      <input type="text" value={profile?.pin_code || ''} onChange={e => updateField('pin_code', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Godown Locations</label>
                      <input type="text" value={profile?.godown_locations || ''} onChange={e => updateField('godown_locations', e.target.value)} placeholder="e.g. Main Fridge, Dry Godown" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'regulatory' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">GSTIN</label>
                      <input type="text" value={profile?.gstin || ''} onChange={e => updateField('gstin', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm uppercase" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Primary Tax Scheme</label>
                      <select value={profile?.primary_tax_scheme || 'composition'} onChange={e => updateField('primary_tax_scheme', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                        <option value="composition">Composition Scheme</option>
                        <option value="regular">Regular Scheme</option>
                        <option value="non_gst">Non-GST</option>
                      </select>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">FSSAI License Number</label>
                      <input type="text" value={profile?.fssai_license_number || ''} onChange={e => updateField('fssai_license_number', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                      <p className="mt-1 text-xs text-gray-500">Mandatory in India. Prints on invoices.</p>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                      <input type="text" value={profile?.pan_number || ''} onChange={e => updateField('pan_number', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm uppercase" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">MSME Udyam Number</label>
                      <input type="text" value={profile?.msme_udyam_number || ''} onChange={e => updateField('msme_udyam_number', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm uppercase" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'financial' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Primary UPI ID</label>
                      <input type="text" value={profile?.primary_upi_id || ''} onChange={e => updateField('primary_upi_id', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                      <p className="mt-1 text-xs text-gray-500">Embedded in WhatsApp pay links.</p>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Fiscal Year Start</label>
                      <select value={profile?.fiscal_year_start || '04-01'} onChange={e => updateField('fiscal_year_start', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                        <option value="04-01">April 1st</option>
                        <option value="01-01">January 1st</option>
                      </select>
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Bank Account Details (NEFT/RTGS)</label>
                      <textarea rows={3} value={profile?.bank_account_details || ''} onChange={e => updateField('bank_account_details', e.target.value)} placeholder="Beneficiary Name:&#10;Account No:&#10;IFSC Code:" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Payment Links (Static QR / URLs)</label>
                      <input type="text" value={profile?.payment_links || ''} onChange={e => updateField('payment_links', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'kitchen' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Default Kitchen Unit</label>
                      <select value={profile?.default_kitchen_unit || 'g'} onChange={e => updateField('default_kitchen_unit', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                        <option value="g">Grams (g)</option>
                        <option value="oz">Ounces (oz)</option>
                        <option value="kg">Kilograms (kg)</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Source for standardizing microservices.</p>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Inventory Valuation Method</label>
                      <select value={profile?.inventory_valuation_method || 'FIFO'} onChange={e => updateField('inventory_valuation_method', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                        <option value="FIFO">FIFO (First-In, First-Out)</option>
                        <option value="Weighted Average">Weighted Average</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Kitchen Capacity (Orders/Day)</label>
                      <input type="number" value={profile?.kitchen_capacity_orders_per_day || ''} onChange={e => updateField('kitchen_capacity_orders_per_day', parseInt(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Standard Lead Time (Hours)</label>
                      <input type="number" value={profile?.standard_lead_time_hours || ''} onChange={e => updateField('standard_lead_time_hours', parseInt(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">FEFO Expiry Window (Hours)</label>
                      <input type="number" value={profile?.fefo_expiry_window_hours || ''} onChange={e => updateField('fefo_expiry_window_hours', parseInt(e.target.value))} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-6 flex items-center">
                      <input type="checkbox" checked={profile?.low_stock_alert_toggle || false} onChange={e => updateField('low_stock_alert_toggle', e.target.checked)} className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded" />
                      <label className="ml-2 block text-sm text-gray-900">Enable automated low-stock alerts</label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'branding' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Business Logo URL</label>
                      <input type="text" value={profile?.business_logo_url || ''} onChange={e => updateField('business_logo_url', e.target.value)} placeholder="https://..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Digital Signature URL</label>
                      <input type="text" value={profile?.digital_signature_url || ''} onChange={e => updateField('digital_signature_url', e.target.value)} placeholder="https://..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Brand Color Palette (HEX)</label>
                      <input type="text" value={profile?.brand_color_palette || ''} onChange={e => updateField('brand_color_palette', e.target.value)} placeholder="#FF5733" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Invoice Footer Text (T&C)</label>
                      <textarea rows={3} value={profile?.invoice_footer_text || ''} onChange={e => updateField('invoice_footer_text', e.target.value)} placeholder="e.g. 50% advance for custom cakes." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
