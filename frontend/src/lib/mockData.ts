export interface Ingredient {
  id: string;
  name: string;
  category: "Dairy" | "Flour & Grain" | "Sugar & Sweetener" | "Chocolate" | "Flavor & Leavening" | "Packaging";
  unit: "g" | "kg" | "ml" | "l" | "unit" | "oz" | "lb";
  packPrice: number;
  packQuantity: number;
  unitCost: number; // cost per unit of measure
  inStock: number;
  minThreshold: number;
  supplier: string;
}

export interface RecipeItem {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  cost: number;
}

export interface Recipe {
  id: string;
  name: string;
  category: "Cakes" | "Breads" | "Pastries" | "Cookies";
  yieldUnits: number;
  prepMinutes: number;
  bakeMinutes: number;
  laborRatePerHour: number;
  laborHours: number;
  overheadCost: number;
  items: RecipeItem[];
  totalIngredientsCost: number;
  totalCost: number;
  costPerUnit: number;
  suggestedRetailPrice: number;
  targetMarginPct: number;
  actualMarginPct: number;
  unitsSold30d: number; // For Menu Engineering Matrix
  quadrant: "Star" | "Plowhorse" | "Puzzle" | "Dog";
  bakersPercentage?: {
    flourBaseGrams: number;
    hydrationPct: number;
    saltPct: number;
    fatPct: number;
  };
}

export interface OrderItem {
  id: string;
  recipeId: string;
  recipeName: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
}

export interface POSOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  profit: number;
  paymentMethod: "Cash" | "Card" | "UPI / QR" | "Online Invoice";
  status: "Completed" | "Pending" | "Ready for Pickup";
  createdAt: string;
}

export interface VendorPO {
  id: string;
  poNumber: string;
  supplierName: string;
  items: { ingredientName: string; quantity: number; unit: string; estimatedCost: number }[];
  totalEstimatedCost: number;
  status: "Draft" | "Sent to Vendor" | "Received";
  date: string;
}

export interface BakeScheduleItem {
  id: string;
  recipeName: string;
  batchCount: number;
  totalUnits: number;
  timeSlot: string;
  station: "Mixing" | "Proofing" | "Deck Oven" | "Decoration & Packing";
  status: "Pending" | "In Progress" | "Completed";
}

