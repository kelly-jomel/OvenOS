"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/lib/AppContext";
import {
  ChefHat,
  Scale,
  Layers,
  ShoppingBag,
  BarChart3,
  Plus,
  Trash2,
  AlertTriangle,
  ArrowRight,
  Printer,
  CheckCircle,
  HelpCircle,
  Home,
  Sun,
  Flame,
  CalendarCheck,
  Send,
  Sliders,
  DollarSign,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
} from "lucide-react";
import confetti from "canvas-confetti";

export function BakeryAppDashboard() {
  const {
    currency,
    currencyRate,
    currencySymbol,
    ingredients,
    recipes,
    orders,
    bakeSchedules,
    vendorPOs,
    addIngredient,
    updateStock,
    addRecipe,
    deleteRecipe,
    addOrder,
    updateScheduleStatus,
    addScheduleItem,
    sendVendorPO,
  } = useApp();

  const [activeTab, setActiveTab] = useState<
    "briefing" | "recipes" | "matrix" | "bakesheet" | "pantry" | "vendorpo" | "pos" | "reports"
  >("briefing");

  // Recipe Creation Modal State
  const [isNewRecipeModalOpen, setIsNewRecipeModalOpen] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState("");
  const [newRecipeCategory, setNewRecipeCategory] = useState<"Cakes" | "Breads" | "Pastries" | "Cookies">("Cakes");
  const [newRecipeYield, setNewRecipeYield] = useState(10);
  const [newRecipeLaborHours, setNewRecipeLaborHours] = useState(1.5);
  const [newRecipeLaborRate, setNewRecipeLaborRate] = useState(22);
  const [newRecipeOverhead, setNewRecipeOverhead] = useState(5.0);
  const [newRecipeTargetPrice, setNewRecipeTargetPrice] = useState(32);
  const [selectedIngredientItems, setSelectedIngredientItems] = useState<
    { ingredientId: string; quantity: number }[]
  >([{ ingredientId: ingredients[0]?.id || "", quantity: 200 }]);

  // POS State
  const [cart, setCart] = useState<{ recipeId: string; quantity: number }[]>([]);
  const [posCustomerName, setPosCustomerName] = useState("");
  const [posPaymentMethod, setPosPaymentMethod] = useState<"Cash" | "Card" | "UPI / QR">("Card");
  const [lastCompletedOrder, setLastCompletedOrder] = useState<string | null>(null);

  // New Ingredient Modal State
  const [isNewIngModalOpen, setIsNewIngModalOpen] = useState(false);
  const [newIngName, setNewIngName] = useState("");
  const [newIngCategory, setNewIngCategory] = useState<any>("Flour & Grain");
  const [newIngUnit, setNewIngUnit] = useState<any>("g");
  const [newIngPackPrice, setNewIngPackPrice] = useState(15);
  const [newIngPackQty, setNewIngPackQty] = useState(1000);
  const [newIngStock, setNewIngStock] = useState(5000);
  const [newIngThreshold, setNewIngThreshold] = useState(1000);
  const [newIngSupplier, setNewIngSupplier] = useState("Local Wholesale");

  // New Bake Schedule Item State
  const [isNewScheduleModalOpen, setIsNewScheduleModalOpen] = useState(false);
  const [schedRecipeName, setSchedRecipeName] = useState(recipes[0]?.name || "Artisan Sourdough Boule");
  const [schedBatches, setSchedBatches] = useState(2);
  const [schedTime, setSchedTime] = useState("06:00 AM - 07:30 AM");
  const [schedStation, setSchedStation] = useState<any>("Deck Oven");

  // Handle Recipe Creation
  const handleCreateRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipeName) return;

    let totalIngredientsCost = 0;
    const items = selectedIngredientItems.map((item) => {
      const ing = ingredients.find((i) => i.id === item.ingredientId);
      const cost = ing ? ing.unitCost * item.quantity : 0;
      totalIngredientsCost += cost;
      return {
        ingredientId: item.ingredientId,
        ingredientName: ing ? ing.name : "Custom Ingredient",
        quantity: item.quantity,
        unit: ing ? ing.unit : "g",
        cost,
      };
    });

    addRecipe({
      name: newRecipeName,
      category: newRecipeCategory,
      yieldUnits: newRecipeYield,
      prepMinutes: 30,
      bakeMinutes: 30,
      laborRatePerHour: newRecipeLaborRate,
      laborHours: newRecipeLaborHours,
      overheadCost: newRecipeOverhead,
      items,
      totalIngredientsCost,
      suggestedRetailPrice: newRecipeTargetPrice,
      targetMarginPct: 70,
    });

    setIsNewRecipeModalOpen(false);
    setNewRecipeName("");
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
  };

  // Handle POS Order Submission
  const handleCompleteOrder = () => {
    if (cart.length === 0) return;

    let subtotal = 0;
    let totalCost = 0;
    const orderItems = cart.map((ci, index) => {
      const recipe = recipes.find((r) => r.id === ci.recipeId);
      const unitPrice = recipe ? recipe.suggestedRetailPrice : 10;
      const costPrice = recipe ? recipe.costPerUnit : 3;
      subtotal += unitPrice * ci.quantity;
      totalCost += costPrice * ci.quantity;

      if (recipe) {
        recipe.items.forEach((item) => {
          const totalIngredientQuantityUsed = (item.quantity / recipe.yieldUnits) * ci.quantity;
          updateStock(item.ingredientId, -totalIngredientQuantityUsed);
        });
      }

      return {
        id: `oi-${index}-${Date.now()}`,
        recipeId: ci.recipeId,
        recipeName: recipe ? recipe.name : "Custom Item",
        quantity: ci.quantity,
        unitPrice,
        costPrice,
      };
    });

    const tax = subtotal * 0.08;
    const total = subtotal + tax;
    const profit = subtotal - totalCost;

    addOrder({
      customerName: posCustomerName.trim() || "Walk-in Guest",
      items: orderItems,
      subtotal,
      tax,
      discount: 0,
      total,
      profit,
      paymentMethod: posPaymentMethod,
      status: "Completed",
    });

    setCart([]);
    setPosCustomerName("");
    setLastCompletedOrder(`Order completed! Deducted inventory for ${orderItems.length} items.`);
    confetti({ particleCount: 75, spread: 70, origin: { y: 0.6 } });
    setTimeout(() => setLastCompletedOrder(null), 5000);
  };

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIngName) return;
    addIngredient({
      name: newIngName,
      category: newIngCategory,
      unit: newIngUnit,
      packPrice: newIngPackPrice,
      packQuantity: newIngPackQty,
      inStock: newIngStock,
      minThreshold: newIngThreshold,
      supplier: newIngSupplier,
    });
    setIsNewIngModalOpen(false);
    setNewIngName("");
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    const recipe = recipes.find((r) => r.name === schedRecipeName);
    const totalUnits = recipe ? recipe.yieldUnits * schedBatches : schedBatches * 10;
    addScheduleItem({
      recipeName: schedRecipeName,
      batchCount: schedBatches,
      totalUnits,
      timeSlot: schedTime,
      station: schedStation,
      status: "Pending",
    });
    setIsNewScheduleModalOpen(false);
  };

  // Reports calculations
  const totalSalesRevenue = orders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalProfitCalculated = orders.reduce((sum, o) => sum + o.profit, 0);
  const avgMarginOverall = totalSalesRevenue > 0 ? (totalProfitCalculated / totalSalesRevenue) * 100 : 0;
  const lowStockItems = ingredients.filter((i) => i.inStock <= i.minThreshold);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/20">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-base text-white tracking-tight">CrumbLedger</span>
              <span className="block text-[10px] text-amber-400 font-medium">Bakery Operating System</span>
            </div>
          </Link>
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white flex items-center"
            title="Return to Landing Page"
          >
            <Home className="w-4 h-4" />
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="p-4 space-y-1.5 flex-1 overflow-y-auto">
          {/* 1. Morning Briefing */}
          <button
            onClick={() => setActiveTab("briefing")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "briefing"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Sun className="w-4 h-4" />
              <span>Morning Baker's Brief</span>
            </div>
            {lowStockItems.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
            )}
          </button>

          {/* 2. Menu Engineering */}
          <button
            onClick={() => setActiveTab("matrix")}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "matrix"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Menu Engineering (BCG)</span>
          </button>

          {/* 3. Daily Bake Schedule */}
          <button
            onClick={() => setActiveTab("bakesheet")}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "bakesheet"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Daily Bake Schedule</span>
          </button>

          {/* 4. Recipe Formulas */}
          <button
            onClick={() => setActiveTab("recipes")}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "recipes"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Recipe Formulas ({recipes.length})</span>
          </button>

          {/* 5. Pantry Stock */}
          <button
            onClick={() => setActiveTab("pantry")}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "pantry"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <div className="flex items-center space-x-2.5">
              <Layers className="w-4 h-4" />
              <span>Raw Pantry Stock ({ingredients.length})</span>
            </div>
            {lowStockItems.length > 0 && (
              <span className="text-[10px] bg-rose-950 text-rose-300 px-1.5 py-0.2 rounded font-bold">
                {lowStockItems.length}
              </span>
            )}
          </button>

          {/* 6. Vendor POs */}
          <button
            onClick={() => setActiveTab("vendorpo")}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "vendorpo"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Vendor Purchase Orders</span>
          </button>

          {/* 7. POS Register */}
          <button
            onClick={() => setActiveTab("pos")}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "pos"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Counter POS Register</span>
          </button>

          {/* 8. Reports */}
          <button
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center space-x-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === "reports"
                ? "bg-amber-500 text-slate-950 shadow-md font-bold"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>P&L & Margin Reports</span>
          </button>
        </nav>

        {/* Currency & Info */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 text-xs">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span>Active Currency:</span>
            <span className="font-bold text-amber-400">{currency} ({currencySymbol})</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Enterprise Kitchen Intelligence active.
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 px-6 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <h1 className="text-base font-bold text-white uppercase tracking-wider">
              {activeTab === "briefing" && "Morning Baker's Briefing & Kitchen Forecast"}
              {activeTab === "matrix" && "Menu Engineering Quadrant (Margin vs Popularity)"}
              {activeTab === "bakesheet" && "Production Bake Schedule & Station Flow"}
              {activeTab === "recipes" && "Master Recipe Formulas & Baker's Percentages"}
              {activeTab === "pantry" && "Raw Pantry Stock & Ingredient Database"}
              {activeTab === "vendorpo" && "Automated Supplier Purchase Orders"}
              {activeTab === "pos" && "Fast Touchscreen Counter POS"}
              {activeTab === "reports" && "Sales & Profit Margin Analytics"}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            {lastCompletedOrder && (
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full animate-in fade-in">
                {lastCompletedOrder}
              </span>
            )}
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Public Site
            </Link>
          </div>
        </header>

        {/* Dynamic Tab Body */}
        <div className="p-6">
          {/* TAB: MORNING BAKER'S BRIEF */}
          {activeTab === "briefing" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Top Banner */}
              <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-6 relative overflow-hidden shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-amber-400 font-bold flex items-center">
                      <Sun className="w-3.5 h-3.5 mr-1.5" /> Friday Morning Executive Dispatch • Today's Bake Call
                    </span>
                    <h2 className="text-2xl font-black text-white mt-1">
                      Prep Plan: 152 Units Across 3 Stations
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      Forecast predicts high morning foot traffic (+18% vs weekly avg) driven by cool weather (14°C) & catering preorder #ORD-8942.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("bakesheet")}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-md transition"
                  >
                    View Oven Timetable &rarr;
                  </button>
                </div>
              </div>

              {/* 3 Telemetry Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Flour & Butter Requisition</span>
                    <Flame className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono mt-2">
                    14.2 kg <span className="text-xs text-slate-400 font-normal">Flour</span> / 4.8 kg <span className="text-xs text-slate-400 font-normal">Butter</span>
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1">Enough stock for all scheduled bakes today</div>
                </div>

                <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-5">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Critical Pantry Alerts</span>
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-amber-300 font-mono mt-2">
                    {lowStockItems.length} Ingredients Low
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Butter (1,850g left) & Vanilla (180ml left) need reordering
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Estimated Daily Revenue</span>
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-emerald-400 font-mono mt-2">
                    {currencySymbol}{(1840 * currencyRate).toFixed(0)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Projected Gross Margin: 69.4%
                  </div>
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center">
                  <span>Smart Chef Recommendations</span>
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">
                        Draft Purchase Order for Horizon Dairy
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Butter is below the 2,000g threshold. A 10kg bulk pack order is drafted and ready.
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab("vendorpo")}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-semibold"
                    >
                      Review PO &rarr;
                    </button>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">
                        Croissant Pricing Opportunity
                      </span>
                      <span className="text-slate-400 text-[11px]">
                        Flaky French Butter Croissant is a &quot;Plowhorse&quot; (320 sold, but 42.9% margin). A $0.75 price bump adds +$240/mo profit.
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab("matrix")}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 font-semibold"
                    >
                      View Matrix &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: MENU ENGINEERING MATRIX */}
          {activeTab === "matrix" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Bakery Menu Engineering (BCG Matrix)</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Categorizes recipes by Profit Margin (high/low) vs. Popularity/Volume (high/low) so you can make informed recipe decisions.
                  </p>
                </div>
              </div>

              {/* 4 Quadrants Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. STARS: High Margin, High Popularity */}
                <div className="bg-slate-900 border-2 border-emerald-500/40 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">⭐</span>
                      <span className="font-bold text-emerald-400 text-sm">STARS (High Margin, High Sales)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Strategy: Protect Quality & Consistency</span>
                  </div>
                  <div className="space-y-3">
                    {recipes
                      .filter((r) => r.quadrant === "Star")
                      .map((r) => (
                        <div key={r.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-white">{r.name}</div>
                            <div className="text-[11px] text-slate-400">Sold 30d: {r.unitsSold30d} units</div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-400 font-bold font-mono text-sm">{r.actualMarginPct.toFixed(1)}% margin</div>
                            <div className="text-[11px] text-amber-300 font-mono">{currencySymbol}{(r.suggestedRetailPrice * currencyRate).toFixed(2)} retail</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 2. PLOWHORSES: Low Margin, High Popularity */}
                <div className="bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🐎</span>
                      <span className="font-bold text-amber-400 text-sm">PLOWHORSES (Low Margin, High Sales)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Strategy: Raise Price or Trim Recipe Cost</span>
                  </div>
                  <div className="space-y-3">
                    {recipes
                      .filter((r) => r.quadrant === "Plowhorse")
                      .map((r) => (
                        <div key={r.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-white">{r.name}</div>
                            <div className="text-[11px] text-amber-300">High Volume: {r.unitsSold30d} units sold</div>
                          </div>
                          <div className="text-right">
                            <div className="text-rose-400 font-bold font-mono text-sm">{r.actualMarginPct.toFixed(1)}% margin</div>
                            <div className="text-[10px] text-amber-400">Opportunity: +$0.50 price increase</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 3. PUZZLES: High Margin, Low Popularity */}
                <div className="bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🧩</span>
                      <span className="font-bold text-indigo-400 text-sm">PUZZLES (High Margin, Low Sales)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Strategy: Feature on Counter POS Display</span>
                  </div>
                  <div className="space-y-3">
                    {recipes
                      .filter((r) => r.quadrant === "Puzzle")
                      .map((r) => (
                        <div key={r.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs flex justify-between items-center">
                          <div>
                            <div className="font-bold text-white">{r.name}</div>
                            <div className="text-[11px] text-slate-400">Low Volume: {r.unitsSold30d} units sold</div>
                          </div>
                          <div className="text-right">
                            <div className="text-emerald-400 font-bold font-mono text-sm">{r.actualMarginPct.toFixed(1)}% margin</div>
                            <div className="text-[11px] text-slate-400 font-mono">{currencySymbol}{(r.suggestedRetailPrice * currencyRate).toFixed(2)}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* 4. DOGS: Low Margin, Low Popularity */}
                <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl p-5 shadow-xl">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-base">🐕</span>
                      <span className="font-bold text-slate-400 text-sm">DOGS (Low Margin, Low Sales)</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">Strategy: Retire Recipe or Overhaul</span>
                  </div>
                  <div className="p-6 text-center text-xs text-slate-500">
                    No active recipes in the Dog quadrant. All recipes are currently profitable or high volume!
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: DAILY BAKE SCHEDULE */}
          {activeTab === "bakesheet" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Daily Kitchen Bake Sheet & Oven Schedule</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Organize your kitchen team across mixing, proofing, deck ovens, and decoration stations.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewScheduleModalOpen(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Scheduled Bake</span>
                </button>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Time Slot</th>
                        <th className="py-3.5 px-4">Recipe Formula</th>
                        <th className="py-3.5 px-4">Batches & Total Units</th>
                        <th className="py-3.5 px-4">Station</th>
                        <th className="py-3.5 px-4">Current Status</th>
                        <th className="py-3.5 px-4 text-right">Update Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {bakeSchedules.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-800/30 transition">
                          <td className="py-3.5 px-4 font-mono font-semibold text-amber-400">{item.timeSlot}</td>
                          <td className="py-3.5 px-4 font-bold text-white">{item.recipeName}</td>
                          <td className="py-3.5 px-4 font-mono">
                            {item.batchCount} batches ({item.totalUnits} units)
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                              {item.station}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                                item.status === "Completed"
                                  ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                                  : item.status === "In Progress"
                                  ? "bg-amber-950 text-amber-400 border border-amber-800 animate-pulse"
                                  : "bg-slate-800 text-slate-400"
                              }`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            {item.status !== "Completed" && (
                              <button
                                onClick={() =>
                                  updateScheduleStatus(
                                    item.id,
                                    item.status === "Pending" ? "In Progress" : "Completed"
                                  )
                                }
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                              >
                                {item.status === "Pending" ? "Start" : "Mark Done"}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: VENDOR PURCHASE ORDERS */}
          {activeTab === "vendorpo" && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Automated Supplier Purchase Orders (POs)</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Automatically drafted when inventory falls below minimum safety thresholds.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {vendorPOs.map((po) => (
                  <div key={po.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
                    <div className="flex justify-between items-start pb-3 border-b border-slate-800">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
                          {po.poNumber} • {po.date}
                        </span>
                        <h3 className="text-lg font-bold text-white mt-0.5">{po.supplierName}</h3>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          po.status === "Sent to Vendor"
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800"
                            : "bg-amber-950 text-amber-400 border border-amber-800"
                        }`}
                      >
                        {po.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      {po.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                          <span className="text-white font-medium">{item.ingredientName}</span>
                          <span className="font-mono text-slate-300">
                            {item.quantity} {item.unit} ({currencySymbol}{(item.estimatedCost * currencyRate).toFixed(2)})
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                      <div>
                        <span className="text-slate-400">Total Estimated: </span>
                        <span className="font-bold text-amber-300 font-mono text-sm">
                          {currencySymbol}{(po.totalEstimatedCost * currencyRate).toFixed(2)}
                        </span>
                      </div>
                      {po.status === "Draft" ? (
                        <button
                          onClick={() => {
                            sendVendorPO(po.id);
                            confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
                          }}
                          className="flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg transition"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Dispatch to Supplier</span>
                        </button>
                      ) : (
                        <span className="text-emerald-400 font-medium text-[11px]">
                          ✓ Sent via Supplier EDI
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 1: RECIPES */}
          {activeTab === "recipes" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Your Bakery Catalog</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Every recipe automatically computes raw ingredient cost, baker labor, baker&apos;s percentages, and 70% suggested retail price.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewRecipeModalOpen(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>New Master Recipe</span>
                </button>
              </div>

              {/* Recipe Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {recipes.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {recipe.category}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                            Matrix: {recipe.quadrant}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white mt-1.5">{recipe.name}</h3>
                        <p className="text-xs text-slate-400">
                          Yields {recipe.yieldUnits} units • {recipe.laborHours}h labor • {recipe.prepMinutes + recipe.bakeMinutes} min total time
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-[10px] uppercase text-slate-400">Suggested Retail</div>
                        <div className="text-xl font-mono font-bold text-amber-300">
                          {currencySymbol}{(recipe.suggestedRetailPrice * currencyRate).toFixed(2)}
                          <span className="text-xs text-slate-400 font-normal"> / unit</span>
                        </div>
                        <span className="inline-block mt-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">
                          {recipe.actualMarginPct.toFixed(1)}% margin
                        </span>
                      </div>
                    </div>

                    {/* Baker's Math Hydration Bar */}
                    {recipe.bakersPercentage && (
                      <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
                        <span className="text-[11px] text-slate-400">Baker&apos;s Hydration:</span>
                        <span className="text-amber-400 font-bold">{recipe.bakersPercentage.hydrationPct}%</span>
                        <span className="text-[11px] text-slate-400">Flour Base:</span>
                        <span className="text-slate-200">{recipe.bakersPercentage.flourBaseGrams}g</span>
                        <span className="text-[11px] text-slate-400">Salt:</span>
                        <span className="text-slate-200">{recipe.bakersPercentage.saltPct}%</span>
                      </div>
                    )}

                    {/* Breakdown metrics */}
                    <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Ingredients</span>
                        <span className="font-mono text-slate-300 font-semibold">
                          {currencySymbol}{(recipe.totalIngredientsCost * currencyRate).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Labor & Overhead</span>
                        <span className="font-mono text-slate-300 font-semibold">
                          {currencySymbol}{((recipe.laborHours * recipe.laborRatePerHour + recipe.overheadCost) * currencyRate).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-amber-400 block font-semibold">Cost Per Piece</span>
                        <span className="font-mono text-amber-300 font-bold">
                          {currencySymbol}{(recipe.costPerUnit * currencyRate).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center">
                      <button
                        onClick={() => {
                          setCart([{ recipeId: recipe.id, quantity: 1 }]);
                          setActiveTab("pos");
                        }}
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center"
                      >
                        <span>Punch at POS Register &rarr;</span>
                      </button>
                      <button
                        onClick={() => deleteRecipe(recipe.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded transition"
                        title="Delete recipe"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: PANTRY INVENTORY */}
          {activeTab === "pantry" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white">Live Raw Pantry Stock</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Stock amounts update in real-time as recipes are punched at the POS.
                  </p>
                </div>
                <button
                  onClick={() => setIsNewIngModalOpen(true)}
                  className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-amber-500/20 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Raw Ingredient</span>
                </button>
              </div>

              {/* Inventory Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3.5 px-4">Ingredient Name</th>
                        <th className="py-3.5 px-4">Category</th>
                        <th className="py-3.5 px-4">Bulk Pack Cost</th>
                        <th className="py-3.5 px-4">Computed Cost/Unit</th>
                        <th className="py-3.5 px-4">Current Stock</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4 text-right">Quick Restock</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {ingredients.map((ing) => {
                        const isLowStock = ing.inStock <= ing.minThreshold;
                        return (
                          <tr key={ing.id} className="hover:bg-slate-800/30 transition">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-white">{ing.name}</div>
                              <div className="text-[10px] text-slate-500">{ing.supplier}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                                {ing.category}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 font-mono">
                              {currencySymbol}{(ing.packPrice * currencyRate).toFixed(2)} / {ing.packQuantity} {ing.unit}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-amber-300 font-semibold">
                              {currencySymbol}{(ing.unitCost * currencyRate).toFixed(4)} / {ing.unit}
                            </td>
                            <td className="py-3.5 px-4 font-mono font-bold text-white">
                              {ing.inStock.toLocaleString()} {ing.unit}
                            </td>
                            <td className="py-3.5 px-4">
                              {isLowStock ? (
                                <span className="inline-flex items-center text-[10px] font-bold text-rose-400 bg-rose-950/80 border border-rose-800 px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="w-3 h-3 mr-1" /> Reorder Now
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded-full">
                                  Healthy
                                </span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                onClick={() => updateStock(ing.id, ing.packQuantity)}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition"
                              >
                                + {ing.packQuantity} {ing.unit}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: POS REGISTER */}
          {activeTab === "pos" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white">Select Bakery Items</h2>
                  <span className="text-xs text-slate-400">Tap to add item to customer ticket</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {recipes.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => {
                        const existing = cart.find((c) => c.recipeId === r.id);
                        if (existing) {
                          setCart(
                            cart.map((c) =>
                              c.recipeId === r.id ? { ...c, quantity: c.quantity + 1 } : c
                            )
                          );
                        } else {
                          setCart([...cart, { recipeId: r.id, quantity: 1 }]);
                        }
                      }}
                      className="bg-slate-900 border border-slate-800 hover:border-amber-500 rounded-xl p-4 cursor-pointer transition select-none group"
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-white group-hover:text-amber-400 transition">
                          {r.name}
                        </span>
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {currencySymbol}{(r.suggestedRetailPrice * currencyRate).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-2 flex justify-between items-center">
                        <span>Cost: {currencySymbol}{(r.costPerUnit * currencyRate).toFixed(2)}</span>
                        <span className="text-emerald-400 font-medium">{r.actualMarginPct.toFixed(0)}% margin</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Ticket Cart */}
              <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                    <h3 className="text-base font-bold text-white">Active Counter Ticket</h3>
                    <button
                      onClick={() => setCart([])}
                      className="text-xs text-rose-400 hover:underline"
                    >
                      Clear
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="text-xs text-slate-400 block mb-1">Customer / Guest Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Camilla Vance"
                      value={posCustomerName}
                      onChange={(e) => setPosCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {cart.length === 0 ? (
                    <div className="text-center py-12 text-slate-500 text-xs">
                      No items on ticket. Tap items on the left to add.
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto mb-4">
                      {cart.map((item) => {
                        const rec = recipes.find((r) => r.id === item.recipeId);
                        const unitPrice = rec ? rec.suggestedRetailPrice : 10;
                        return (
                          <div
                            key={item.recipeId}
                            className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60"
                          >
                            <div>
                              <div className="font-semibold text-white">{rec?.name}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {currencySymbol}{(unitPrice * currencyRate).toFixed(2)} each
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  if (item.quantity === 1) {
                                    setCart(cart.filter((c) => c.recipeId !== item.recipeId));
                                  } else {
                                    setCart(
                                      cart.map((c) =>
                                        c.recipeId === item.recipeId
                                          ? { ...c, quantity: c.quantity - 1 }
                                          : c
                                      )
                                    );
                                  }
                                }}
                                className="w-6 h-6 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                              >
                                -
                              </button>
                              <span className="font-mono text-white font-bold w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  setCart(
                                    cart.map((c) =>
                                      c.recipeId === item.recipeId
                                        ? { ...c, quantity: c.quantity + 1 }
                                        : c
                                    )
                                  )
                                }
                                className="w-6 h-6 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="mb-4">
                    <label className="text-xs text-slate-400 block mb-1.5">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {(["Card", "Cash", "UPI / QR"] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPosPaymentMethod(method)}
                          className={`py-2 rounded-lg font-semibold transition ${
                            posPaymentMethod === method
                              ? "bg-amber-500 text-slate-950 font-bold shadow"
                              : "bg-slate-950 text-slate-400 hover:text-white"
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {cart.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Subtotal:</span>
                      <span className="font-mono">
                        {currencySymbol}
                        {(
                          cart.reduce((sum, item) => {
                            const rec = recipes.find((r) => r.id === item.recipeId);
                            return sum + (rec ? rec.suggestedRetailPrice * item.quantity : 0);
                          }, 0) * currencyRate
                        ).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-base font-extrabold text-white">
                      <span>Total Due:</span>
                      <span className="font-mono text-amber-400">
                        {currencySymbol}
                        {(
                          cart.reduce((sum, item) => {
                            const rec = recipes.find((r) => r.id === item.recipeId);
                            return sum + (rec ? rec.suggestedRetailPrice * item.quantity : 0);
                          }, 0) * 1.08 * currencyRate
                        ).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={handleCompleteOrder}
                      className="w-full mt-3 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition"
                    >
                      Complete Sale & Auto-Deduct Inventory
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: REPORTS */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Profit & Margin Performance</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Actual recorded transactions and gross ledger profits.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <span className="text-xs text-slate-400">Total Recorded Sales</span>
                  <div className="text-2xl font-extrabold font-mono text-white mt-1">
                    {currencySymbol}{(totalSalesRevenue * currencyRate).toFixed(2)}
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">Across {orders.length} orders</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <span className="text-xs text-slate-400">Total Net Profit</span>
                  <div className="text-2xl font-extrabold font-mono text-amber-400 mt-1">
                    {currencySymbol}{(totalProfitCalculated * currencyRate).toFixed(2)}
                  </div>
                  <span className="text-[11px] text-slate-400">After raw ingredients & labor</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                  <span className="text-xs text-slate-400">Overall Margin Realized</span>
                  <div className="text-2xl font-extrabold font-mono text-emerald-400 mt-1">
                    {avgMarginOverall.toFixed(1)}%
                  </div>
                  <span className="text-[11px] text-slate-400">Target baseline: 70%</span>
                </div>
              </div>

              {/* Recent Orders Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">
                    Recent POS Orders & Invoices
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Order #</th>
                        <th className="py-3 px-4">Customer</th>
                        <th className="py-3 px-4">Items</th>
                        <th className="py-3 px-4">Method</th>
                        <th className="py-3 px-4">Total</th>
                        <th className="py-3 px-4">Calculated Profit</th>
                        <th className="py-3 px-4 text-right">Time</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 font-mono">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-800/30">
                          <td className="py-3 px-4 text-amber-400 font-bold">{o.orderNumber}</td>
                          <td className="py-3 px-4 font-sans text-white">{o.customerName}</td>
                          <td className="py-3 px-4 font-sans text-slate-400">
                            {o.items.map((i) => `${i.quantity}x ${i.recipeName}`).join(", ")}
                          </td>
                          <td className="py-3 px-4 font-sans">
                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                              {o.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-white font-bold">
                            {currencySymbol}{(o.total * currencyRate).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-emerald-400 font-semibold">
                            +{currencySymbol}{(o.profit * currencyRate).toFixed(2)}
                          </td>
                          <td className="py-3 px-4 text-right font-sans text-slate-500">{o.createdAt}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: ADD BAKE SCHEDULE ITEM */}
      {isNewScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Schedule Production Bake</h3>
            <p className="text-xs text-slate-400 mb-5">
              Assign recipe batches to specific kitchen stations and oven time slots.
            </p>

            <form onSubmit={handleAddSchedule} className="space-y-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Select Recipe</label>
                <select
                  value={schedRecipeName}
                  onChange={(e) => setSchedRecipeName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  {recipes.map((r) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Batches to Bake</label>
                  <input
                    type="number"
                    min="1"
                    value={schedBatches}
                    onChange={(e) => setSchedBatches(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Kitchen Station</label>
                  <select
                    value={schedStation}
                    onChange={(e) => setSchedStation(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Deck Oven">Deck Oven</option>
                    <option value="Proofing">Proofing</option>
                    <option value="Mixing">Mixing</option>
                    <option value="Decoration & Packing">Decoration & Packing</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Oven / Station Time Slot</label>
                <input
                  type="text"
                  placeholder="e.g. 07:00 AM - 08:30 AM"
                  value={schedTime}
                  onChange={(e) => setSchedTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewScheduleModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Schedule Bake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE MASTER RECIPE */}
      {isNewRecipeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 sm:p-8 overflow-y-auto max-h-[90vh] shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Create New Master Recipe</h3>
            <p className="text-xs text-slate-400 mb-5">
              Add your ingredient formula to calculate unit economics, baker&apos;s math, and retail pricing.
            </p>

            <form onSubmit={handleCreateRecipe} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Recipe Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vanilla Bean Buttercream Cupcakes"
                  value={newRecipeName}
                  onChange={(e) => setNewRecipeName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Category</label>
                  <select
                    value={newRecipeCategory}
                    onChange={(e) => setNewRecipeCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="Cakes">Cakes</option>
                    <option value="Pastries">Pastries</option>
                    <option value="Breads">Breads</option>
                    <option value="Cookies">Cookies</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Batch Yield (Units)</label>
                  <input
                    type="number"
                    min="1"
                    value={newRecipeYield}
                    onChange={(e) => setNewRecipeYield(parseInt(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Labor (Hours)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newRecipeLaborHours}
                    onChange={(e) => setNewRecipeLaborHours(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Labor Hourly ($)</label>
                  <input
                    type="number"
                    value={newRecipeLaborRate}
                    onChange={(e) => setNewRecipeLaborRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Overhead / Box ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newRecipeOverhead}
                    onChange={(e) => setNewRecipeOverhead(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300 block">Ingredients in Batch</label>
                {selectedIngredientItems.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      value={item.ingredientId}
                      onChange={(e) => {
                        const copy = [...selectedIngredientItems];
                        copy[idx].ingredientId = e.target.value;
                        setSelectedIngredientItems(copy);
                      }}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      {ingredients.map((ing) => (
                        <option key={ing.id} value={ing.id}>
                          {ing.name} ({currencySymbol}{(ing.unitCost * currencyRate).toFixed(3)}/{ing.unit})
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => {
                        const copy = [...selectedIngredientItems];
                        copy[idx].quantity = parseFloat(e.target.value) || 0;
                        setSelectedIngredientItems(copy);
                      }}
                      className="w-24 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() =>
                    setSelectedIngredientItems([
                      ...selectedIngredientItems,
                      { ingredientId: ingredients[0]?.id || "", quantity: 100 },
                    ])
                  }
                  className="text-xs text-amber-400 hover:underline flex items-center pt-1"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Another Ingredient
                </button>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Target Suggested Retail Price (Per Unit)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 text-xs">{currencySymbol}</span>
                  <input
                    type="number"
                    step="0.5"
                    value={newRecipeTargetPrice}
                    onChange={(e) => setNewRecipeTargetPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl py-2 pl-8 pr-3 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewRecipeModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20"
                >
                  Save Master Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD RAW INGREDIENT */}
      {isNewIngModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl">
            <h3 className="text-lg font-bold text-white mb-1">Add Bulk Ingredient</h3>
            <p className="text-xs text-slate-400 mb-5">
              Enter your supplier pack cost. The per-gram unit cost is automatically calculated.
            </p>

            <form onSubmit={handleAddIngredient} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Ingredient Name</label>
                <input
                  type="text"
                  placeholder="e.g. Pistachio Paste Pure 100%"
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Category</label>
                  <select
                    value={newIngCategory}
                    onChange={(e) => setNewIngCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="Dairy">Dairy</option>
                    <option value="Flour & Grain">Flour & Grain</option>
                    <option value="Sugar & Sweetener">Sugar & Sweetener</option>
                    <option value="Chocolate">Chocolate</option>
                    <option value="Flavor & Leavening">Flavor & Leavening</option>
                    <option value="Packaging">Packaging</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Unit of Measure</label>
                  <select
                    value={newIngUnit}
                    onChange={(e) => setNewIngUnit(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="g">grams (g)</option>
                    <option value="kg">kilograms (kg)</option>
                    <option value="ml">milliliters (ml)</option>
                    <option value="unit">unit / piece</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Pack Price ($)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={newIngPackPrice}
                    onChange={(e) => setNewIngPackPrice(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Pack Quantity</label>
                  <input
                    type="number"
                    value={newIngPackQty}
                    onChange={(e) => setNewIngPackQty(parseFloat(e.target.value) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Starting Stock Qty</label>
                  <input
                    type="number"
                    value={newIngStock}
                    onChange={(e) => setNewIngStock(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 block mb-1">Min Reorder Alert</label>
                  <input
                    type="number"
                    value={newIngThreshold}
                    onChange={(e) => setNewIngThreshold(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewIngModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold"
                >
                  Save Ingredient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
