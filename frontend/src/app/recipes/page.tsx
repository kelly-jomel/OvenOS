'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import Link from 'next/link';
import api from '@/lib/api';

type RecipeIngredient = {
  id: number;
  inventory_item_id: number;
  quantity_required: number;
};

type Recipe = {
  id: number;
  name: string;
  description: string;
  yield_amount: string;
  ingredients: RecipeIngredient[];
};

type InventoryItem = {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  purchase_price: number;
};

export default function RecipesPage() {
  const [loading, setLoading] = useState(true);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [yieldAmount, setYieldAmount] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<{inventory_item_id: number, quantity_required: number}[]>([]);

  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        await Promise.all([fetchRecipes(), fetchInventory()]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router, refreshKey]);

  const fetchRecipes = async () => {
    try {
      const response = await api.get('/recipes/');
      setRecipes(response.data);
    } catch (err) {
      console.error('Failed to fetch recipes', err);
    }
  };

  const fetchInventory = async () => {
    try {
      const response = await api.get('/inventory/');
      setInventory(response.data);
    } catch (err) {
      console.error('Failed to fetch inventory', err);
    }
  };

  const handleAddIngredientToRecipe = () => {
    if (inventory.length === 0) return;
    setSelectedIngredients([
      ...selectedIngredients,
      { inventory_item_id: inventory[0].id, quantity_required: 0 }
    ]);
  };

  const handleUpdateIngredient = (index: number, field: string, value: string) => {
    const newIngredients = [...selectedIngredients];
    if (field === 'id') {
      newIngredients[index].inventory_item_id = parseInt(value);
    } else {
      newIngredients[index].quantity_required = parseFloat(value) || 0;
    }
    setSelectedIngredients(newIngredients);
  };

  const handleRemoveIngredient = (index: number) => {
    const newIngredients = [...selectedIngredients];
    newIngredients.splice(index, 1);
    setSelectedIngredients(newIngredients);
  };

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/recipes/', {
        name,
        description,
        yield_amount: yieldAmount,
        ingredients: selectedIngredients
      });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      setYieldAmount('');
      setSelectedIngredients([]);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Failed to add recipe', err);
      alert('Failed to add recipe');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this recipe?')) return;
    try {
      await api.delete(`/recipes/${id}`);
      setRefreshKey(prev => prev + 1);
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  // Helper to get ingredient name from ID
  const getIngredientName = (id: number) => {
    const item = inventory.find(i => i.id === id);
    return item ? item.name : 'Unknown Ingredient';
  };
  
  const getIngredientUnit = (id: number) => {
    const item = inventory.find(i => i.id === id);
    return item ? item.unit : '';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
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
                <Link href="/dashboard" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Dashboard
                </Link>
                <Link href="/inventory" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Inventory
                </Link>
                <Link href="/billing" className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Billing
                </Link>
                <Link href="/recipes" className="border-orange-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Recipes
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <div className="ml-3 relative flex-shrink-0">
                <Link href="/profile">
                  <button className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                    <img className="h-8 w-8 rounded-full" src="https://ui-avatars.com/api/?name=Admin&background=random" alt="Admin" />
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0 mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recipe Manager</h1>
            <p className="text-sm text-gray-500 mt-1">Build dynamic recipes and calculate ingredient requirements.</p>
          </div>
          <button 
            onClick={() => {
              if (inventory.length === 0) {
                alert("Please add items to your Inventory first!");
                router.push('/inventory');
                return;
              }
              setIsModalOpen(true);
            }}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 shadow-sm transition-colors"
          >
            + Add Recipe
          </button>
        </div>

        {/* Recipe Grid */}
        {recipes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden p-12 text-center">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-orange-100 mb-6">
              <span className="text-4xl">🍰</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Recipes Yet</h2>
            <p className="text-gray-500">Click the button above to start building your recipe database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-gray-900">{recipe.name}</h3>
                    <button onClick={() => handleDelete(recipe.id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 mb-4">{recipe.description || 'No description provided.'}</p>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-md font-medium">
                      Yield: {recipe.yield_amount || 'Unknown'}
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-md">
                      {recipe.ingredients.length} Ingredients
                    </span>
                  </div>

                  <div className="border-t border-gray-100 pt-4">
                    <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">Ingredients</h4>
                    <ul className="space-y-2">
                      {recipe.ingredients.map((ing) => (
                        <li key={ing.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">{getIngredientName(ing.inventory_item_id)}</span>
                          <span className="text-gray-900 font-medium">{ing.quantity_required} {getIngredientUnit(ing.inventory_item_id)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Recipe Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-lg font-semibold text-gray-800">Add New Recipe</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <form id="recipe-form" onSubmit={handleAddRecipe} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recipe Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. Classic Vanilla Sponge"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <input
                    type="text"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. A light and fluffy base for tier cakes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Yield Amount</label>
                  <input
                    required
                    type="text"
                    value={yieldAmount}
                    onChange={e => setYieldAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="e.g. Two 8-inch layers"
                  />
                </div>

                <div className="mt-6 border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-md font-medium text-gray-900">Ingredients Formulation</h4>
                    <button 
                      type="button" 
                      onClick={handleAddIngredientToRecipe}
                      className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
                    >
                      + Add Item
                    </button>
                  </div>
                  
                  {selectedIngredients.length === 0 ? (
                    <div className="text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                      <p className="text-sm text-gray-500">No ingredients added yet.</p>
                      <button 
                        type="button" 
                        onClick={handleAddIngredientToRecipe}
                        className="mt-2 text-sm text-orange-600 font-medium"
                      >
                        Click to add the first ingredient
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedIngredients.map((ing, idx) => (
                        <div key={idx} className="flex gap-3 items-end">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Inventory Item</label>
                            <select
                              value={ing.inventory_item_id}
                              onChange={e => handleUpdateIngredient(idx, 'id', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                            >
                              {inventory.map(invItem => (
                                <option key={invItem.id} value={invItem.id}>
                                  {invItem.name} ({invItem.unit})
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="w-1/3">
                            <label className="block text-xs text-gray-500 mb-1">Quantity Req.</label>
                            <input
                              required
                              type="number"
                              step="0.01"
                              value={ing.quantity_required || ''}
                              onChange={e => handleUpdateIngredient(idx, 'qty', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="0.0"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveIngredient(idx)}
                            className="p-2 text-gray-400 hover:text-red-500 mb-1"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </form>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="recipe-form"
                disabled={isSubmitting || selectedIngredients.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 min-w-[120px]"
              >
                {isSubmitting ? 'Saving...' : 'Save Recipe'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
