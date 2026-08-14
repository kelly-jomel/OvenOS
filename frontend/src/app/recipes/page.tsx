"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import api from '@/lib/api';
import TopNav from '@/components/TopNav';
import BottomNav from '@/components/BottomNav';
import { useBakery } from '@/context/BakeryContext';
import Link from 'next/link';

interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  purchase_price: number;
}

interface RecipeIngredient {
  id?: number;
  inventory_item_id: number;
  quantity_required: number;
  // UI only fields
  item_name?: string;
  unit?: string;
  purchase_price?: number;
}

interface Recipe {
  id: number;
  name: string;
  description: string;
  yield_amount: string;
  image_data?: string;
  ingredients: RecipeIngredient[];
}

// Unit conversion helper
const calculateCost = (ingredient: RecipeIngredient, item: InventoryItem): number => {
  if (!item) return 0;
  
  let requiredQty = ingredient.quantity_required;
  const itemUnit = item.unit.toLowerCase();
  const ingUnit = ingredient.unit?.toLowerCase() || itemUnit;
  
  // Standardize common unit strings
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

export default function RecipesPage() {
  const router = useRouter();
  const { currencySymbol } = useBakery();
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [newRecipe, setNewRecipe] = useState<Partial<Recipe>>({
    name: '',
    description: '',
    yield_amount: '',
    image_data: '',
    ingredients: []
  });
  
  // Temp Ingredient selection
  const [selectedItemId, setSelectedItemId] = useState<number | ''>('');
  const [selectedItemQty, setSelectedItemQty] = useState<string>('');
  const [selectedItemUnit, setSelectedItemUnit] = useState<string>('g'); // Default input unit

  const fetchData = async () => {
    try {
      setLoading(true);
      const [recipesRes, inventoryRes] = await Promise.all([
        api.get('/recipes/'),
        api.get('/inventory/')
      ]);
      setRecipes(recipesRes.data);
      setInventory(inventoryRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchData();
      } else {
        router.push('/login');
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("Image size must be less than 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNewRecipe({ ...newRecipe, image_data: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const addIngredientToRecipe = () => {
    if (!selectedItemId || !selectedItemQty) return;
    
    const item = inventory.find(i => i.id === Number(selectedItemId));
    if (!item) return;

    const newIngredient: RecipeIngredient = {
      inventory_item_id: item.id,
      quantity_required: Number(selectedItemQty),
      item_name: item.name,
      unit: selectedItemUnit,
      purchase_price: item.purchase_price
    };

    setNewRecipe({
      ...newRecipe,
      ingredients: [...(newRecipe.ingredients || []), newIngredient]
    });
    
    // Reset selections
    setSelectedItemId('');
    setSelectedItemQty('');
  };

  const removeIngredient = (index: number) => {
    const updatedIngredients = [...(newRecipe.ingredients || [])];
    updatedIngredients.splice(index, 1);
    setNewRecipe({ ...newRecipe, ingredients: updatedIngredients });
  };

  const handleSaveRecipe = async () => {
    if (!newRecipe.name || !newRecipe.ingredients || newRecipe.ingredients.length === 0) {
      alert("Please provide a name and at least one ingredient.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      const payload = {
        ...newRecipe,
        ingredients: newRecipe.ingredients.map(ing => {
          const item = inventory.find(i => i.id === ing.inventory_item_id);
          let qty = ing.quantity_required;
          const ingUnit = ing.unit?.toLowerCase() || '';
          const itemUnit = item?.unit.toLowerCase() || '';
          
          if (itemUnit === 'kg' && ingUnit === 'g') {
            qty = qty / 1000;
          } else if (itemUnit === 'g' && ingUnit === 'kg') {
            qty = qty * 1000;
          } else if (itemUnit === 'l' && ingUnit === 'ml') {
            qty = qty / 1000;
          } else if (itemUnit === 'ml' && ingUnit === 'l') {
            qty = qty * 1000;
          }
          
          return {
            inventory_item_id: ing.inventory_item_id,
            quantity_required: qty
          };
        })
      };

      await api.post('/recipes/', payload);
      await fetchData();
      setIsModalOpen(false);
      setNewRecipe({ name: '', description: '', yield_amount: '', image_data: '', ingredients: [] });
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteRecipe = async (id: number) => {
    if (!confirm("Are you sure you want to delete this recipe?")) return;
    try {
      await api.delete(`/recipes/${id}`);
      setRecipes(recipes.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting recipe:", error);
      alert("Failed to delete recipe.");
    }
  };

  const calculateTotalRecipeCost = (ingredients: RecipeIngredient[]) => {
    return ingredients.reduce((total, ing) => {
      const inventoryItem = inventory.find(i => i.id === ing.inventory_item_id);
      if (!inventoryItem) return total;
      return total + calculateCost({ ...ing, unit: ing.unit || inventoryItem.unit }, inventoryItem);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
        <TopNav title="Recipes" />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      <TopNav title="Recipes" />

      <main className="flex-1 p-4 max-w-4xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recipe Costing</h1>
            <p className="text-gray-500 text-sm">Calculate the exact cost of your products.</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition"
          >
            + New Recipe
          </button>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
            <span className="text-4xl mb-4 block">🍲</span>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Recipes Yet</h3>
            <p className="text-gray-500 mb-4 max-w-sm mx-auto">Create a recipe to automatically calculate its cost based on your inventory prices.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-orange-600 font-medium hover:text-orange-700"
            >
              Add Your First Recipe
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes.map(recipe => (
              <div key={recipe.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4">
                    {recipe.image_data ? (
                      <img src={recipe.image_data} alt={recipe.name} className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                    ) : (
                      <div className="w-16 h-16 bg-orange-100 text-orange-500 rounded-lg flex items-center justify-center text-2xl border border-orange-200">
                        🍲
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-gray-900">{recipe.name}</h3>
                      <p className="text-gray-500 text-sm">Yield: {recipe.yield_amount || "N/A"}</p>
                    </div>
                  </div>
                  <button onClick={() => deleteRecipe(recipe.id)} className="text-gray-400 hover:text-red-500">
                    ✕
                  </button>
                </div>
                
                <p className="text-gray-600 text-sm mb-4 flex-1">{recipe.description}</p>
                
                <div className="bg-gray-50 p-3 rounded-lg mt-auto flex justify-between items-center border border-gray-100">
                  <span className="text-sm text-gray-500">{recipe.ingredients.length} Ingredients</span>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 block uppercase tracking-wide">Total Cost</span>
                    <span className="font-bold text-lg text-gray-900">
                      {currencySymbol}{calculateTotalRecipeCost(recipe.ingredients).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Recipe Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-5 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-gray-900">Create New Recipe</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto">
              {/* Image Upload */}
              <div className="mb-6 flex gap-4 items-center">
                <div className="w-20 h-20 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                  {newRecipe.image_data ? (
                    <img src={newRecipe.image_data} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl text-gray-300">📷</span>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Image</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-orange-50 file:text-orange-700
                      hover:file:bg-orange-100 cursor-pointer"
                  />
                  <p className="text-xs text-gray-400 mt-1">Max size 1MB (Optional)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name *</label>
                  <input
                    type="text"
                    value={newRecipe.name}
                    onChange={(e) => setNewRecipe({...newRecipe, name: e.target.value})}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="e.g., Chocolate Cake"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yield (Output) *</label>
                  <input
                    type="text"
                    value={newRecipe.yield_amount}
                    onChange={(e) => setNewRecipe({...newRecipe, yield_amount: e.target.value})}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="e.g., 12 slices"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={newRecipe.description}
                    onChange={(e) => setNewRecipe({...newRecipe, description: e.target.value})}
                    className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="Short description or instructions..."
                    rows={2}
                  />
                </div>
              </div>

              <div className="border-t pt-6 mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ingredients</h3>
                
                {/* Add Ingredient Bar */}
                <div className="flex flex-wrap md:flex-nowrap gap-2 mb-4 bg-gray-50 p-3 rounded-lg border border-gray-200 items-end">
                  <div className="flex-1 w-full md:w-auto">
                    <label className="block text-xs text-gray-500 mb-1">Inventory Item</label>
                    <select
                      value={selectedItemId}
                      onChange={(e) => setSelectedItemId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full border rounded-lg p-2 bg-white outline-none"
                    >
                      <option value="">Select Item...</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.quantity}{item.unit} / {currencySymbol}{item.purchase_price})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full md:w-24">
                    <label className="block text-xs text-gray-500 mb-1">Qty</label>
                    <input
                      type="number"
                      value={selectedItemQty}
                      onChange={(e) => setSelectedItemQty(e.target.value)}
                      className="w-full border rounded-lg p-2 bg-white outline-none"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="w-full md:w-24">
                    <label className="block text-xs text-gray-500 mb-1">Unit</label>
                    <select
                      value={selectedItemUnit}
                      onChange={(e) => setSelectedItemUnit(e.target.value)}
                      className="w-full border rounded-lg p-2 bg-white outline-none"
                    >
                      <option value="g">g</option>
                      <option value="kg">kg</option>
                      <option value="ml">ml</option>
                      <option value="L">L</option>
                      <option value="pcs">pcs</option>
                    </select>
                  </div>
                  <button 
                    onClick={addIngredientToRecipe}
                    className="w-full md:w-auto bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-black mt-2 md:mt-0"
                  >
                    Add
                  </button>
                </div>

                {/* Ingredient List */}
                {newRecipe.ingredients && newRecipe.ingredients.length > 0 ? (
                  <div className="space-y-2">
                    {newRecipe.ingredients.map((ing, idx) => {
                      const item = inventory.find(i => i.id === ing.inventory_item_id);
                      if (!item) return null;
                      const cost = calculateCost(ing, item);
                      
                      return (
                        <div key={idx} className="flex justify-between items-center p-3 bg-white border border-gray-100 rounded-lg shadow-sm">
                          <div>
                            <p className="font-medium text-gray-900">{ing.item_name}</p>
                            <p className="text-sm text-gray-500">{ing.quantity_required} {ing.unit} @ {currencySymbol}{item.purchase_price} per {item.quantity}{item.unit}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-bold text-gray-900">{currencySymbol}{cost.toFixed(2)}</span>
                            <button onClick={() => removeIngredient(idx)} className="text-gray-400 hover:text-red-500 p-1">
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8 italic border border-dashed rounded-lg bg-gray-50">No ingredients added yet.</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-5 border-t bg-gray-50 sticky bottom-0 z-10 flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500 uppercase tracking-wide">Total Recipe Cost</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currencySymbol}{calculateTotalRecipeCost(newRecipe.ingredients || []).toFixed(2)}
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveRecipe}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-orange-600 text-white font-medium rounded-lg hover:bg-orange-700 transition disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Save Recipe'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
