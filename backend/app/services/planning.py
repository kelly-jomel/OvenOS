from typing import List, Dict

def generate_production_schedule(orders: List[Dict]) -> List[Dict]:
    """
    Groups items by oven temperature to maximize energy efficiency.
    Outputs a prep sheet indicating exactly what needs to be scaled and mixed.
    
    Expected order format:
    {
        "id": "ORD-123",
        "item": "Sourdough Bread",
        "bake_temp_celsius": 240,
        "prep_time_mins": 30,
        "bake_time_mins": 45
    }
    """
    
    # Sort orders by descending bake temperature (e.g. 240C breads first, then 180C cakes, then 150C cookies)
    sorted_orders = sorted(orders, key=lambda x: x.get('bake_temp_celsius', 180), reverse=True)
    
    schedule = []
    current_temp = None
    
    for order in sorted_orders:
        temp = order.get('bake_temp_celsius')
        
        # If temp changes, we could inject a "cool down" or "heat up" buffer block
        if current_temp is not None and current_temp != temp:
            schedule.append({
                "type": "transition",
                "message": f"Adjust oven from {current_temp}°C to {temp}°C"
            })
            
        schedule.append({
            "type": "bake",
            "order_id": order.get("id"),
            "item": order.get("item"),
            "temp": temp,
            "duration": order.get("bake_time_mins")
        })
        current_temp = temp
        
    return schedule
