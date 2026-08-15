'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import { useBakery } from '@/context/BakeryContext';

interface InventoryItem {
  id: number;
  name: string;
  unit: string;
  purchase_price: number;
}

interface RecipeIngredient {
  id?: number;
  inventory_item_id: number;
  quantity: number;
  unit: string;
}

interface Recipe {
  id: number;
  name: string;
  description?: string;
  yield_amount?: string;
  image_data?: string;
  prep_time_minutes?: number;
  bake_time_minutes?: number;
  use_custom_overheads?: boolean;
  custom_labor_cost?: number;
  custom_overhead_cost?: number;
  selling_price?: number;
  ingredients: RecipeIngredient[];
}

export default function ProductsPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { currencySymbol } = useBakery();
  const router = useRouter();

  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const [recipesRes, inventoryRes, profileRes] = await Promise.all([
        api.get('/recipes/'),
        api.get('/inventory/'),
        api.get('/profile/')
      ]);
      setRecipes(recipesRes.data);
      setInventory(inventoryRes.data);
      setProfile(profileRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const calculateCost = (ingredient: RecipeIngredient, item: InventoryItem): number => {
    if (!item) return 0;
    
    // Normalize units
    const ingUnit = (ingredient.unit || '').toLowerCase();
    const itemUnit = (item.unit || '').toLowerCase();
    
    if (ingUnit === 'g' || ingUnit === 'grams') {
      if (itemUnit === 'kg') return (ingredient.quantity / 1000) * item.purchase_price;
      if (itemUnit === 'g' || itemUnit === 'grams') return ingredient.quantity * item.purchase_price;
    }
    
    if (ingUnit === 'kg') {
      if (itemUnit === 'kg') return ingredient.quantity * item.purchase_price;
      if (itemUnit === 'g' || itemUnit === 'grams') return (ingredient.quantity * 1000) * item.purchase_price;
    }
    
    if (ingUnit === 'ml') {
      if (itemUnit === 'liters' || itemUnit === 'l') return (ingredient.quantity / 1000) * item.purchase_price;
      if (itemUnit === 'ml') return ingredient.quantity * item.purchase_price;
    }
    
    if (ingUnit === 'liters' || ingUnit === 'l') {
      if (itemUnit === 'liters' || itemUnit === 'l') return ingredient.quantity * item.purchase_price;
      if (itemUnit === 'ml') return (ingredient.quantity * 1000) * item.purchase_price;
    }
    
    if (ingUnit === 'pcs' || ingUnit === 'pieces') {
      return ingredient.quantity * item.purchase_price;
    }
    
    // Fallback: direct multiply if exact match or unknown
    return ingredient.quantity * item.purchase_price;
  };

  const calculateTotalRecipeCost = (recipe: Partial<Recipe>) => {
    const ingredients = recipe.ingredients || [];
    const ingredientCost = ingredients.reduce((total, ing) => {
      const inventoryItem = inventory.find(i => i.id === ing.inventory_item_id);
      if (!inventoryItem) return total;
      return total + calculateCost({ ...ing, unit: ing.unit || inventoryItem.unit }, inventoryItem);
    }, 0);

    let laborCost = 0;
    let overheadCost = 0;

    if (recipe.use_custom_overheads) {
      laborCost = recipe.custom_labor_cost || 0;
      overheadCost = recipe.custom_overhead_cost || 0;
    } else {
      const baseLabor = profile?.base_hourly_labor_rate || 0;
      const energyRate = profile?.energy_cost_per_hour || 0;
      const miscPercent = profile?.misc_overhead_percentage || 5;
      
      const prepTime = recipe.prep_time_minutes || 0;
      const bakeTime = recipe.bake_time_minutes || 0;
      
      laborCost = (baseLabor / 60) * prepTime;
      const energyCost = (energyRate / 60) * bakeTime;
      overheadCost = energyCost + ((ingredientCost + laborCost + energyCost) * (miscPercent / 100));
    }

    return ingredientCost + laborCost + overheadCost;
  };

  const openEditModal = (recipe: Recipe) => {
    setEditingRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecipe) return;
    setIsSubmitting(true);
    try {
      await api.put(`/recipes/${editingRecipe.id}`, {
        name: editingRecipe.name,
        description: editingRecipe.description,
        yield_amount: editingRecipe.yield_amount,
        image_data: editingRecipe.image_data,
        prep_time_minutes: editingRecipe.prep_time_minutes,
        bake_time_minutes: editingRecipe.bake_time_minutes,
        use_custom_overheads: editingRecipe.use_custom_overheads,
        custom_labor_cost: editingRecipe.custom_labor_cost,
        custom_overhead_cost: editingRecipe.custom_overhead_cost,
        selling_price: editingRecipe.selling_price,
        ingredients: editingRecipe.ingredients
      });
      setIsModalOpen(false);
      fetchData(); // Refresh list
    } catch (err) {
      console.error(err);
      alert('Failed to update product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20 md:pb-0">
      <TopNav />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products Catalog</h1>
            <p className="text-gray-500 text-sm">View your finished goods, update selling prices, and track margins.</p>
          </div>
          <Link href="/recipes" className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors">
            Manage Recipes
          </Link>
        </div>

        {recipes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-4">🍩</div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No Products Found</h3>
            <p className="text-gray-500 mb-4">You haven't created any recipes yet.</p>
            <Link href="/recipes" className="text-orange-600 font-medium hover:underline">
              Go to Recipes to create one
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recipes.map((recipe) => {
              const costPrice = calculateTotalRecipeCost(recipe);
              const sellingPrice = recipe.selling_price || 0;
              const margin = sellingPrice > 0 ? ((sellingPrice - costPrice) / sellingPrice) * 100 : 0;
              
              return (
                <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                  <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden">
                    {recipe.image_data ? (
                      <img src={recipe.image_data} alt={recipe.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🍰</span>
                    )}
                  </div>
                  <div className="p-4 flex-grow flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{recipe.name}</h3>
                    <p className="text-xs text-gray-500 mb-4">{recipe.yield_amount ? `Yields: ${recipe.yield_amount}` : 'No yield specified'}</p>
                    
                    <div className="grid grid-cols-2 gap-2 mt-auto mb-4">
                      <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide block">Cost Price</span>
                        <span className="font-bold text-gray-900">{currencySymbol}{costPrice.toFixed(2)}</span>
                      </div>
                      <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                        <span className="text-[10px] text-orange-600 uppercase tracking-wide block">Selling Price</span>
                        <span className="font-bold text-orange-700">{currencySymbol}{sellingPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${margin > 0 ? 'bg-emerald-100 text-emerald-700' : margin < 0 ? 'bg-rose-100 text-rose-700' : 'bg-gray-100 text-gray-600'}`}>
                        {margin > 0 ? '+' : ''}{margin.toFixed(0)}% margin
                      </span>
                      <button 
                        onClick={() => openEditModal(recipe)}
                        className="text-sm font-medium text-orange-600 hover:text-orange-700"
                      >
                        Edit Price
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Edit Product Modal */}
      {isModalOpen && editingRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Update Product</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">&times;</button>
            </div>
            <div className="p-6">
              <form onSubmit={handleUpdate}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    required
                    type="text"
                    value={editingRecipe.name}
                    onChange={(e) => setEditingRecipe({ ...editingRecipe, name: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-100 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Calculated Cost</span>
                  <span className="font-bold text-gray-900">{currencySymbol}{calculateTotalRecipeCost(editingRecipe).toFixed(2)}</span>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Retail Selling Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">{currencySymbol}</span>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingRecipe.selling_price || ''}
                      onChange={(e) => setEditingRecipe({ ...editingRecipe, selling_price: parseFloat(e.target.value) || 0 })}
                      className="w-full border border-gray-300 rounded-lg pl-7 pr-3 py-2 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700">
                    {isSubmitting ? 'Saving...' : 'Save Updates'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <BottomNav />
    </div>
  );
}
