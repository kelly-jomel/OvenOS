'use client';

import React, { useEffect, useState, Suspense } from 'react';
import SideNav from '@/components/SideNav';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useBakery } from '@/context/BakeryContext';
import { ArrowLeft, Printer, Download, Send, Clock, Flame, Users, ChefHat } from 'lucide-react';
import Link from 'next/link';

function ProfileContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const router = useRouter();
  const { currencySymbol } = useBakery();
  
  const [data, setData] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchData() {
      try {
        const [recipeRes, inventoryRes] = await Promise.all([
          api.get(`/recipes/${id}`),
          api.get(`/inventory/`)
        ]);
        setData(recipeRes.data);
        setInventory(inventoryRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const calculateCost = (ingredient: any, item: any): number => {
    if (!item || item.quantity === 0) return 0;
    
    let requiredQty = ingredient.quantity_required;
    const itemUnit = item.unit.toLowerCase();
    const ingUnit = (ingredient.unit || item.unit).toLowerCase();
    
    if (itemUnit === 'kg' && ingUnit === 'g') {
      requiredQty = requiredQty / 1000;
    } else if (itemUnit === 'g' && ingUnit === 'kg') {
      requiredQty = requiredQty * 1000;
    } else if (itemUnit === 'l' && ingUnit === 'ml') {
      requiredQty = requiredQty / 1000;
    } else if (itemUnit === 'ml' && ingUnit === 'l') {
      requiredQty = requiredQty * 1000;
    }
    
    return (requiredQty / item.quantity) * item.purchase_price;
  };

  const calculateTotalRecipeCost = () => {
    if (!data || !data.ingredients) return 0;
    return data.ingredients.reduce((total: number, ing: any) => {
      const item = inventory.find(i => i.id === ing.inventory_item_id);
      return total + calculateCost(ing, item);
    }, 0);
  };

  if (loading) return <div className="min-h-screen lg:pl-64 flex items-center justify-center text-slate-500">Loading recipe...</div>;
  if (!data) return <div className="min-h-screen lg:pl-64 flex items-center justify-center text-red-500">Recipe not found.</div>;

  const totalCost = calculateTotalRecipeCost();

  return (
    <div className="min-h-screen lg:pl-64 bg-gray-50 font-sans pb-20 md:pb-0">
      <SideNav title="Recipe Details" />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header Actions */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-4">
            <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full text-slate-600 transition-colors">
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">{data.name}</h1>
              <p className="text-slate-500 text-sm">Yields: {data.yield_amount || 'N/A'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-md" title="Print Recipe"><Printer size={18} /></button>
            <Link href={`/recipes`} className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 flex items-center gap-2 rounded-md shadow-sm transition-colors text-sm font-medium">
              <ChefHat size={16} /> Edit Recipe
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
              
              <div className="flex gap-6 mb-8">
                {data.image_data ? (
                  <img src={data.image_data} alt={data.name} className="w-32 h-32 object-cover rounded-xl border border-slate-200 shadow-sm" />
                ) : (
                  <div className="w-32 h-32 bg-orange-50 text-orange-400 rounded-xl flex items-center justify-center text-4xl border border-orange-100">
                    🍲
                  </div>
                )}
                
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">{data.name}</h2>
                  <p className="text-slate-600 leading-relaxed mb-6">
                    {data.description || "No description provided."}
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <Clock size={16} className="text-slate-400" />
                      <span className="text-sm font-medium">Prep: {data.prep_time_minutes || 0} mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <Flame size={16} className="text-slate-400" />
                      <span className="text-sm font-medium">Bake: {data.bake_time_minutes || 0} mins</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <Users size={16} className="text-slate-400" />
                      <span className="text-sm font-medium">Yield: {data.yield_amount || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Ingredients Table */}
              <h3 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Ingredients & Formulation</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left mb-8">
                  <thead className="bg-slate-50 border-y border-slate-200">
                    <tr>
                      <th className="py-3 px-4 font-semibold text-slate-700 rounded-tl-lg">Item</th>
                      <th className="py-3 px-4 font-semibold text-slate-700 text-right">Required Qty</th>
                      <th className="py-3 px-4 font-semibold text-slate-700 text-right rounded-tr-lg">Cost ({currencySymbol})</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.ingredients && data.ingredients.map((ing: any, idx: number) => {
                      const item = inventory.find(i => i.id === ing.inventory_item_id);
                      const cost = calculateCost(ing, item);
                      return (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-medium text-slate-900">{ing.item_name || item?.name || 'Unknown Item'}</td>
                          <td className="py-3 px-4 text-right">{ing.quantity_required} {ing.unit}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{cost.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    {(!data.ingredients || data.ingredients.length === 0) && (
                      <tr><td colSpan={3} className="py-8 text-center text-slate-400 italic">No ingredients added yet.</td></tr>
                    )}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold">
                    <tr>
                      <td colSpan={2} className="py-3 px-4 text-right text-slate-700">Total Material Cost</td>
                      <td className="py-3 px-4 text-right text-slate-900 text-lg">{currencySymbol}{totalCost.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

            </div>
          </div>
          
          {/* Sidebar / Cost Analysis */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-md font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Cost Analysis</h3>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Material Cost</span>
                  <span className="font-medium">{currencySymbol}{totalCost.toFixed(2)}</span>
                </div>
                
                {data.use_custom_overheads ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Custom Labor</span>
                      <span className="font-medium">{currencySymbol}{(data.custom_labor_cost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Custom Overheads</span>
                      <span className="font-medium">{currencySymbol}{(data.custom_overhead_cost || 0).toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-blue-50 text-blue-800 rounded-lg text-xs border border-blue-100">
                    Using global bakery profile defaults for labor and overhead calculations.
                  </div>
                )}
                
                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-900 font-bold">Est. Total Cost</span>
                    <span className="text-xl font-black text-orange-600">
                      {currencySymbol}
                      {(totalCost + (data.use_custom_overheads ? ((data.custom_labor_cost || 0) + (data.custom_overhead_cost || 0)) : 0)).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 text-right">Based on current inventory prices</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-md font-bold text-slate-900 mb-2">Instructions</h3>
              <p className="text-sm text-slate-600 italic">
                Detailed step-by-step instructions can be managed via the Recipe Builder module (coming soon).
              </p>
            </div>
          </div>
        </div>
        
      </main>
    </div>
  );
}

export default function RecipeProfile() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
      <ProfileContent />
    </Suspense>
  );
}
