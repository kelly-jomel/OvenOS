from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(
    prefix="/recipes",
    tags=["recipes"],
)

@router.post("/", response_model=schemas.RecipeResponse, status_code=status.HTTP_201_CREATED)
def create_recipe(recipe: schemas.RecipeCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_recipe = models.Recipe(
        name=recipe.name,
        description=recipe.description,
        yield_amount=recipe.yield_amount,
        image_data=recipe.image_data,
        bakery_id=current_user.bakery_id
    )
    db.add(db_recipe)
    db.commit()
    db.refresh(db_recipe)
    
    # Add ingredients
    for ing in recipe.ingredients:
        # Verify the inventory item belongs to this bakery
        inv_item = db.query(models.InventoryItem).filter(
            models.InventoryItem.id == ing.inventory_item_id,
            models.InventoryItem.bakery_id == current_user.bakery_id
        ).first()
        
        if not inv_item:
            # If they try to use an invalid or someone else's inventory item, fail
            db.delete(db_recipe)
            db.commit()
            raise HTTPException(status_code=400, detail=f"Invalid inventory item ID: {ing.inventory_item_id}")
            
        db_ing = models.RecipeIngredient(
            recipe_id=db_recipe.id,
            inventory_item_id=ing.inventory_item_id,
            quantity_required=ing.quantity_required
        )
        db.add(db_ing)
        
    db.commit()
    db.refresh(db_recipe)
    
    # We need to manually construct the response because ingredients aren't a direct SQLAlchemy relationship
    # (unless we set up relationships in models.py, which we didn't to keep it simple for now).
    # Let's fetch the ingredients.
    ingredients = db.query(models.RecipeIngredient).filter(models.RecipeIngredient.recipe_id == db_recipe.id).all()
    
    response = schemas.RecipeResponse(
        id=db_recipe.id,
        name=db_recipe.name,
        description=db_recipe.description,
        yield_amount=db_recipe.yield_amount,
        image_data=db_recipe.image_data,
        bakery_id=db_recipe.bakery_id,
        created_at=db_recipe.created_at,
        updated_at=db_recipe.updated_at,
        ingredients=[schemas.RecipeIngredientResponse(
            id=i.id,
            recipe_id=i.recipe_id,
            inventory_item_id=i.inventory_item_id,
            quantity_required=i.quantity_required
        ) for i in ingredients]
    )
    
    return response

@router.get("/", response_model=List[schemas.RecipeResponse])
def get_recipes(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    recipes = db.query(models.Recipe).filter(models.Recipe.bakery_id == current_user.bakery_id).offset(skip).limit(limit).all()
    
    result = []
    for r in recipes:
        ingredients = db.query(models.RecipeIngredient).filter(models.RecipeIngredient.recipe_id == r.id).all()
        result.append(schemas.RecipeResponse(
            id=r.id,
            name=r.name,
            description=r.description,
            yield_amount=r.yield_amount,
            image_data=r.image_data,
            bakery_id=r.bakery_id,
            created_at=r.created_at,
            updated_at=r.updated_at,
            ingredients=[schemas.RecipeIngredientResponse(
                id=i.id,
                recipe_id=i.recipe_id,
                inventory_item_id=i.inventory_item_id,
                quantity_required=i.quantity_required
            ) for i in ingredients]
        ))
        
    return result

@router.delete("/{recipe_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_recipe(recipe_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id, models.Recipe.bakery_id == current_user.bakery_id).first()
    if not recipe:
        raise HTTPException(status_code=404, detail="Recipe not found")
        
    # Delete associated ingredients
    db.query(models.RecipeIngredient).filter(models.RecipeIngredient.recipe_id == recipe_id).delete()
    db.delete(recipe)
    db.commit()
    return None