export const INITIAL_INGREDIENTS: Ingredient[] = [
  {
    id: "ing-1",
    name: "Valrhona Dutch Cocoa Powder",
    category: "Chocolate",
    unit: "g",
    packPrice: 42.0,
    packQuantity: 1000,
    unitCost: 0.042,
    inStock: 3500,
    minThreshold: 1000,
    supplier: "Valrhona Direct",
  },
  {
    id: "ing-2",
    name: "Organic Unsalted Grass-fed Butter",
    category: "Dairy",
    unit: "g",
    packPrice: 24.5,
    packQuantity: 1000,
    unitCost: 0.0245,
    inStock: 1850, // Low stock trigger
    minThreshold: 2000,
    supplier: "Horizon Dairy",
  },
  {
    id: "ing-3",
    name: "Fine Pastry Flour (T55)",
    category: "Flour & Grain",
    unit: "g",
    packPrice: 18.0,
    packQuantity: 5000,
    unitCost: 0.0036,
    inStock: 25000,
    minThreshold: 5000,
    supplier: "King Arthur Wholesale",
  },
  {
    id: "ing-4",
    name: "Castor Sugar (Superfine)",
    category: "Sugar & Sweetener",
    unit: "g",
    packPrice: 12.0,
    packQuantity: 5000,
    unitCost: 0.0024,
    inStock: 18000,
    minThreshold: 4000,
    supplier: "Domino Sugar Dist.",
  },
  {
    id: "ing-5",
    name: "Free-Range Pasture Eggs (Large)",
    category: "Dairy",
    unit: "unit",
    packPrice: 16.0,
    packQuantity: 30,
    unitCost: 0.533,
    inStock: 120,
    minThreshold: 40,
    supplier: "Happy Hen Farm",
  },
  {
    id: "ing-6",
    name: "Pure Madagascar Bourbon Vanilla",
    category: "Flavor & Leavening",
    unit: "ml",
    packPrice: 38.0,
    packQuantity: 500,
    unitCost: 0.076,
    inStock: 180, // Low stock trigger
    minThreshold: 200,
    supplier: "Nielsen-Massey",
  },
  {
    id: "ing-7",
    name: "Calbotech 70% Dark Chocolate Callets",
    category: "Chocolate",
    unit: "g",
    packPrice: 55.0,
    packQuantity: 2500,
    unitCost: 0.022,
    inStock: 6400,
    minThreshold: 2500,
    supplier: "Callebaut Logistics",
  },
  {
    id: "ing-8",
    name: "Heavy Whipping Cream 36%",
    category: "Dairy",
    unit: "ml",
    packPrice: 14.5,
    packQuantity: 1000,
    unitCost: 0.0145,
    inStock: 3200,
    minThreshold: 1500,
    supplier: "Horizon Dairy",
  },
  {
    id: "ing-9",
    name: "Eco-Kraft Artisan Cake Box (10x10)",
    category: "Packaging",
    unit: "unit",
    packPrice: 35.0,
    packQuantity: 50,
    unitCost: 0.7,
    inStock: 85,
    minThreshold: 30,
    supplier: "GreenBox Packaging",
  },
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: "rec-1",
    name: "Signature Chocolate Fudge Cake",
    category: "Cakes",
    yieldUnits: 10,
    prepMinutes: 45,
    bakeMinutes: 35,
    laborRatePerHour: 22.0,
    laborHours: 1.5,
    overheadCost: 5.5,
    items: [
      { ingredientId: "ing-1", ingredientName: "Valrhona Dutch Cocoa Powder", quantity: 350, unit: "g", cost: 14.7 },
      { ingredientId: "ing-2", ingredientName: "Organic Unsalted Butter", quantity: 500, unit: "g", cost: 12.25 },
      { ingredientId: "ing-3", ingredientName: "Fine Pastry Flour (T55)", quantity: 600, unit: "g", cost: 2.16 },
      { ingredientId: "ing-4", ingredientName: "Castor Sugar", quantity: 700, unit: "g", cost: 1.68 },
      { ingredientId: "ing-5", ingredientName: "Free-Range Pasture Eggs", quantity: 8, unit: "unit", cost: 4.26 },
      { ingredientId: "ing-6", ingredientName: "Pure Madagascar Vanilla", quantity: 20, unit: "ml", cost: 1.52 },
      { ingredientId: "ing-7", ingredientName: "Calbotech 70% Dark Callets", quantity: 450, unit: "g", cost: 9.9 },
      { ingredientId: "ing-8", ingredientName: "Heavy Whipping Cream 36%", quantity: 400, unit: "ml", cost: 5.8 },
      { ingredientId: "ing-9", ingredientName: "Eco-Kraft Cake Boxes", quantity: 10, unit: "unit", cost: 7.0 },
    ],
    totalIngredientsCost: 59.27,
    totalCost: 97.77,
    costPerUnit: 9.78,
    suggestedRetailPrice: 34.0,
    targetMarginPct: 70.0,
    actualMarginPct: 71.2,
    unitsSold30d: 84,
    quadrant: "Star", // High margin, high volume
    bakersPercentage: {
      flourBaseGrams: 600,
      hydrationPct: 66.7,
      saltPct: 1.2,
      fatPct: 83.3,
    },
  },
  {
    id: "rec-2",
    name: "Flaky French Butter Croissant",
    category: "Pastries",
    yieldUnits: 24,
    prepMinutes: 120,
    bakeMinutes: 20,
    laborRatePerHour: 22.0,
    laborHours: 2.0,
    overheadCost: 6.0,
    items: [
      { ingredientId: "ing-3", ingredientName: "Fine Pastry Flour (T55)", quantity: 1200, unit: "g", cost: 4.32 },
      { ingredientId: "ing-2", ingredientName: "Organic Butter (Tournage)", quantity: 800, unit: "g", cost: 19.6 },
      { ingredientId: "ing-4", ingredientName: "Castor Sugar", quantity: 120, unit: "g", cost: 0.29 },
      { ingredientId: "ing-5", ingredientName: "Free-Range Pasture Eggs", quantity: 2, unit: "unit", cost: 1.07 },
    ],
    totalIngredientsCost: 25.28,
    totalCost: 75.28,
    costPerUnit: 3.14,
    suggestedRetailPrice: 5.5,
    targetMarginPct: 60.0,
    actualMarginPct: 42.9, // Low margin due to high butter
    unitsSold30d: 320,
    quadrant: "Plowhorse", // High volume, low margin -> recommendation: increase price $0.75
    bakersPercentage: {
      flourBaseGrams: 1200,
      hydrationPct: 55.0,
      saltPct: 2.0,
      fatPct: 66.7,
    },
  },
  {
    id: "rec-3",
    name: "Artisan Sourdough Boule (Country White)",
    category: "Breads",
    yieldUnits: 12,
    prepMinutes: 60,
    bakeMinutes: 40,
    laborRatePerHour: 22.0,
    laborHours: 1.2,
    overheadCost: 4.0,
    items: [
      { ingredientId: "ing-3", ingredientName: "Fine Pastry Flour (T55)", quantity: 3000, unit: "g", cost: 10.8 },
      { ingredientId: "ing-4", ingredientName: "Castor Sugar", quantity: 50, unit: "g", cost: 0.12 },
    ],
    totalIngredientsCost: 10.92,
    totalCost: 41.32,
    costPerUnit: 3.44,
    suggestedRetailPrice: 9.5,
    targetMarginPct: 60.0,
    actualMarginPct: 63.8,
    unitsSold30d: 140,
    quadrant: "Star",
    bakersPercentage: {
      flourBaseGrams: 3000,
      hydrationPct: 75.0,
      saltPct: 2.2,
      fatPct: 0.0,
    },
  },
  {
    id: "rec-4",
    name: "Gluten-Free Pistachio Cardamom Tart",
    category: "Pastries",
    yieldUnits: 8,
    prepMinutes: 90,
    bakeMinutes: 25,
    laborRatePerHour: 22.0,
    laborHours: 1.8,
    overheadCost: 5.0,
    items: [
      { ingredientId: "ing-2", ingredientName: "Organic Unsalted Butter", quantity: 350, unit: "g", cost: 8.57 },
      { ingredientId: "ing-4", ingredientName: "Castor Sugar", quantity: 200, unit: "g", cost: 0.48 },
      { ingredientId: "ing-6", ingredientName: "Madagascar Vanilla", quantity: 15, unit: "ml", cost: 1.14 },
    ],
    totalIngredientsCost: 26.5,
    totalCost: 71.1,
    costPerUnit: 8.89,
    suggestedRetailPrice: 18.0,
    targetMarginPct: 50.0,
    actualMarginPct: 50.6,
    unitsSold30d: 18,
    quadrant: "Puzzle", // High margin, low volume -> recommendation: feature on counter display
  },
];

