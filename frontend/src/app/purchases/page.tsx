'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import Link from 'next/link';
import TopNav from '@/components/TopNav';

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
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [suppliers, setSuppliers] = useState<Party[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState<Party | null>(null);
  
  const router = useRouter();

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

  const fetchData = async () => {
    try {
      const [invRes, partyRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/parties/?party_type=supplier')
      ]);
      setInventory(invRes.data);
      setSuppliers(partyRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
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
      const purchaseData = {
        bill_number: `PB-${Date.now()}`,
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
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
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
              <button className="px-4 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center min-w-[150px]">
                + New Supplier
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Items to Receive</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {inventory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  className="p-4 rounded-xl border border-gray-200 text-left flex flex-col hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer"
                >
                  <span className="font-semibold text-gray-800 line-clamp-1">{item.name}</span>
                  <div className="mt-2 flex justify-between items-end w-full">
                    <span className="text-xs font-medium text-gray-500">Stock: {item.quantity} {item.unit}</span>
                    <span className="text-sm font-bold text-emerald-600">₹{item.purchase_price.toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
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
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500">₹{item.purchase_price.toFixed(2)} / {item.unit}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-md">
                        <button onClick={() => updateCartQty(item.id, item.cartQuantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">-</button>
                        <span className="px-2 text-sm">{item.cartQuantity}</span>
                        <button onClick={() => updateCartQty(item.id, item.cartQuantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">+</button>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-16 text-right">
                        ₹{(item.cartQuantity * item.purchase_price).toFixed(2)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t mt-2">
              <span>Total Amount</span>
              <span>₹{total.toFixed(2)}</span>
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
    </div>
  );
}
