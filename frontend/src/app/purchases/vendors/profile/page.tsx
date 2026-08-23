"use client";
import React, { useState, useEffect, use } from 'react';
import SideNav from "@/components/SideNav";
import { useBakery } from "@/context/BakeryContext";
import { db } from '@/lib/firebase';
import { doc, getDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import api from '@/lib/api';
import { Plus, ShoppingCart, X, MessageCircle, ArrowLeft, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function VendorProfileContent() {
  const searchParams = useSearchParams();
  const vendorId = searchParams.get("id");
  const { profile, currencySymbol } = useBakery();
  const router = useRouter();
  
  const [vendor, setVendor] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemPrice, setNewItemPrice] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [cart, setCart] = useState<{name: string, price: number, qty: number}[]>([]);
  const [sendToOwnWhatsApp, setSendToOwnWhatsApp] = useState(false);
  
  useEffect(() => {
    if (profile?.id) fetchData();
  }, [profile?.id, vendorId]);

  const fetchData = async () => {
    try {
      // Fetch vendor
      if (!vendorId) return;
      const docRef = doc(db, 'vendors', vendorId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists() && docSnap.data().bakery_id === profile?.id) {
        setVendor({ id: docSnap.id, ...docSnap.data() });
      } else {
        router.push('/purchases/vendors');
        return;
      }
      
      // Fetch inventory to show balance
      const invRes = await api.get('/inventory/');
      setInventory(invRes.data || []);
      
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItemToCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // 1. Add to Vendor's catalog in Firebase
      const itemData = {
        id: Date.now().toString(),
        name: newItemName,
        price: parseFloat(newItemPrice) || 0
      };
      await updateDoc(doc(db, 'vendors', vendor.id), {
        items: arrayUnion(itemData)
      });
      
      // 2. Automatically create in Global Inventory if it doesn't exist
      const existingInv = inventory.find(i => i.name.toLowerCase() === newItemName.toLowerCase());
      if (!existingInv) {
        await api.post('/inventory/', {
          name: newItemName,
          quantity: 0,
          unit: 'pcs',
          purchase_price: itemData.price,
          contains_allergens: null
        });
      }
      
      setIsAddingItem(false);
      setNewItemName('');
      setNewItemPrice('');
      fetchData(); // Refresh to get updated inventory and vendor
    } catch (err) {
      console.error("Error adding item:", err);
      alert("Failed to add item");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveFromCatalog = async (item: any) => {
    if (!confirm(`Remove ${item.name} from catalog?`)) return;
    try {
      await updateDoc(doc(db, 'vendors', vendor.id), {
        items: arrayRemove(item)
      });
      fetchData();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const addToCart = (item: any) => {
    const existing = cart.find(c => c.name === item.name);
    if (existing) {
      setCart(cart.map(c => c.name === item.name ? { ...c, qty: c.qty + 1 } : c));
    } else {
      setCart([...cart, { name: item.name, price: item.price, qty: 1 }]);
    }
  };

  const removeFromCart = (name: string) => {
    setCart(cart.filter(c => c.name !== name));
  };

  const checkoutWhatsApp = () => {
    if (cart.length === 0) return;
    
    let message = `*Purchase Order*\n\n`;
    message += `Hi ${vendor.companyName},\nI would like to place an order for the following items:\n\n`;
    
    let total = 0;
    cart.forEach(c => {
      const lineTotal = c.qty * c.price;
      total += lineTotal;
      message += `• ${c.name} x ${c.qty} @ ${currencySymbol}${c.price.toFixed(2)} = ${currencySymbol}${lineTotal.toFixed(2)}\n`;
    });
    
    message += `\n*Total Estimated:* ${currencySymbol}${total.toFixed(2)}\n\n`;
    message += `Please confirm availability. Thanks!`;
    
    const targetPhone = sendToOwnWhatsApp ? profile?.phone : vendor.phone;
    if (!targetPhone) {
      alert("No phone number available. Please ensure the phone number is saved.");
      return;
    }
    
    const cleanPhone = targetPhone.replace(/\D/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  if (loading) return <div className="min-h-screen lg:pl-64 bg-gray-50 flex items-center justify-center">Loading...</div>;
  if (!vendor) return <div className="min-h-screen lg:pl-64 bg-gray-50">Vendor not found</div>;

  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Vendor Profile" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-t-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-4">
            <Link href="/purchases/vendors" className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{vendor.companyName}</h1>
              <p className="text-slate-500 text-sm mt-1">{vendor.contactName} • {vendor.phone}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-500 font-medium">Payable Balance</p>
            <p className="text-xl font-bold text-red-600">{currencySymbol}{parseFloat(vendor.payable || 0).toFixed(2)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Vendor Catalog */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-800">Vendor Catalog</h2>
                <button 
                  onClick={() => setIsAddingItem(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-colors"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>
              
              <div className="p-0">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Item Name</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Inventory Balance</th>
                      <th className="px-4 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(!vendor.items || vendor.items.length === 0) ? (
                      <tr><td colSpan={4} className="p-8 text-center text-slate-400">No items added to catalog yet.</td></tr>
                    ) : (
                      vendor.items.map((item: any, i: number) => {
                        const invItem = inventory.find(inv => inv.name.toLowerCase() === item.name.toLowerCase());
                        const stock = invItem ? `${invItem.quantity} ${invItem.unit}` : '0';
                        const inCart = cart.find(c => c.name === item.name);
                        
                        return (
                          <tr key={i} className="hover:bg-slate-50">
                            <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                            <td className="px-4 py-3 text-slate-600">{currencySymbol}{parseFloat(item.price || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-slate-500">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                                {stock}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex justify-end items-center gap-2">
                                <button onClick={() => addToCart(item)} className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded" title="Add to Order">
                                  <ShoppingCart size={16} />
                                </button>
                                <button onClick={() => handleRemoveFromCatalog(item)} className="text-red-400 hover:text-red-600 p-1" title="Remove from catalog">
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Order Cart */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-lg shadow-sm sticky top-6">
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
                <ShoppingCart size={18} className="text-slate-600" />
                <h2 className="text-lg font-bold text-slate-800">Current Order</h2>
              </div>
              
              <div className="p-4 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-slate-500 text-sm text-center py-6">Cart is empty. Add items from the catalog.</p>
                ) : (
                  <>
                    <ul className="space-y-3">
                      {cart.map((c, i) => (
                        <li key={i} className="flex justify-between items-center text-sm">
                          <div>
                            <p className="font-medium text-slate-800">{c.name}</p>
                            <p className="text-slate-500 text-xs">{c.qty} x {currencySymbol}{c.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-slate-800">{currencySymbol}{(c.qty * c.price).toFixed(2)}</span>
                            <button onClick={() => removeFromCart(c.name)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="pt-4 border-t border-slate-100 flex justify-between items-center font-bold text-lg">
                      <span>Total:</span>
                      <span>{currencySymbol}{cart.reduce((sum, c) => sum + (c.qty * c.price), 0).toFixed(2)}</span>
                    </div>

                    <div className="pt-4 space-y-3">
                      <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={sendToOwnWhatsApp} 
                          onChange={(e) => setSendToOwnWhatsApp(e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        Send to my own WhatsApp (if vendor is not on WA)
                      </label>
                      
                      <button 
                        onClick={checkoutWhatsApp}
                        className="w-full bg-[#25D366] hover:bg-[#1ebd5a] text-white py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                      >
                        <MessageCircle size={20} />
                        Send Order via WhatsApp
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Add Item Modal */}
      {isAddingItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-900">Add Item to Catalog</h2>
              <button onClick={() => setIsAddingItem(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddItemToCatalog} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Item Name</label>
                <input required type="text" value={newItemName} onChange={e => setNewItemName(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. Bread Flour" />
                <p className="text-xs text-slate-500 mt-1">If this is a new item, it will be automatically added to your Global Inventory.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Purchase Price ({currencySymbol})</label>
                <input required type="number" step="0.01" value={newItemPrice} onChange={e => setNewItemPrice(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsAddingItem(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50 font-medium">Cancel</button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 font-medium">
                  {submitting ? 'Adding...' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


export default function VendorProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen lg:pl-64 bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <VendorProfileContent />
    </Suspense>
  );
}