export const INITIAL_POS_ORDERS: POSOrder[] = [
  {
    id: "ord-101",
    orderNumber: "#ORD-8942",
    customerName: "Camilla Vance (Catering)",
    customerPhone: "+1 (555) 389-2041",
    items: [
      { id: "oi-1", recipeId: "rec-1", recipeName: "Signature Chocolate Fudge Cake", quantity: 2, unitPrice: 34.0, costPrice: 9.78 },
      { id: "oi-2", recipeId: "rec-2", recipeName: "Flaky French Butter Croissant", quantity: 12, unitPrice: 5.5, costPrice: 3.14 },
    ],
    subtotal: 134.0,
    tax: 10.72,
    discount: 0,
    total: 144.72,
    profit: 76.68,
    paymentMethod: "Card",
    status: "Completed",
    createdAt: "Today, 08:34 AM",
  },
  {
    id: "ord-102",
    orderNumber: "#ORD-8943",
    customerName: "Liam Sterling",
    customerPhone: "+1 (555) 712-4490",
    items: [
      { id: "oi-3", recipeId: "rec-3", recipeName: "Artisan Sourdough Boule", quantity: 3, unitPrice: 9.5, costPrice: 3.44 },
    ],
    subtotal: 28.5,
    tax: 2.28,
    discount: 0,
    total: 30.78,
    profit: 18.18,
    paymentMethod: "UPI / QR",
    status: "Completed",
    createdAt: "Today, 09:12 AM",
  },
];

export const INITIAL_BAKE_SCHEDULE: BakeScheduleItem[] = [
  {
    id: "bs-1",
    recipeName: "Artisan Sourdough Boule",
    batchCount: 3,
    totalUnits: 36,
    timeSlot: "05:00 AM - 06:30 AM",
    station: "Deck Oven",
    status: "Completed",
  },
  {
    id: "bs-2",
    recipeName: "Flaky French Butter Croissant",
    batchCount: 4,
    totalUnits: 96,
    timeSlot: "06:30 AM - 08:00 AM",
    station: "Proofing",
    status: "In Progress",
  },
  {
    id: "bs-3",
    recipeName: "Signature Chocolate Fudge Cake",
    batchCount: 2,
    totalUnits: 20,
    timeSlot: "09:00 AM - 11:00 AM",
    station: "Decoration & Packing",
    status: "Pending",
  },
];

export const INITIAL_VENDOR_POS: VendorPO[] = [
  {
    id: "po-1",
    poNumber: "#PO-301",
    supplierName: "Horizon Dairy",
    items: [
      { ingredientName: "Organic Unsalted Grass-fed Butter", quantity: 10, unit: "kg", estimatedCost: 245.0 },
      { ingredientName: "Heavy Whipping Cream 36%", quantity: 6, unit: "l", estimatedCost: 87.0 },
    ],
    totalEstimatedCost: 332.0,
    status: "Draft",
    date: "Nov 20, 2026",
  },
  {
    id: "po-2",
    poNumber: "#PO-302",
    supplierName: "Nielsen-Massey",
    items: [
      { ingredientName: "Pure Madagascar Bourbon Vanilla", quantity: 2, unit: "l", estimatedCost: 152.0 },
    ],
    totalEstimatedCost: 152.0,
    status: "Draft",
    date: "Nov 20, 2026",
  },
];
