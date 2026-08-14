from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(
    prefix="/inventory",
    tags=["inventory"],
)

@router.post("/", response_model=schemas.InventoryItemResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_item(item: schemas.InventoryItemCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_item = models.InventoryItem(**item.model_dump(), bakery_id=current_user.bakery_id)
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.get("/", response_model=List[schemas.InventoryItemResponse])
def get_inventory_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    items = db.query(models.InventoryItem).filter(models.InventoryItem.bakery_id == current_user.bakery_id).offset(skip).limit(limit).all()
    return items

@router.get("/low-stock", response_model=List[schemas.InventoryItemResponse])
def get_low_stock_items(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    items = db.query(models.InventoryItem).filter(
        models.InventoryItem.bakery_id == current_user.bakery_id,
        models.InventoryItem.quantity <= models.InventoryItem.low_stock_threshold
    ).all()
    return items

@router.get("/low-stock/whatsapp")
def get_low_stock_whatsapp_message(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    items = db.query(models.InventoryItem).filter(
        models.InventoryItem.bakery_id == current_user.bakery_id,
        models.InventoryItem.quantity <= models.InventoryItem.low_stock_threshold
    ).all()
    
    if not items:
        return {"message": "All stock is looking good!"}
        
    text = "Hello! I need to place an order for the following low-stock items:\n\n"
    for item in items:
        text += f"- {item.name} (Currently have {item.quantity}{item.unit}, usually order more when under {item.low_stock_threshold}{item.unit})\n"
        
    text += "\nPlease let me know when these can be delivered. Thank you!"
    return {"message": text}

@router.get("/public/{bakery_id}", response_model=List[schemas.InventoryItemResponse])
def get_public_inventory(bakery_id: int, db: Session = Depends(get_db)):
    # Verify bakery exists
    bakery = db.query(models.Bakery).filter(models.Bakery.id == bakery_id).first()
    if not bakery:
        raise HTTPException(status_code=404, detail="Bakery not found")
        
    items = db.query(models.InventoryItem).filter(models.InventoryItem.bakery_id == bakery_id).all()
    return items

@router.get("/{item_id}", response_model=schemas.InventoryItemResponse)
def get_inventory_item(item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id, models.InventoryItem.bakery_id == current_user.bakery_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

@router.put("/{item_id}", response_model=schemas.InventoryItemResponse)
def update_inventory_item(item_id: int, item: schemas.InventoryItemUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id, models.InventoryItem.bakery_id == current_user.bakery_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    update_data = item.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_item, key, value)
        
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory_item(item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id, models.InventoryItem.bakery_id == current_user.bakery_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    db.delete(db_item)
    db.commit()
    return None

@router.post("/{item_id}/batches", response_model=schemas.InventoryBatchResponse, status_code=status.HTTP_201_CREATED)
def create_inventory_batch(item_id: int, batch: schemas.InventoryBatchCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify item exists and belongs to user
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id, models.InventoryItem.bakery_id == current_user.bakery_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    db_batch = models.InventoryBatch(**batch.model_dump())
    db.add(db_batch)
    db.commit()
    db.refresh(db_batch)
    return db_batch

@router.get("/{item_id}/batches", response_model=List[schemas.InventoryBatchResponse])
def get_inventory_batches(item_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Verify item exists and belongs to user
    db_item = db.query(models.InventoryItem).filter(models.InventoryItem.id == item_id, models.InventoryItem.bakery_id == current_user.bakery_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    batches = db.query(models.InventoryBatch).filter(models.InventoryBatch.inventory_item_id == item_id).order_by(models.InventoryBatch.expiry_date.asc()).all()
    return batches
