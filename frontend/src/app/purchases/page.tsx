'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import Link from 'next/link';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import { useBakery } from '@/context/BakeryContext';

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  purchase_price: number;
}

interface Party {
  id: number;
  name: string;
  party_type: string;
  phone: string | null;
}

interface CartItem extends InventoryItem {
  cartQuantity: number;
  tax_rate: number;
}

export default function PurchasesPage() {
  const [loading, setLoading] = useState(true);
  const { currencySymbol } = useBakery();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Party[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Party | null>(null);
  
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({ name: '', phone: '', email: '', address: '', gstin_or_tax_id: '', is_b2b: false });
  const [isSubmittingSupplier, setIsSubmittingSupplier] = useState(false);

  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 0, unit: '', purchase_price: 0, selling_price: 0, min_stock: 0, tax_rate: 0 });
  const [isSubmittingItem, setIsSubmittingItem] = useState(false);

  const router = useRouter();

  const fetchData = async () => {
    try {
      const [invRes, partyRes] = await Promise.all([
        api.get('/inventory/'),
        api.get('/parties/')
      ]);
      setInventory(invRes.data);
      setSuppliers(partyRes.data.filter((p: any) => p.party_type === 'supplier'));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        fetchData();
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingSupplier(true);
    try {
      const payload = {
        name: newSupplier.name,
        party_type: 'supplier',
        phone: newSupplier.phone || null,
        email: newSupplier.email || null,
        address: newSupplier.address || null,
        gstin_or_tax_id: newSupplier.gstin_or_tax_id || null,
        is_b2b: newSupplier.is_b2b
      };
      const res = await api.post('/parties/', payload);
      setIsSupplierModalOpen(false);
      setNewSupplier({ name: '', phone: '', email: '', address: '', gstin_or_tax_id: '', is_b2b: false });
      setSelectedSupplier(res.data); // Auto-select the newly created supplier
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error adding supplier');
    } finally {
      setIsSubmittingSupplier(false);
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingItem(true);
    try {
      const payload = {
        name: newItem.name,
        quantity: Number(newItem.quantity) || 0,
        unit: newItem.unit,
        purchase_price: Number(newItem.purchase_price) || 0,
        low_stock_threshold: Number(newItem.min_stock) || 0
      };
      const res = await api.post('/inventory/', payload);
      setIsItemModalOpen(false);
      setNewItem({ name: '', quantity: 0, unit: 'pcs', purchase_price: 0, selling_price: 0, min_stock: 0, tax_rate: 0 });
      addToCart(res.data); // Auto-add to cart
      fetchData();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || 'Unknown error';
      alert(`Error adding item: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`);
    } finally {
      setIsSubmittingItem(false);
    }
  };

  const addToCart = (item: InventoryItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => c.id === item.id ? { ...c, cartQuantity: c.cartQuantity + 1 } : c);
      }
      return [...prev, { ...item, cartQuantity: 1, tax_rate: 0 }];
    });
  };

  const updateCartQty = (id: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, cartQuantity: qty } : c));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.cartQuantity * item.purchase_price), 0);
  const totalTax = cart.reduce((acc, item) => acc + (item.cartQuantity * item.purchase_price * (item.tax_rate / 100)), 0);
  const total = subtotal + totalTax;

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    if (!selectedSupplier) return alert('Select a supplier');

    try {
      const now = Date.now();
      const purchaseData = {
        bill_number: `PB-${now}`,
        party_id: selectedSupplier.id,
        party_name: selectedSupplier.name,
        subtotal: subtotal,
        tax_amount: totalTax,
        total_amount: total,
        status: 'paid',
        payment_mode: 'cash',
        items: cart.map(c => ({
          inventory_item_id: c.id,
          item_name: c.name,
          quantity: c.cartQuantity,
          unit_price: c.purchase_price,
          tax_rate: c.tax_rate,
          total_price: c.cartQuantity * c.purchase_price * (1 + c.tax_rate/100)
        }))
      };

      await api.post('/purchases/', purchaseData);
      alert('Purchase Bill Logged! Inventory Updated.');
      setCart([]);
      router.push('/dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to log purchase');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col relative pb-20 md:pb-0">
      <TopNav title="Add Purchase Bill" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Supplier</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {suppliers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedSupplier(c)}
                  className={`px-4 py-2 rounded-lg border flex flex-col text-left min-w-[150px] transition-colors ${selectedSupplier?.id === c.id ? 'border-emerald-500 bg-emerald-50 ring-1 ring-emerald-500' : 'border-gray-200 hover:border-emerald-300'}`}
                >
                  <span className="font-medium text-gray-900">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.phone || 'No phone'}</span>
                </button>
              ))}
              <button 
                onClick={() => setIsSupplierModalOpen(true)}
                className="px-4 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center min-w-[150px] transition-colors"
              >
                + New Supplier
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Items to Receive</h2>
              <button 
                onClick={() => setIsItemModalOpen(true)}
                className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg font-semibold hover:bg-emerald-200 transition-colors"
              >
                + Add Item
              </button>
            </div>
            
            {inventory.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <span className="text-4xl block mb-2">📦</span>
                <p className="text-gray-500 mb-4 text-sm">No items in your inventory.</p>
                <button 
                  onClick={() => setIsItemModalOpen(true)}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                >
                  Add Your First Item
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {inventory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="p-4 rounded-xl border border-gray-200 text-left flex flex-col hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-gray-900">{item.name}</h3>
                      <span className="text-sm font-bold text-emerald-600">{currencySymbol}{item.purchase_price.toFixed(2)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-96 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Purchase Bill Summary</h2>
          
          <div className="flex-1 overflow-y-auto mb-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                <span className="text-4xl mb-2">🛒</span>
                <p>No items added</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between items-start">
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">{currencySymbol}{item.purchase_price.toFixed(2)} / {item.unit}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-md">
                        <button onClick={() => updateCartQty(item.id, item.cartQuantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">-</button>
                        <span className="px-2 text-sm">{item.cartQuantity}</span>
                        <button onClick={() => updateCartQty(item.id, item.cartQuantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">+</button>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-bold text-gray-900">
                          {currencySymbol}{(item.cartQuantity * item.purchase_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{currencySymbol}{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total Amount</span>
                <span>{currencySymbol}{total.toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || !selectedSupplier}
              className="w-full mt-4 bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Save Purchase Bill
            </button>
          </div>
        </div>
      </main>

      {/* Modals */}
      
      {/* Supplier Modal */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Add New Supplier</h2>
              <button onClick={() => setIsSupplierModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAddSupplier} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={newSupplier.name} onChange={e => setNewSupplier({...newSupplier, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={newSupplier.phone} onChange={e => setNewSupplier({...newSupplier, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsSupplierModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmittingSupplier} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">{isSubmittingSupplier ? 'Saving...' : 'Save Supplier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Add New Item</h2>
              <button onClick={() => setIsItemModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAddItem} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input required type="text" value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input required type="number" step="0.01" value={newItem.quantity || ''} onChange={e => setNewItem({...newItem, quantity: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {newItem.unit === 'pcs' || newItem.unit === 'pieces' ? `Price Per Piece` : `Total Purchase Price`}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">{currencySymbol}</span>
                    <input required type="number" step="0.01" value={newItem.purchase_price || ''} onChange={e => setNewItem({...newItem, purchase_price: parseFloat(e.target.value) || 0})} className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    required
                    value={newItem.unit}
                    onChange={e => setNewItem({...newItem, unit: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="" disabled>Select Unit</option>
                    <option value="grams">grams</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="liters">liters</option>
                    <option value="pcs">pieces</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmittingItem} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm hover:bg-emerald-700">{isSubmittingItem ? 'Saving...' : 'Save Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}
