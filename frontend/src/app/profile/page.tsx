'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import api from '@/lib/api';
import TopNav from '@/components/TopNav';
import { useBakery } from '@/context/BakeryContext';

type BakeryProfile = {
  name: string;
  trading_name: string | null;
  country: string;
  
  // IN
  gstin: string | null;
  fssai_license_number: string | null;
  msme_udyam_number: string | null;
  pan_number: string | null;
  
  // US
  ein_number: string | null;
  state_tax_id: string | null;
  food_handler_license: string | null;
  
  // UK
  company_registration_number: string | null;
  vat_number: string | null;
  utr_number: string | null;
  local_authority_registration: string | null;
  
  address: string | null;
  pin_code: string | null;
  godown_locations: string | null;
  primary_upi_id: string | null;
  payment_links: string | null;
  bank_account_details: string | null;
  razorpay_key_id: string | null;
  razorpay_key_secret: string | null;
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
  
  // Operational Costs
  base_hourly_labor_rate: number | null;
  energy_cost_per_hour: number | null;
  misc_overhead_percentage: number | null;
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

  async function fetchProfile() {
    try {
      const res = await api.get('/profile/');
      setProfile(res.data);
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  const { refreshProfile } = useBakery();

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await api.put('/profile/', profile);
      await refreshProfile();
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
    setProfile(prev => {
      if (prev) {
        return { ...prev, [field]: value };
      }
      return { country: 'IN', [field]: value } as BakeryProfile;
    });
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
      <TopNav title="Profile" />

      {!profile?.trading_name && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
            <p className="text-sm font-medium text-amber-800 text-center">
              <i className="fa-solid fa-triangle-exclamation mr-2"></i>
              Please set your <strong>Trading Name</strong> to complete your profile and unlock the dashboard.
            </p>
          </div>
        </div>
      )}

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
              <button onClick={() => setActiveTab('operational_costs')} className={`px-4 py-3 text-sm font-medium text-left ${activeTab === 'operational_costs' ? 'bg-orange-50 text-orange-700 border-r-4 border-orange-500' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                Operational Costs
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
                {activeTab === 'operational_costs' && 'Operational Costs & Labor'}
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
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Country of Operation</label>
                      <select value={profile?.country || 'IN'} onChange={e => updateField('country', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                        <option value="IN">India</option>
                        <option value="US">United States</option>
                        <option value="GB">United Kingdom</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Determines regulatory and tax requirements.</p>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Legal Business Name</label>
                      <input type="text" value={profile?.name || ''} onChange={e => updateField('name', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                      <p className="mt-1 text-xs text-gray-500">Must match tax records.</p>
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
                    {(profile?.country === 'IN' || !profile?.country) && (
                      <>
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
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">PAN Number</label>
                          <input type="text" value={profile?.pan_number || ''} onChange={e => updateField('pan_number', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm uppercase" />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">MSME Udyam Number</label>
                          <input type="text" value={profile?.msme_udyam_number || ''} onChange={e => updateField('msme_udyam_number', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm uppercase" />
                        </div>
                      </>
                    )}
                    
                    {profile?.country === 'US' && (
                      <>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">EIN (Employer Identification Number)</label>
                          <input type="text" value={profile?.ein_number || ''} onChange={e => updateField('ein_number', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm uppercase" />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">State Tax ID</label>
                          <input type="text" value={profile?.state_tax_id || ''} onChange={e => updateField('state_tax_id', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Food Handler License</label>
                          <input type="text" value={profile?.food_handler_license || ''} onChange={e => updateField('food_handler_license', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                        </div>
                      </>
                    )}

                    {profile?.country === 'GB' && (
                      <>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">VAT Registration Number</label>
                          <input type="text" value={profile?.vat_number || ''} onChange={e => updateField('vat_number', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm uppercase" />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Company Registration Number</label>
                          <input type="text" value={profile?.company_registration_number || ''} onChange={e => updateField('company_registration_number', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">Unique Taxpayer Reference (UTR)</label>
                          <input type="text" value={profile?.utr_number || ''} onChange={e => updateField('utr_number', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-sm font-medium text-gray-700">FSA Local Authority Registration</label>
                          <input type="text" value={profile?.local_authority_registration || ''} onChange={e => updateField('local_authority_registration', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'financial' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {(profile?.country === 'IN' || !profile?.country) && (
                      <div className="sm:col-span-3">
                        <label className="block text-sm font-medium text-gray-700">Primary UPI ID</label>
                        <input type="text" value={profile?.primary_upi_id || ''} onChange={e => updateField('primary_upi_id', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                        <p className="mt-1 text-xs text-gray-500">Embedded in WhatsApp pay links.</p>
                      </div>
                    )}
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Fiscal Year Start</label>
                      <select value={profile?.fiscal_year_start || '04-01'} onChange={e => updateField('fiscal_year_start', e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm">
                        <option value="04-01">April 1st</option>
                        <option value="01-01">January 1st</option>
                      </select>
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">
                        {profile?.country === 'IN' ? 'Bank Account Details (NEFT/RTGS)' : 
                         profile?.country === 'US' ? 'Bank Account Details (Routing / Account)' : 
                         'Bank Account Details (Sort Code / Account)'}
                      </label>
                      <textarea rows={3} value={profile?.bank_account_details || ''} onChange={e => updateField('bank_account_details', e.target.value)} 
                        placeholder={
                          profile?.country === 'IN' ? "Beneficiary Name:\nAccount No:\nIFSC Code:" :
                          profile?.country === 'US' ? "Beneficiary Name:\nAccount No:\nRouting No:" :
                          "Beneficiary Name:\nAccount No:\nSort Code:"
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-6">
                      <label className="block text-sm font-medium text-gray-700">Payment Links (Static QR / URLs)</label>
                      <input type="text" value={profile?.payment_links || ''} onChange={e => updateField('payment_links', e.target.value)} placeholder="e.g. Stripe, Razorpay, or Venmo link" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-6">
                      <h4 className="text-md font-medium text-gray-900 mt-4 border-b pb-2">Razorpay Integration (Optional)</h4>
                      <p className="text-xs text-gray-500 mt-1 mb-4">Enter your Razorpay API keys to automatically generate payment links for your invoices. You can leave this blank to skip.</p>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Razorpay Key ID</label>
                      <input type="text" value={profile?.razorpay_key_id || ''} onChange={e => updateField('razorpay_key_id', e.target.value)} placeholder="rzp_live_..." className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Razorpay Key Secret</label>
                      <input type="password" value={profile?.razorpay_key_secret || ''} onChange={e => updateField('razorpay_key_secret', e.target.value)} placeholder="••••••••••••••••" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
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

              {activeTab === 'operational_costs' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    <div className="sm:col-span-6">
                      <h4 className="text-md font-medium text-gray-900 border-b pb-2">Overhead & Labor Baselines</h4>
                      <p className="text-xs text-gray-500 mt-1 mb-4">Set your standard operational costs here. These rates will automatically be used to calculate exact recipe costs based on prep time and bake time.</p>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Base Hourly Labor Rate</label>
                      <input type="number" step="0.01" value={profile?.base_hourly_labor_rate || ''} onChange={e => updateField('base_hourly_labor_rate', parseFloat(e.target.value))} placeholder="e.g. 500" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                      <p className="mt-1 text-xs text-gray-500">How much your time is worth per hour.</p>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Energy / Fuel Cost (per hour)</label>
                      <input type="number" step="0.01" value={profile?.energy_cost_per_hour || ''} onChange={e => updateField('energy_cost_per_hour', parseFloat(e.target.value))} placeholder="e.g. 25" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                      <p className="mt-1 text-xs text-gray-500">Hourly cost to run your oven.</p>
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Misc Overhead (%)</label>
                      <input type="number" step="0.1" value={profile?.misc_overhead_percentage || ''} onChange={e => updateField('misc_overhead_percentage', parseFloat(e.target.value))} placeholder="e.g. 5.0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm" />
                      <p className="mt-1 text-xs text-gray-500">Markup applied to cover water, soap, parchment paper, etc.</p>
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
