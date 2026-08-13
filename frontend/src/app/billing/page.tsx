'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import Link from 'next/link';

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  purchase_price: number;
}

interface Customer {
  id: number;
  name: string;
  phone: string | null;
}

interface CartItem extends InventoryItem {
  cartQuantity: number;
  selling_price: number;
  tax_rate: number;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  
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
      const [invRes, custRes] = await Promise.all([
        api.get('/inventory'),
        api.get('/billing/customers')
      ]);
      setInventory(invRes);
      setCustomers(custRes);
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
      return [...prev, { ...item, cartQuantity: 1, selling_price: item.purchase_price * 1.5, tax_rate: 5 }];
    });
  };

  const updateCartQty = (id: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, cartQuantity: qty } : c));
  };

  const subtotal = cart.reduce((acc, item) => acc + (item.cartQuantity * item.selling_price), 0);
  const totalTax = cart.reduce((acc, item) => acc + (item.cartQuantity * item.selling_price * (item.tax_rate / 100)), 0);
  const total = subtotal + totalTax;

  const handleCheckout = async () => {
    if (cart.length === 0) return alert('Cart is empty');
    if (!selectedCustomer) return alert('Select a customer');

    try {
      const invoiceData = {
        invoice_number: `INV-${Date.now()}`,
        customer_id: selectedCustomer.id,
        customer_name: selectedCustomer.name,
        customer_phone: selectedCustomer.phone,
        subtotal: subtotal,
        tax_amount: totalTax,
        discount_amount: 0,
        total_amount: total,
        status: 'paid',
        payment_mode: 'cash',
        items: cart.map(c => ({
          inventory_item_id: c.id,
          item_name: c.name,
          quantity: c.cartQuantity,
          unit_price: c.selling_price,
          tax_rate: c.tax_rate,
          total_price: c.cartQuantity * c.selling_price * (1 + c.tax_rate/100)
        }))
      };

      await api.post('/billing/invoices/', invoiceData);
      alert('Invoice Generated Successfully!');
      setCart([]);
      fetchData(); // Refresh inventory quantities
    } catch (err: any) {
      alert(err.message || 'Failed to generate invoice');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <img src="/logo.png" alt="OvenOS Logo" className="h-8 w-auto object-contain" />
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-rose-500">
                  OvenOS
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Dashboard</Link>
                <Link href="/inventory" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Inventory</Link>
                <Link href="/billing" className="border-orange-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Billing POS</Link>
                <Link href="/profile" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">Profile</Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex gap-6">
        {/* Left Side: Items & Customers */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Select Customer</h2>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {customers.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCustomer(c)}
                  className={`px-4 py-2 rounded-lg border flex flex-col text-left min-w-[150px] transition-colors ${selectedCustomer?.id === c.id ? 'border-orange-500 bg-orange-50 ring-1 ring-orange-500' : 'border-gray-200 hover:border-orange-300'}`}
                >
                  <span className="font-medium text-gray-900">{c.name}</span>
                  <span className="text-xs text-gray-500">{c.phone || 'No phone'}</span>
                </button>
              ))}
              <button className="px-4 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center min-w-[150px]">
                + New Customer
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Products (Tap to add)</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {inventory.map((item) => (
                <button
                  key={item.id}
                  onClick={() => addToCart(item)}
                  disabled={item.quantity <= 0}
                  className={`p-4 rounded-xl border text-left flex flex-col transition-all ${item.quantity > 0 ? 'border-gray-200 hover:border-orange-500 hover:shadow-md cursor-pointer' : 'border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed'}`}
                >
                  <span className="font-semibold text-gray-800 line-clamp-1">{item.name}</span>
                  <div className="mt-2 flex justify-between items-end w-full">
                    <span className="text-sm font-medium text-gray-500">{item.quantity} {item.unit} left</span>
                    <span className="text-sm font-bold text-emerald-600">₹{(item.purchase_price * 1.5).toFixed(2)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Cart */}
        <div className="w-96 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Current Invoice</h2>
          
          <div className="flex-1 overflow-y-auto mb-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <span className="text-4xl mb-2">🛒</span>
                <p>Cart is empty</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                      <p className="text-xs text-gray-500">₹{item.selling_price.toFixed(2)} + {item.tax_rate}% Tax</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-md">
                        <button onClick={() => updateCartQty(item.id, item.cartQuantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">-</button>
                        <span className="px-2 text-sm">{item.cartQuantity}</span>
                        <button onClick={() => updateCartQty(item.id, item.cartQuantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">+</button>
                      </div>
                      <span className="text-sm font-bold text-gray-900 w-16 text-right">
                        ₹{(item.cartQuantity * item.selling_price * (1 + item.tax_rate/100)).toFixed(2)}
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
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax Amount</span>
              <span>₹{totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t mt-2">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || !selectedCustomer}
              className="w-full mt-4 bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Generate Bill
            </button>
            {(!selectedCustomer && cart.length > 0) && (
              <p className="text-xs text-red-500 text-center mt-2">Please select a customer first</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
