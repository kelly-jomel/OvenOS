from typing import Dict, Optional

# A simple conversion matrix for density.
# In a real app, this would be a database table linked to specific ingredients.
DENSITY_MATRIX: Dict[str, float] = {
    # e.g., grams per ml
    "flour": 0.59,
    "sugar": 0.85,
    "butter": 0.96,
    "water": 1.0,
    "milk": 1.03,
}

def convert_volume_to_weight(volume_ml: float, ingredient_type: str) -> float:
    """
    Translates volume to weight based on ingredient density.
    Returns weight in grams.
    """
    density = DENSITY_MATRIX.get(ingredient_type.lower(), 1.0) # default to water density if unknown
    return volume_ml * density

def calculate_true_ingredient_cost(
    purchase_price: float,
    purchase_quantity: float,
    recipe_quantity: float,
    usable_yield_percentage: float = 100.0
) -> float:
    """
    Calculates the true ingredient cost incorporating shrinkage/waste percentage.
    Formula: True Ingredient Cost = (Purchase Price / Usable Yield (%)) * (Recipe Quantity / Purchase Quantity)
    """
    if usable_yield_percentage <= 0 or purchase_quantity <= 0:
        return 0.0
    
    yield_factor = usable_yield_percentage / 100.0
    adjusted_purchase_price = purchase_price / yield_factor
    
    true_cost = adjusted_purchase_price * (recipe_quantity / purchase_quantity)
    return true_cost

def calculate_gross_margin(selling_price: float, total_batch_cost: float) -> float:
    """
    Calculates real-time profit margin.
    Formula: Gross Margin (%) = ((Selling Price - Total Batch Cost) / Selling Price) * 100
    """
    if selling_price <= 0:
        return 0.0
    
    margin = ((selling_price - total_batch_cost) / selling_price) * 100.0
    return margin
