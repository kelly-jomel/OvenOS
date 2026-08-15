from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from .. import models, database
from ..auth import verify_token
from pydantic import BaseModel
from typing import Optional, List
import google.generativeai as genai
import json

router = APIRouter(
    prefix="/ai",
    tags=["AI Recipe Import"]
)

class ImportRequest(BaseModel):
    source_type: str  # "photo", "url", "youtube"
    source_data: str  # base64 image data OR url string

class ParsedIngredient(BaseModel):
    name: str
    quantity: float
    unit: str

class ParsedRecipe(BaseModel):
    name: str
    description: str
    yield_amount: str
    prep_time_minutes: int
    bake_time_minutes: int
    ingredients: List[ParsedIngredient]

@router.post("/import")
async def import_recipe(
    request: ImportRequest,
    x_gemini_api_key: str = Header(..., description="Gemini API Key provided by the user"),
    db: Session = Depends(database.get_db),
    user: dict = Depends(verify_token)
):
    if not x_gemini_api_key:
        raise HTTPException(status_code=400, detail="Gemini API Key is required")
        
    genai.configure(api_key=x_gemini_api_key)
    
    # Configure model to return JSON
    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        generation_config={
            "response_mime_type": "application/json",
        }
    )
    
    prompt = """
    Extract the recipe details from the provided input. 
    Return a JSON object matching this schema exactly:
    {
      "name": "Recipe Name",
      "description": "Short description of the recipe",
      "yield_amount": "e.g. 12 cookies, 1 cake",
      "prep_time_minutes": 15,
      "bake_time_minutes": 30,
      "ingredients": [
        {
          "name": "Flour",
          "quantity": 250,
          "unit": "grams"
        }
      ]
    }
    Normalize units to metric (grams, ml) or pieces where possible. 
    Ensure quantity is a number.
    """
    
    try:
        if request.source_type == "photo":
            # Strip data URI header if present
            img_data = request.source_data
            if "," in img_data:
                img_data = img_data.split(",")[1]
                
            response = model.generate_content([
                {"mime_type": "image/jpeg", "data": img_data},
                prompt
            ])
        else:
            # For URL or YouTube, just pass the URL in the prompt
            # (Note: In a real app we'd fetch the HTML or use a youtube transcript API, 
            # but Gemini can sometimes read URLs directly or infer from the title)
            response = model.generate_content([
                f"Extract recipe from this URL: {request.source_data}",
                prompt
            ])
            
        result_json = json.loads(response.text)
        
        # Now, match ingredients against the database or create them with 0 stock
        bakery = db.query(models.Bakery).filter(models.Bakery.owner_id == user["uid"]).first()
        if not bakery:
            raise HTTPException(status_code=400, detail="Bakery not found")
            
        warnings = []
        matched_ingredients = []
        
        for ing in result_json.get("ingredients", []):
            # Try to find existing inventory item (case insensitive)
            db_item = db.query(models.InventoryItem).filter(
                models.InventoryItem.bakery_id == bakery.id,
                models.InventoryItem.name.ilike(f"%{ing['name']}%")
            ).first()
            
            if not db_item:
                # Create missing ingredient with 0 stock
                db_item = models.InventoryItem(
                    bakery_id=bakery.id,
                    name=ing['name'],
                    category="Ingredients",
                    unit=ing['unit'],
                    quantity_in_stock=0.0,
                    purchase_price=0.0,
                    low_stock_threshold=5.0
                )
                db.add(db_item)
                db.commit()
                db.refresh(db_item)
                warnings.append(f"Created new ingredient: {ing['name']} (0 stock).")
            
            matched_ingredients.append({
                "inventory_item_id": db_item.id,
                "name": db_item.name,
                "quantity": ing['quantity'],
                "unit": ing['unit']
            })
            
        result_json["ingredients"] = matched_ingredients
        result_json["warnings"] = warnings
        
        return result_json
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process recipe: {str(e)}")
