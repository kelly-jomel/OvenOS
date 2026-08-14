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

interface Recipe {
  id: number;
  name: string;
  image_data?: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string | null;
}

interface CartItem extends Recipe {
  cartQuantity: number;
  selling_price: number;
  tax_rate: number;
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true);
  const { currencySymbol } = useBakery();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  const [cart, setCart] = useState<CartItem[]>([]);
  const [paymentMode, setPaymentMode] = useState<string>('cash');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '', email: '', address: '', gstin_or_tax_id: '', is_b2b: false });
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  
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
      const [recipesRes, custRes] = await Promise.all([
        api.get('/recipes/'),
        api.get('/parties/?party_type=customer')
      ]);
      setRecipes(recipesRes.data);
      setCustomers(custRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCustomer(true);
    try {
      const payload = {
        name: newCustomer.name,
        party_type: 'customer',
        phone: newCustomer.phone || null,
        email: newCustomer.email || null,
        address: newCustomer.address || null,
        gstin_or_tax_id: newCustomer.gstin_or_tax_id || null,
        is_b2b: newCustomer.is_b2b
      };
      const res = await api.post('/parties/', payload);
      setIsCustomerModalOpen(false);
      setNewCustomer({ name: '', phone: '', email: '', address: '', gstin_or_tax_id: '', is_b2b: false });
      setSelectedCustomer(res.data);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Error adding customer');
    } finally {
      setIsSubmittingCustomer(false);
    }
  };

  const addToCart = (item: Recipe) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);
      if (existing) {
        return prev.map((c) => c.id === item.id ? { ...c, cartQuantity: c.cartQuantity + 1 } : c);
      }
      return [...prev, { ...item, cartQuantity: 1, selling_price: 0, tax_rate: 0 }];
    });
  };

  const updateCartQty = (id: number, qty: number) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((c) => c.id !== id));
      return;
    }
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, cartQuantity: qty } : c));
  };

  const updateCartPrice = (id: number, price: number) => {
    setCart((prev) => prev.map((c) => c.id === id ? { ...c, selling_price: price } : c));
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
        party_id: selectedCustomer.id,
        party_name: selectedCustomer.name,
        party_phone: selectedCustomer.phone,
        subtotal: subtotal,
        tax_amount: totalTax,
        cgst_amount: totalTax / 2,
        sgst_amount: totalTax / 2,
        igst_amount: 0,
        discount_amount: 0,
        total_amount: total,
        status: paymentMode === 'razorpay' ? 'unpaid' : 'paid',
        payment_mode: paymentMode,
        items: cart.map(c => ({
          inventory_item_id: null,
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
      fetchData();
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
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col relative pb-20 md:pb-0">
      <TopNav title="Billing POS" />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col md:flex-row gap-6">
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
              <button 
                onClick={() => setIsCustomerModalOpen(true)}
                className="px-4 py-2 rounded-lg border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center min-w-[150px]">
                + New Customer
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex-1">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-gray-900">Products (Tap to add)</h2>
            </div>
            
            {recipes.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-xl">
                <span className="text-4xl block mb-2">🍲</span>
                <p className="text-gray-500 mb-4 text-sm">No recipes found.</p>
                <Link href="/recipes" className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors">
                  Create a Recipe First
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {recipes.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => addToCart(item)}
                    className="p-4 rounded-xl border text-left flex flex-col transition-all border-gray-200 hover:border-orange-500 hover:shadow-md cursor-pointer"
                  >
                    <div className="flex flex-col gap-2 mb-2 w-full">
                      {item.image_data ? (
                         <img src={item.image_data} alt={item.name} className="w-full h-24 object-cover rounded-lg border border-gray-100" />
                      ) : (
                         <div className="w-full h-24 bg-orange-50 flex items-center justify-center rounded-lg text-3xl border border-orange-100">🍲</div>
                      )}
                      <h3 className="font-bold text-gray-900 line-clamp-2">{item.name}</h3>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cart */}
        <div className="w-full md:w-96 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <h2 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Current Invoice</h2>
          
          <div className="flex-1 overflow-y-auto mb-4 min-h-[300px]">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 py-12">
                <span className="text-4xl mb-2">🛒</span>
                <p>Cart is empty</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {cart.map((item) => (
                  <li key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-500 font-bold">{currencySymbol}</span>
                        <input 
                          type="number" 
                          value={item.selling_price || ''}
                          onChange={(e) => updateCartPrice(item.id, parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-xs border border-gray-300 rounded outline-none focus:border-orange-500 bg-gray-50"
                          placeholder="Price"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border rounded-md">
                        <button onClick={() => updateCartQty(item.id, item.cartQuantity - 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">-</button>
                        <span className="px-2 text-sm">{item.cartQuantity}</span>
                        <button onClick={() => updateCartQty(item.id, item.cartQuantity + 1)} className="px-2 py-1 text-gray-600 hover:bg-gray-100">+</button>
                      </div>
                      <div className="text-right ml-4 min-w-[60px]">
                        <p className="text-sm font-bold text-gray-900">
                          {currencySymbol}{(item.cartQuantity * item.selling_price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{currencySymbol}{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax Amount</span>
              <span>{currencySymbol}{totalTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t mt-2">
              <span>Total</span>
              <span>{currencySymbol}{total.toFixed(2)}</span>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select 
                value={paymentMode} 
                onChange={(e) => setPaymentMode(e.target.value)}
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              >
                <option value="cash">Cash</option>
                <option value="upi">UPI / Bank Transfer</option>
                <option value="card">Credit / Debit Card</option>
                <option value="razorpay">Send Razorpay Payment Link</option>
              </select>
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

      {/* Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Add New Customer</h2>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <form onSubmit={handleAddCustomer} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input required type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500" />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setIsCustomerModalOpen(false)} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={isSubmittingCustomer} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">{isSubmittingCustomer ? 'Saving...' : 'Save Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}
