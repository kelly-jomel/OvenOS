"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Ingredient,
  Recipe,
  POSOrder,
  VendorPO,
  BakeScheduleItem,
  INITIAL_INGREDIENTS,
  INITIAL_RECIPES,
  INITIAL_POS_ORDERS,
  INITIAL_BAKE_SCHEDULE,
  INITIAL_VENDOR_POS,
} from "./mockData";

export type Currency = "USD" | "INR" | "GBP" | "EUR";

interface AppContextType {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  currencyRate: number;
  currencySymbol: string;
  ingredients: Ingredient[];
  recipes: Recipe[];
  orders: POSOrder[];
  bakeSchedules: BakeScheduleItem[];
  vendorPOs: VendorPO[];
  addIngredient: (ing: Omit<Ingredient, "id" | "unitCost">) => void;
  updateStock: (id: string, delta: number) => void;
  addRecipe: (recipe: Omit<Recipe, "id" | "totalCost" | "costPerUnit" | "actualMarginPct" | "quadrant" | "unitsSold30d">) => void;
  deleteRecipe: (id: string) => void;
  addOrder: (order: Omit<POSOrder, "id" | "orderNumber" | "createdAt">) => void;
  updateScheduleStatus: (id: string, status: "Pending" | "In Progress" | "Completed") => void;
  addScheduleItem: (item: Omit<BakeScheduleItem, "id">) => void;
  sendVendorPO: (poId: string) => void;
  isDemoModalOpen: boolean;
  setIsDemoModalOpen: (open: boolean) => void;
}

const RATES: Record<Currency, { rate: number; symbol: string }> = {
  USD: { rate: 1, symbol: "$" },
  INR: { rate: 85, symbol: "₹" },
  GBP: { rate: 0.79, symbol: "£" },
  EUR: { rate: 0.92, symbol: "€" },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [ingredients, setIngredients] = useState<Ingredient[]>(INITIAL_INGREDIENTS);
  const [recipes, setRecipes] = useState<Recipe[]>(INITIAL_RECIPES);
  const [orders, setOrders] = useState<POSOrder[]>(INITIAL_POS_ORDERS);
  const [bakeSchedules, setBakeSchedules] = useState<BakeScheduleItem[]>(INITIAL_BAKE_SCHEDULE);
  const [vendorPOs, setVendorPOs] = useState<VendorPO[]>(INITIAL_VENDOR_POS);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  useEffect(() => {
    try {
      const savedCurr = localStorage.getItem("cl_currency") as Currency;
      if (savedCurr && RATES[savedCurr]) setCurrency(savedCurr);
    } catch {
      // ignore
    }
  }, []);

  const handleSetCurrency = (c: Currency) => {
    setCurrency(c);
    try {
      localStorage.setItem("cl_currency", c);
    } catch {
      // ignore
    }
  };

  const addIngredient = (ing: Omit<Ingredient, "id" | "unitCost">) => {
    const unitCost = ing.packQuantity > 0 ? ing.packPrice / ing.packQuantity : 0;
    const newIng: Ingredient = {
      ...ing,
      id: `ing-${Date.now()}`,
      unitCost,
    };
    setIngredients((prev) => [newIng, ...prev]);
  };

  const updateStock = (id: string, delta: number) => {
    setIngredients((prev) =>
      prev.map((ing) =>
        ing.id === id ? { ...ing, inStock: Math.max(0, ing.inStock + delta) } : ing
      )
    );
  };

  const addRecipe = (recipeData: Omit<Recipe, "id" | "totalCost" | "costPerUnit" | "actualMarginPct" | "quadrant" | "unitsSold30d">) => {
    const laborTotal = recipeData.laborHours * recipeData.laborRatePerHour;
    const totalCost = recipeData.totalIngredientsCost + laborTotal + recipeData.overheadCost;
    const costPerUnit = recipeData.yieldUnits > 0 ? totalCost / recipeData.yieldUnits : 0;
    const actualMarginPct =
      recipeData.suggestedRetailPrice > 0
        ? ((recipeData.suggestedRetailPrice - costPerUnit) / recipeData.suggestedRetailPrice) * 100
        : 0;

    const newRecipe: Recipe = {
      ...recipeData,
      id: `rec-${Date.now()}`,
      totalCost,
      costPerUnit,
      actualMarginPct,
      unitsSold30d: 0,
      quadrant: actualMarginPct >= 60 ? "Puzzle" : "Dog",
    };
    setRecipes((prev) => [newRecipe, ...prev]);
  };

  const deleteRecipe = (id: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const addOrder = (orderData: Omit<POSOrder, "id" | "orderNumber" | "createdAt">) => {
    const orderNum = `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: POSOrder = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: orderNum,
      createdAt: "Just now",
    };
    setOrders((prev) => [newOrder, ...prev]);
  };

  const updateScheduleStatus = (id: string, status: "Pending" | "In Progress" | "Completed") => {
    setBakeSchedules((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status } : item))
    );
  };

  const addScheduleItem = (item: Omit<BakeScheduleItem, "id">) => {
    const newItem: BakeScheduleItem = {
      ...item,
      id: `bs-${Date.now()}`,
    };
    setBakeSchedules((prev) => [...prev, newItem]);
  };

  const sendVendorPO = (poId: string) => {
    setVendorPOs((prev) =>
      prev.map((po) => (po.id === poId ? { ...po, status: "Sent to Vendor" } : po))
    );
  };

  return (
    <AppContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        currencyRate: RATES[currency].rate,
        currencySymbol: RATES[currency].symbol,
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
        isDemoModalOpen,
        setIsDemoModalOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
