'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import api from '@/lib/api';
import SideNav from '@/components/SideNav';
import { useBakery } from '@/context/BakeryContext';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

type InventoryItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  purchase_price: number;
  contains_allergens?: string;
  created_at: string;
};

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const { currencySymbol } = useBakery();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('grams');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [allergens, setAllergens] = useState('');

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        fetchInventory();
      }
    });

    return () => unsubscribe();
  }, [router, refreshKey]);

  async function fetchInventory() {
    try {
      const response = await api.get('/inventory/');
      setItems(response.data);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddIngredient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/inventory/', {
        name,
        quantity: parseFloat(quantity),
        unit,
        purchase_price: parseFloat(purchasePrice),
        contains_allergens: allergens || null
      });
      setIsModalOpen(false);
      setName('');
      setQuantity('');
      setUnit('grams');
      setPurchasePrice('');
      setAllergens('');
      setRefreshKey(prev => prev + 1);
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.detail || err.message || 'Unknown error';
      alert(`Failed to add ingredient: ${typeof msg === 'object' ? JSON.stringify(msg) : msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this ingredient?')) return;
    try {
      await api.delete(`/inventory/${id}`);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const startScan = async () => {
    try {
      setIsScanning(true);
      const status = await BarcodeScanner.checkPermission({ force: true });
      if (status.granted) {
        document.body.style.background = 'transparent';
        document.body.classList.add('barcode-scanner-active');
        BarcodeScanner.hideBackground();
        const result = await BarcodeScanner.startScan();
        if (result.hasContent) {
          alert(`Scanned Barcode: ${result.content}\nYou can now map this barcode to an item.`);
        }
      } else if (status.denied) {
        alert("Camera permission denied. Please allow it in device settings.");
      }
    } catch (e) {
      console.error("Scan error:", e);
      alert("Scanning is only available on native devices via Capacitor.");
    } finally {
      setIsScanning(false);
      document.body.style.background = '';
      document.body.classList.remove('barcode-scanner-active');
      BarcodeScanner.showBackground();
      BarcodeScanner.stopScan();
    }
  };

  const sendLowStockToWhatsApp = async () => {
    try {
      const response = await api.get('/inventory/low-stock/whatsapp');
      const text = encodeURIComponent(response.data.message);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    } catch (e) {
      console.error(e);
      alert("Failed to fetch low stock message.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen lg:pl-64 flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen lg:pl-64 bg-gray-100 font-sans">
      <SideNav title="Inventory" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
            <p className="text-sm text-gray-500 mt-1">Track your raw ingredients, calculate batch costs, and get low-stock alerts.</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={sendLowStockToWhatsApp}
              className="bg-[#25D366] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 shadow-sm transition-colors"
            >
              Share Low Stock (WA)
            </button>
            <button 
              onClick={startScan}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors flex items-center gap-2"
            >
              <span>📷</span> Scan Barcode
            </button>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-[#FDB813] text-[#1C2833] px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-400 shadow-sm transition-colors"
            >
              + Add Ingredient
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 mb-6">
                <span className="text-4xl">📦</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">No Ingredients Yet</h2>
              <p className="text-gray-500">Click the button above to start adding ingredients to your inventory.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ingredient Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purchase Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allergens</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.quantity} {item.unit}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{currencySymbol}{item.purchase_price.toFixed(2)} {item.unit === 'pcs' || item.unit === 'pieces' ? 'per pc' : 'total'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{currencySymbol}{(item.unit === 'pcs' || item.unit === 'pieces' ? item.quantity * item.purchase_price : item.purchase_price).toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.contains_allergens ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {item.contains_allergens || 'None'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add Ingredient Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-800">Add New Ingredient</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleAddIngredient} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ingredient Name</label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. All Purpose Flour"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity in Stock</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. 1000"
                  />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="grams">grams</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="liters">liters</option>
                    <option value="pcs">pieces</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {unit === 'pcs' ? `Price Per Piece (${currencySymbol})` : `Total Purchase Price (${currencySymbol})`}
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={e => setPurchasePrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. 5.99"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergens (Optional)</label>
                <input
                  type="text"
                  value={allergens}
                  onChange={e => setAllergens(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. Nuts, Dairy, Gluten"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 min-w-[120px]"
                >
                  {isSubmitting ? 'Adding...' : 'Add Ingredient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
